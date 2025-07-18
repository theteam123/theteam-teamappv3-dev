/**
 * ERPNext DocType Reference Examples
 * Real-world DocType structures from ERPNext v15+ for AI reference
 * Used by Claude AI to understand proper DocType JSON formatting
 */

export const erpnextDocTypeReferences = `
## REFERENCE EXAMPLES OF PROPERLY STRUCTURED ERPNEXT DOCTYPES

These are real-world examples of properly structured DocTypes from ERPNext v15+ systems, showing correct field configurations, permissions, and metadata:

### EXAMPLE 1: PRIORITY FIELD DOCTYPE (High Priority Fields)
Shows basic field types that are most commonly used and have highest compatibility:

\`\`\`json
{
  "doctype": "DocType",
  "name": "Priority Field",
  "module": "Testing Only",
  "custom": 1,
  "istable": 0,
  "allow_import": 0,
  "allow_rename": 1,
  "track_changes": 0,
  "fields": [
    {
      "fieldname": "data",
      "label": "Data",
      "fieldtype": "Data",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0,
      "in_list_view": 0,
      "permlevel": 0
    },
    {
      "fieldname": "link",
      "label": "Link",
      "fieldtype": "Link",
      "options": "User",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0,
      "search_fields": ["full_name"]
    },
    {
      "fieldname": "select",
      "label": "Select",
      "fieldtype": "Select",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_chek",
      "label": "Test Check",
      "fieldtype": "Check",
      "default": "0",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "date",
      "label": "Date",
      "fieldtype": "Date",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "date_time",
      "label": "Date Time",
      "fieldtype": "Datetime",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "time",
      "label": "Time",
      "fieldtype": "Time",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "duration",
      "label": "Duration",
      "fieldtype": "Duration",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "small_text",
      "label": "Small Text",
      "fieldtype": "Small Text",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "long_text",
      "label": "Long Text",
      "fieldtype": "Long Text",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "text",
      "label": "Text",
      "fieldtype": "Text",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    }
  ],
  "permissions": [
    {
      "role": "System Manager",
      "permlevel": 0,
      "if_owner": 0,
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1,
      "submit": 0,
      "cancel": 0,
      "amend": 0,
      "report": 1,
      "export": 1,
      "import": 0,
      "share": 1,
      "print": 1,
      "email": 1
    }
  ]
}
\`\`\`

### EXAMPLE 2: MEDIUM PRIORITY FIELDS DOCTYPE (Advanced Features)
Shows advanced field types including tables, dynamic links, and specialized fields:

\`\`\`json
{
  "doctype": "DocType",
  "name": "Medium Priority Fields",
  "module": "Testing Only",
  "custom": 1,
  "istable": 0,
  "allow_import": 0,
  "allow_rename": 1,
  "track_changes": 0,
  "fields": [
    {
      "fieldname": "tables_section",
      "label": "Tables",
      "fieldtype": "Section Break",
      "hidden": 0,
      "collapsible": 0
    },
    {
      "fieldname": "signature_field",
      "label": "Signature",
      "fieldtype": "Signature",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_gelocation_map",
      "label": "Test Geolocation Map",
      "fieldtype": "Geolocation",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_table",
      "label": "Test Table",
      "fieldtype": "Table",
      "options": "Sample Table List",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "table_make",
      "label": "Table Make",
      "fieldtype": "Table",
      "options": "Make Details",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "read_only",
      "label": "Read Only",
      "fieldtype": "Read Only",
      "in_list_view": 1,
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_text",
      "label": "Test Text",
      "fieldtype": "Small Text",
      "in_list_view": 1,
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_multiselect",
      "label": "Test MultiSelect",
      "fieldtype": "Table MultiSelect",
      "options": "Make Details",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "doc_link",
      "label": "Link",
      "fieldtype": "Link",
      "options": "DocType",
      "linked_document_type": "Document",
      "search_fields": ["module"],
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "dynamic_link",
      "label": "Dynamic Link",
      "fieldtype": "Dynamic Link",
      "options": "doc_link",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    }
  ],
  "permissions": [
    {
      "role": "System Manager",
      "permlevel": 0,
      "if_owner": 0,
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1,
      "submit": 0,
      "cancel": 0,
      "amend": 0,
      "report": 1,
      "export": 1,
      "import": 0,
      "share": 1,
      "print": 1,
      "email": 1
    }
  ]
}
\`\`\`

### EXAMPLE 3: CHILD TABLE DOCTYPE (Sample Table List)
Shows proper child table structure with istable: 1:

\`\`\`json
{
  "doctype": "DocType",
  "name": "Sample Table List",
  "module": "Testing Only",
  "custom": 1,
  "istable": 1,
  "allow_import": 0,
  "allow_rename": 1,
  "track_changes": 0,
  "fields": [
    {
      "fieldname": "table_list_section",
      "label": "Table List",
      "fieldtype": "Section Break",
      "hidden": 0,
      "collapsible": 0
    },
    {
      "fieldname": "list_of_test",
      "label": "List of Test",
      "fieldtype": "Data",
      "in_list_view": 1,
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "small_text",
      "label": "Small Text",
      "fieldtype": "Small Text",
      "in_list_view": 1,
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "test_select_radio",
      "label": "Test Select Radio",
      "fieldtype": "Select",
      "options": "Test 1\\ntest 2",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    }
  ]
}
\`\`\`

### EXAMPLE 4: LOW PRIORITY FIELDS DOCTYPE (Specialized Field Types)
Shows specialized and less common field types:

\`\`\`json
{
  "doctype": "DocType",
  "name": "Low Priority Field",
  "module": "Testing Only",
  "custom": 1,
  "istable": 0,
  "allow_import": 0,
  "allow_rename": 1,
  "track_changes": 0,
  "fields": [
    {
      "fieldname": "low_priority_field_section",
      "label": "Low Priority Field",
      "fieldtype": "Section Break",
      "hidden": 0,
      "collapsible": 0
    },
    {
      "fieldname": "password",
      "label": "Password",
      "fieldtype": "Password",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "barcode",
      "label": "Barcode",
      "fieldtype": "Barcode",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "rating",
      "label": "Rating",
      "fieldtype": "Rating",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "color",
      "label": "Color",
      "fieldtype": "Color",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    },
    {
      "fieldname": "html",
      "label": "HTML",
      "fieldtype": "HTML",
      "reqd": 0,
      "hidden": 0,
      "read_only": 0
    }
  ],
  "permissions": [
    {
      "role": "System Manager",
      "permlevel": 0,
      "if_owner": 0,
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1,
      "submit": 0,
      "cancel": 0,
      "amend": 0,
      "report": 1,
      "export": 1,
      "import": 0,
      "share": 1,
      "print": 1,
      "email": 1
    }
  ]
}
\`\`\`

## KEY STRUCTURAL PATTERNS FROM EXAMPLES

### Essential DocType Properties
- **name**: DocType name (required, unique)
- **module**: Module name (default: "Custom")
- **custom**: Always 1 for custom DocTypes
- **istable**: 0 for main DocType, 1 for child tables
- **allow_import**: Usually 0
- **allow_rename**: Usually 1
- **track_changes**: Usually 0

### Field Structure Requirements
- **fieldname**: Unique field identifier (lowercase, underscores)
- **label**: Display name for the field
- **fieldtype**: ERPNext field type
- **reqd**: 0 or 1 (required field)
- **hidden**: 0 or 1 (field visibility)
- **read_only**: 0 or 1 (edit permissions)
- **permlevel**: Permission level (usually 0)

### Field Type Specific Properties
- **Link fields**: Require "options" property with target DocType
- **Select fields**: Use "options" with newline-separated values
- **Table fields**: Use "options" with child DocType name, require istable: 1 child
- **Dynamic Link**: Use "options" pointing to Link field with DocType reference
- **Check fields**: Use "default": "0" or "1"

### Permission Structure
- **role**: Role name (e.g., "System Manager")
- **permlevel**: Permission level (usually 0)
- **if_owner**: 0 or 1 (owner-only permissions)
- **read, write, create, delete**: Basic CRUD permissions (0 or 1)
- **submit, cancel, amend**: Document workflow permissions (0 or 1)
- **report, export, import, share, print, email**: Additional permissions (0 or 1)

### Dynamic Link Implementation Pattern
Always create the Link field first, then reference it in the Dynamic Link field:
\`\`\`json
// Step 1: Create Link field for DocType selection
{
  "fieldname": "reference_doctype",
  "fieldtype": "Link",
  "options": "DocType"
}
// Step 2: Create Dynamic Link field that references the Link field
{
  "fieldname": "reference_document", 
  "fieldtype": "Dynamic Link",
  "options": "reference_doctype"
}
\`\`\`

### Child Table Pattern
Main DocType with Table field:
\`\`\`json
{
  "fieldname": "items_table",
  "fieldtype": "Table", 
  "options": "My Child DocType"
}
\`\`\`

Corresponding Child DocType:
\`\`\`json
{
  "name": "My Child DocType",
  "istable": 1,
  "fields": [...]
}
\`\`\`
`; 