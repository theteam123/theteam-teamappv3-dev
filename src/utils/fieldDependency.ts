import { useAuthStore } from '../stores/auth';

interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  mandatory_depends_on?: string;
  columnIndex?: number;
}

export function evaluateFieldDependency(
  field: FormField, 
  formData: Record<string, any> | undefined,
  dependencyType: 'depends_on' | 'mandatory_depends_on' = 'depends_on',
  debug: boolean = false
): boolean {
  if (debug) {
    console.log('\nEvaluating dependency for field:', {
      fieldname: field.fieldname,
      label: field.label,
      depends_on: field.depends_on,
      mandatory_depends_on: field.mandatory_depends_on,
      evaluating: dependencyType
    });
  }

  if (!field[dependencyType]) {
    if (debug) {
      console.log(`No ${dependencyType} condition, returning ${dependencyType === 'depends_on' ? 'true' : String(field.reqd === 1)}`);
    }
    return dependencyType === 'depends_on' ? true : field.reqd === 1;
  }
  
  const dependsOn = field[dependencyType];
  if (!dependsOn.startsWith('eval:doc.')) {
    if (debug) {
      console.log(`${dependencyType} does not start with eval:doc., returning ${dependencyType === 'depends_on' ? 'true' : String(field.reqd === 1)}`);
    }
    return dependencyType === 'depends_on' ? true : field.reqd === 1;
  }

  try {
    const condition = dependsOn.replace('eval:doc.', '');
    if (debug) {
      console.log('Processing condition:', condition);
    }
    
    // Replace field references with their values
    let evalCondition = condition;
    
    // First, remove any trailing semicolons and handle the doc. prefix stripping
    evalCondition = evalCondition.replace(/;/g, '').replace(/doc\./g, '').trim();

    if (  !(evalCondition.includes('==') || evalCondition.includes('!=')) ) {
      if (debug) {
        console.log('No condition:', evalCondition);
      }
      evalCondition = evalCondition + ' != ""';
    }
    
    // Split the condition on both && and || to handle each part separately
    const parts = evalCondition.split(/(?:&&|\|\|)/).map(part => part.trim());
    const operators = evalCondition.match(/(?:&&|\|\|)/g) || [];
    if (debug) {
      console.log('Condition parts:', parts);
      console.log('Operators:', operators);
    }
    
    // Process each part of the condition
    const processedParts = parts.map(part => {
      // Check for both == and != operators
      if (!part.includes('==') && !part.includes('!=')) {
        if (debug) {
          console.log('Part does not include == or !=, returning:', part);
        }
        return part;
      }
      
      // Split on either == or != operator
      const operator = part.includes('==') ? '==' : '!=';
      const [fieldName, value] = part.split(operator).map(s => s.trim().replace(/['"]/g, ''));
      const rawFieldValue = formData?.[fieldName];
      if (debug) {
        console.log('Field Data', formData);
        console.log('Raw field name:', fieldName);
        console.log('Raw field value:', rawFieldValue);
      }
      // Treat 'false' string as empty string
      const fieldValue = rawFieldValue === false ? '' : rawFieldValue;
      
      if (debug) {
        console.log('Processing comparison:', {
          fieldName,
          rawFieldValue,
          fieldValue,
          operator,
          compareValue: value
        });
      }
      
      // Special handling for login_user_role field
      if (fieldName === 'login_user_role') {
        const authStore = useAuthStore();
        const roles = authStore.user?.roles || [];
        const targetRole = value.trim();
        console.log('roles', roles);
        console.log('targetRole', targetRole);
        if (operator === '==') {
          console.log('roles.includes(targetRole)', roles.includes(targetRole));
          return String(roles.includes(targetRole));
        } else if (operator === '!=') {
          console.log('roles.includes(targetRole)', roles.includes(targetRole));
          return String(!roles.includes(targetRole));
        }
      }

      if (fieldValue === undefined || fieldValue === null) {
        return 'false';
      }
      
      return `'${fieldValue}' ${operator} '${value}'`;
    });
    
    // Rejoin the parts with &&
    evalCondition = processedParts.join(` ${operators[0]} `);
    if (debug) {
      console.log('Final condition to evaluate:', evalCondition);
    }

    // Check if there are any remaining doc. references that weren't replaced
    if (evalCondition.includes('doc.')) {
      if (debug) {
        console.warn('Unhandled field references in condition:', evalCondition);
      }
      return dependencyType === 'depends_on' ? true : field.reqd === 1;
    }

    // Safely evaluate the condition
    const evaluateCondition = (condition: string): boolean => {
      if (debug) {
        console.log('Evaluating condition:', condition);
      }

      // Handle simple boolean values
      if (condition === 'true') return true;
      if (condition === 'false') return false;

      // Handle AND and OR conditions
      if (condition.includes('&&') || condition.includes('||')) {
        const parts = condition.split(/(?:&&|\|\|)/).map(s => s.trim());
        const operators = condition.match(/(?:&&|\|\|)/g) || [];
        if (debug) {
          console.log('Evaluating complex condition parts:', parts);
          console.log('Operators:', operators);
        }

        // Evaluate first part
        let result = evaluateCondition(parts[0]);

        // Process remaining parts with their operators
        for (let i = 0; i < operators.length; i++) {
          const nextPart = evaluateCondition(parts[i + 1]);
          if (operators[i] === '&&') {
            result = result && nextPart;
          } else if (operators[i] === '||') {
            result = result || nextPart;
          }
        }
        return result;
      }

      // Handle single comparison
      if (condition.includes('==') || condition.includes('!=')) {
        const operator = condition.includes('==') ? '==' : '!=';
        const [left, right] = condition.split(operator).map(s => 
          s.trim().replace(/['"]/g, '').replace(/;/g, '')
        );
        if (debug) {
          console.log('Comparing values:', { left, right, operator });
        }
        
        // Helper function to normalize boolean-like values
        const normalizeValue = (val: string): string => {
          if (val === 'true' || val === '1') return 'true';
          if (val === 'false' || val === '0') return 'false';
          return val;
        };
        
        const normalizedLeft = normalizeValue(left);
        const normalizedRight = normalizeValue(right);
        if (debug) {
          console.log('normalizedLeft', normalizedLeft);
          console.log('normalizedRight', normalizedRight);
        }
        
        return operator === '==' 
          ? normalizedLeft === normalizedRight 
          : normalizedLeft !== normalizedRight;
      }

      return true;
    };
    
    const finalResult = evaluateCondition(evalCondition);
    if (debug) {
      console.log('Final evaluation result:', finalResult);
    }
    return finalResult;
  } catch (error) {
    console.error('Error evaluating field dependency:', error);
    return dependencyType === 'depends_on' ? true : field.reqd === 1;
  }
} 