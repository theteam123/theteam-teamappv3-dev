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
  console.log('\nEvaluating dependency for field:', {
    fieldname: field.fieldname,
    label: field.label,
    depends_on: field.depends_on
  });

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
    console.log('Processing condition:', condition);
    
    // Handle simple field existence check
    if (!condition.includes('!=') && !condition.includes('==') && !condition.includes('&&')) {
      const result = !!formData?.[condition];
      console.log('Simple field existence check:', {
        field: condition,
        value: formData?.[condition],
        result
      });
      return result;
    }

    // Replace field references with their values
    let evalCondition = condition;
    const fieldMatches = condition.match(/doc\.([a-zA-Z0-9_]+)/g) || [];
    console.log('Found field references:', fieldMatches);
    
    fieldMatches.forEach(match => {
      const fieldName = match.replace('doc.', '');
      const fieldValue = formData?.[fieldName];
      console.log('Processing field reference:', {
        match,
        fieldName,
        fieldValue
      });

      // Handle undefined/null values
      if (fieldValue === undefined || fieldValue === null) {
        console.log('Field value is undefined/null, replacing with false');
        evalCondition = evalCondition.replace(match, 'false');
      } else {
        // Handle string values by wrapping them in quotes
        const value = typeof fieldValue === 'string' ? `'${fieldValue}'` : fieldValue;
        console.log('Replacing field reference with value:', {
          match,
          value
        });
        evalCondition = evalCondition.replace(match, value);
      }
    });

    console.log('Condition after field value replacement:', evalCondition);
    
    // Check if there are any remaining doc. references that weren't replaced
    if (evalCondition.includes('doc.')) {
      console.warn('Unhandled field references in condition:', evalCondition);
      return true;
    }

    // Safely evaluate the condition
    const evaluateCondition = (condition: string): boolean => {
      console.log('Evaluating condition:', condition);

      // Handle simple boolean values
      if (condition === 'true') {
        console.log('Condition is true');
        return true;
      }
      if (condition === 'false') {
        console.log('Condition is false');
        return false;
      }

      // Clean up values for comparison
      const cleanValue = (value: string): string => {
        // Remove semicolons and trim
        value = value.replace(/;/g, '').trim();
        // Remove extra quotes if they exist
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        return value;
      };

      // Handle comparisons
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map(s => s.trim());
        const leftValue = formData?.[left] ?? left; // Get value from formData if it's a field name
        const rightValue = cleanValue(right);
        
        const result = leftValue == rightValue; // Using loose comparison
        console.log('Loose equality comparison:', {
          fieldName: left,
          fieldValue: leftValue,
          compareValue: rightValue,
          result,
          originalLeft: left,
          originalRight: right
        });
        return result;
      }
      if (condition.includes('!=')) {
        const [left, right] = condition.split('!=').map(s => s.trim());
        const leftValue = formData?.[left] ?? left; // Get value from formData if it's a field name
        const rightValue = cleanValue(right);
        
        const result = leftValue != rightValue; // Using loose comparison
        console.log('Loose inequality comparison:', {
          fieldName: left,
          fieldValue: leftValue,
          compareValue: rightValue,
          result,
          originalLeft: left,
          originalRight: right
        });
        return result;
      }

      // Handle AND conditions
      if (condition.includes('&&')) {
        const parts = condition.split('&&').map(s => s.trim());
        console.log('AND condition parts:', parts);
        const result = parts.every(part => evaluateCondition(part));
        console.log('AND condition result:', result);
        return result;
      }

      // Handle OR conditions
      if (condition.includes('||')) {
        const parts = condition.split('||').map(s => s.trim());
        console.log('OR condition parts:', parts);
        const result = parts.some(part => evaluateCondition(part));
        console.log('OR condition result:', result);
        return result;
      }

      // If we can't evaluate, return true to show the field
      console.warn('Unable to evaluate condition:', condition);
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