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
  tab_id?: string;
}

interface FormSection {
  title: string;
  columnCount: number;
  fields: FormField[];
  hidden: boolean;
  tab_id?: string;
  columnLabels: string[];
}

interface FormTab {
  id: string;
  label: string;
  sections: FormSection[];
  hidden: boolean;
}

interface ProcessedSections {
  tabs: FormTab[];
  hasTabs: boolean;
  sections: FormSection[];
}

export function useFormSections(fields: Ref<FormField[] | undefined>, formData?: Ref<Record<string, any> | undefined>, docTypeTable?: Ref<FormField[] | undefined>) {
  const processedSections = computed<ProcessedSections>(() => {
    if (!fields.value) return {
      tabs: [],
      hasTabs: false,
      sections: []
    };

    let tabs: FormTab[] = [];
    let currentTab: FormTab | null = null;
    let sections: FormSection[] = [];
    let currentSection: FormSection = {
      title: '',
      columnCount: 0,
      fields: [],
      hidden: false,
      columnLabels: []
    };

    fields.value.forEach((field, index) => {
      if (field.fieldtype === 'Tab Break') {
        if (currentSection.fields.length > 0) {
          if (currentTab) {
            currentTab.sections.push({ ...currentSection });
          } else {
            sections.push({ ...currentSection });
          }
        }

        const shouldShowTab = !field.depends_on || evaluateFieldDependency(field, formData?.value);
        currentTab = {
          id: field.fieldname,
          label: field.label || '',
          sections: [],
          hidden: field.hidden === 1 || !shouldShowTab
        };
        tabs.push(currentTab);

        currentSection = {
          title: '',
          columnCount: 0,
          fields: [],
          hidden: false,
          tab_id: currentTab.id,
          columnLabels: []
        };
      } else if (field.fieldtype === 'Section Break') {
        if (currentSection.fields.length > 0) {
          if (currentTab) {
            currentTab.sections.push({ ...currentSection });
          } else {
            sections.push({ ...currentSection });
          }
        }

        const shouldShowSection = !field.depends_on || evaluateFieldDependency(field, formData?.value);
        currentSection = {
          title: field.label || '',
          columnCount: 0,
          fields: [],
          hidden: field.hidden === 1 || !shouldShowSection,
          tab_id: currentTab?.id,
          columnLabels: []
        };
      } else if (field.fieldtype === 'Column Break') {
        console.log('Column Break Label', field.label);
        console.log('Column Break Fieldname', field.fieldname);
        console.log('Column Break', field);
        if (!currentSection.hidden) {
          currentSection.columnCount++;
          currentSection.columnLabels.push(field.label || '');
        }
      } else if (!currentSection.hidden) {
        let table = docTypeTable?.value?.find(table => table.name === field.options);
        let tableFields = table?.fields;
        currentSection.fields.push({
          tableFields: tableFields,
          ...field,
          columnIndex: currentSection.columnCount,
          tab_id: currentTab?.id
        });
      }
    });

    if (currentSection.fields.length > 0) {
      if (currentTab) {
        currentTab.sections.push({ ...currentSection });
      } else {
        sections.push({ ...currentSection });
      }
    }

    const finalTabs = tabs.filter(tab => 
      !tab.hidden && 
      tab.sections.some(section => 
        !section.hidden && section.fields.length > 0
      )
    );
    console.log('Final Tabs', finalTabs);
    console.log('Sections', sections);

    return {
      tabs: finalTabs,
      hasTabs: finalTabs.length > 0,
      sections: finalTabs.length === 0 ? sections : []
    };
  });

  return {
    processedSections
  };
} 