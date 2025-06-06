interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  columnIndex?: number;
}

export function evaluateFieldDependency(field: FormField, formData: Record<string, any> | undefined): boolean {
  /* console.log('\nEvaluating dependency for field:', {
    fieldname: field.fieldname,
    label: field.label,
    depends_on: field.depends_on
  }); */

  if (!field.depends_on) {
    console.log('No dependency condition, showing field');
    return true;
  }
  
  const dependsOn = field.depends_on;
  if (!dependsOn.startsWith('eval:doc.')) {
    console.log('Dependency does not start with eval:doc., showing field');
    return true;
  }

  try {
    const condition = dependsOn.replace('eval:doc.', '');
    // console.log('Processing condition:', condition);
    
    // Replace field references with their values
    let evalCondition = condition;
    
    // First, remove any trailing semicolons and handle the doc. prefix stripping
    evalCondition = evalCondition.replace(/;/g, '').replace(/doc\./g, '').trim();
    
    // Split the condition on && to handle each part separately
    const parts = evalCondition.split('&&').map(part => part.trim());
    // console.log('Condition parts:', parts);
    
    // Process each part of the condition
    const processedParts = parts.map(part => {
      // Check for both == and != operators
      if (!part.includes('==') && !part.includes('!=')) {
        // console.log('Part does not include == or !=, returning:', part);
        return part;
      }
      
      // Split on either == or != operator
      const operator = part.includes('==') ? '==' : '!=';
      const [fieldName, value] = part.split(operator).map(s => s.trim().replace(/['"]/g, ''));
      // console.log('Field Data', formData);
      const rawFieldValue = formData?.[fieldName];
      // console.log('Raw field name:', fieldName);
      // console.log('Raw field value:', rawFieldValue);
      // Treat 'false' string as empty string
      const fieldValue = rawFieldValue === false ? '' : rawFieldValue;
      
      // console.log('Processing comparison:', {
      //   fieldName,
      //   rawFieldValue,
      //   fieldValue,
      //   operator,
      //   compareValue: value
      // });
      
      if (fieldValue === undefined || fieldValue === null) {
        return 'false';
      }
      
      return `'${fieldValue}' ${operator} '${value}'`;
    });
    
    // Rejoin the parts with &&
    evalCondition = processedParts.join(' && ');
    // console.log('Final condition to evaluate:', evalCondition);

    // Check if there are any remaining doc. references that weren't replaced
    if (evalCondition.includes('doc.')) {
      // console.warn('Unhandled field references in condition:', evalCondition);
      return true;
    }

    // Safely evaluate the condition
    const evaluateCondition = (condition: string): boolean => {
      // console.log('Evaluating condition:', condition);

      // Handle simple boolean values
      if (condition === 'true') return true;
      if (condition === 'false') return false;

      // Handle AND conditions first
      if (condition.includes('&&')) {
        const parts = condition.split('&&').map(s => s.trim());
        console.log('Evaluating AND parts:', parts);
        return parts.every(part => evaluateCondition(part));
      }

      // Handle single comparison
      if (condition.includes('==') || condition.includes('!=')) {
        const operator = condition.includes('==') ? '==' : '!=';
        const [left, right] = condition.split(operator).map(s => 
          s.trim().replace(/['"]/g, '').replace(/;/g, '')
        );
        console.log('Comparing values:', { left, right, operator });
        
        // Helper function to normalize boolean-like values
        const normalizeValue = (val: string): string => {
          if (val === 'true' || val === '1') return 'true';
          if (val === 'false' || val === '0') return 'false';
          return val;
        };
        
        const normalizedLeft = normalizeValue(left);
        const normalizedRight = normalizeValue(right);
        
        return operator === '==' 
          ? normalizedLeft === normalizedRight 
          : normalizedLeft !== normalizedRight;
      }

      return true;
    };
    
    const finalResult = evaluateCondition(evalCondition);
    console.log('Final evaluation result:', finalResult);
    return finalResult;
  } catch (error) {
    console.error('Error evaluating field dependency:', error);
    return true;
  }
} 