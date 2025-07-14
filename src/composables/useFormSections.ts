import { computed, ref, Ref } from 'vue';
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
  collapsible?: number;
  name?: string; // For table doctypes
  fields?: FormField[]; // For table doctypes
  tableFields?: FormField[]; // For fields that reference table doctypes
}

interface FormSection {
  title: string;
  columnCount: number;
  fields: FormField[];
  hidden: boolean;
  tab_id?: string;
  columnLabels: string[];
  collapsible?: boolean;
  collapsed?: boolean;
  sectionKey?: string;
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
  // Track collapsed state separately for reactivity
  const collapsedSections = ref<Record<string, boolean>>({});
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
      columnLabels: [],
      collapsible: false,
      collapsed: false,
      sectionKey: undefined
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
        const sectionKey = `${currentTab?.id || 'main'}_${field.fieldname}`;
        
        // Initialize collapsed state if not set
        if (field.collapsible === 1 && !(sectionKey in collapsedSections.value)) {
          collapsedSections.value[sectionKey] = true; // Start collapsed by default
        }
        
        currentSection = {
          title: field.label || '',
          columnCount: 0,
          fields: [],
          hidden: field.hidden === 1 || !shouldShowSection,
          tab_id: currentTab?.id,
          columnLabels: [],
          collapsible: field.collapsible === 1,
          collapsed: collapsedSections.value[sectionKey] || false,
          sectionKey: sectionKey
        };
      } else if (field.fieldtype === 'Column Break') {
        // console.log('Column Break Label', field.label);
        // console.log('Column Break Fieldname', field.fieldname);
        // console.log('Column Break', field);
        if (!currentSection.hidden) {
          currentSection.columnCount++;
          currentSection.columnLabels.push(field.label || '');
        }
      } else {
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
        (currentTab as FormTab).sections.push({ ...currentSection });
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
    // console.log('Final Tabs', finalTabs);
    // console.log('Sections', sections);

    return {
      tabs: finalTabs,
      hasTabs: finalTabs.length > 0,
      sections: finalTabs.length === 0 ? sections : []
    };
  });

  const toggleSectionCollapse = (sectionIndex: number, tabId?: string) => {
    let section: FormSection | undefined;
    
    if (tabId) {
      // Handle tabbed sections
      const tabIndex = processedSections.value.tabs.findIndex(tab => tab.id === tabId);
      if (tabIndex !== -1 && processedSections.value.tabs[tabIndex].sections[sectionIndex]) {
        section = processedSections.value.tabs[tabIndex].sections[sectionIndex];
      }
    } else {
      // Handle non-tabbed sections
      if (processedSections.value.sections[sectionIndex]) {
        section = processedSections.value.sections[sectionIndex];
      }
    }
    
    if (section && section.sectionKey) {
      const currentState = collapsedSections.value[section.sectionKey] || false;
      collapsedSections.value[section.sectionKey] = !currentState;
    }
  };

  return {
    processedSections,
    toggleSectionCollapse
  };
} 