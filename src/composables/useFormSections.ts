import { computed, Ref } from 'vue';

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

export function useFormSections(fields: Ref<FormField[] | undefined>) {
  const processedSections = computed(() => {
    if (!fields.value) return [];

    let sections: FormSection[] = [];
    let currentSection: FormSection = {
      title: '',
      columnCount: 0,
      fields: [],
      hidden: false
    };

    fields.value.forEach(field => {
      if (field.fieldtype === 'Section Break') {
        if (currentSection.fields.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: field.label || '',
          columnCount: 0,
          fields: [],
          hidden: field.hidden === 1
        };
      } else if (field.fieldtype === 'Column Break') {
        if (!currentSection.hidden) {
          currentSection.columnCount++;
        }
      } else if (!field.hidden && !currentSection.hidden) {
        currentSection.fields.push({
          ...field,
          columnIndex: currentSection.columnCount
        });
      }
    });

    // Add the last section if it has fields
    if (currentSection.fields.length > 0 && !currentSection.hidden) {
      sections.push(currentSection);
    }

    // If no sections were created but we have fields, create a default section
    if (sections.length === 0 && fields.value.length > 0) {
      sections.push({
        title: '',
        columnCount: 0,
        fields: fields.value.filter(f => !f.hidden && !['Section Break', 'Column Break'].includes(f.fieldtype)),
        hidden: false
      });
    }

    return sections;
  });

  return {
    processedSections
  };
} 