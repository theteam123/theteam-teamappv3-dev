import { computed, Ref } from 'vue';
import { evaluateFieldDependency } from '../utils/fieldDependency';

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

interface FormSection {
  title: string;
  columnCount: number;
  fields: FormField[];
  hidden: boolean;
}

export function useFormSections(fields: Ref<FormField[] | undefined>, formData?: Ref<Record<string, any> | undefined>) {
  const processedSections = computed(() => {
    if (!fields.value) return [];

    let sections: FormSection[] = [];
    let currentSection: FormSection = {
      title: '',
      columnCount: 0,
      fields: [],
      hidden: false
    };

    console.log('Starting to process fields:', fields.value);
    console.log('Form data:', formData?.value);

    fields.value.forEach((field, index) => {
      console.log(`\nProcessing field ${index}:`, {
        fieldname: field.fieldname,
        fieldtype: field.fieldtype,
        label: field.label,
        depends_on: field.depends_on
      });

      if (field.fieldtype === 'Section Break') {
        console.log('Found Section Break:', field.label);
        
        if (currentSection.fields.length > 0) {
          console.log('Adding current section to sections:', currentSection);
          sections.push(currentSection);
        }

        // Check if section should be hidden based on depends_on
        const shouldShowSection = !field.depends_on || evaluateFieldDependency(field, formData?.value);
        console.log('Section visibility check:', {
          depends_on: field.depends_on,
          shouldShowSection,
          formData: formData?.value
        });

        currentSection = {
          title: field.label || '',
          columnCount: 0,
          fields: [],
          hidden: field.hidden === 1 || !shouldShowSection
        };
        console.log('Created new section:', currentSection);
      } else if (field.fieldtype === 'Column Break') {
        console.log('Found Column Break');
        if (!currentSection.hidden) {
          currentSection.columnCount++;
          console.log('Incremented column count:', currentSection.columnCount);
        }
      } else if (!field.hidden && !currentSection.hidden) {
        console.log('Adding field to current section:', field.fieldname);
        currentSection.fields.push({
          ...field,
          columnIndex: currentSection.columnCount
        });
        console.log('Current section after adding field:', currentSection);
      }
    });

    // Add the last section if it has fields
    if (currentSection.fields.length > 0 && !currentSection.hidden) {
      console.log('\nAdding final section:', currentSection);
      sections.push(currentSection);
    }

    // If no sections were created but we have fields, create a default section
    if (sections.length === 0 && fields.value.length > 0) {
      console.log('\nNo sections created, creating default section');
      const visibleFields = fields.value.filter(f => 
        !f.hidden && 
        !['Section Break', 'Column Break'].includes(f.fieldtype)
      );
      
      if (visibleFields.length > 0) {
        sections.push({
          title: '',
          columnCount: 0,
          fields: visibleFields,
          hidden: false
        });
        console.log('Created default section with fields:', visibleFields.map(f => f.fieldname));
      }
    }

    // Filter out sections that have no visible fields
    const finalSections = sections.filter(section => section.fields.length > 0);
    console.log('\nFinal sections:', finalSections);
    return finalSections;
  });

  return {
    processedSections
  };
} 