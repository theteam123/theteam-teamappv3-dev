/**
 * Project Knowledge Configuration
 * Contains the comprehensive DocType generation knowledge base
 * Used by the enhanced Claude AI service for context
 * 
 */

export const projectKnowledge = `
## Key Capabilities

### DocType Generation
- Generates main DocTypes with complex field structures including child tables, conditional fields, and automated calculations
- Creates child DocTypes for table relationships with proper field mappings
- Implements all supported field types optimized for web/mobile interfaces:
  - **Basic**: Data, Int/Float, Date/Datetime/Time, Duration, Select, Link, Check, Text variants
  - **Advanced**: Dynamic Link (v15+ standards), Table, Geolocation, Table MultiSelect, Multiple Upload
  - **Rich Media**: Attach/Attach Image, Signature, Text Editor, Color, Rating
  - **Specialized**: Currency, Phone, Password, JSON, HTML with PDF support
- Handles permissions, naming rules, and DocType metadata
- Supports conditional field visibility with proper dependency configuration
- Creates mobile-friendly forms with camera integration and geolocation support
- Implements Dynamic Link fields following ERPNext v15+ standards for two-step selection

### HTML Mockup Generation
- Creates fully functional HTML mockups that demonstrate the DocType's user interface
- Implements responsive design optimized for both desktop and mobile devices
- Uses the exact TheTeam App v3 design system specifications
- Includes interactive JavaScript functionality for:
  - Form validation and field dependencies
  - Dynamic field visibility based on conditions
  - Child table operations (add, edit, delete rows)
  - File upload previews and camera integration simulation
  - Geolocation field interactions with map interfaces
  - Dynamic Link field cascading behavior
- Styles mockups with modern CSS frameworks (Tailwind CSS)
- Provides realistic data examples and field interactions
- Demonstrates mobile-specific features like touch interfaces and camera access
- Shows conditional field behavior and validation states

## Dynamic Link Implementation

Dynamic Link fields require a companion Link field that specifies the document type:
\`\`\`json
// Link field (specifies doctype)
{"fieldname": "reference_doctype", "fieldtype": "Link", "options": "DocType"}
// Dynamic Link field (references the Link field)
{"fieldname": "reference_document", "fieldtype": "Dynamic Link", "options": "reference_doctype"}
\`\`\`

## Mobile & Web Optimization

- Touch-friendly field types with appropriate input methods
- Geolocation fields for GPS-based location capture
- Camera integration for image fields
- Responsive form layouts
- Offline-capable field configurations
- Progressive Web App (PWA) compatible designs

## TheTeam App v3 Design System

### Core Design Principles
- Clean, minimal, professional interface design
- Mobile-first responsive approach
- Consistent spacing and typography
- Subtle shadows and modern borders
- Professional business application aesthetic

### Color Palette (Exact Hex Codes)

#### Primary Colors
- **Primary Green**: \`#22c55e\` (main brand color for buttons, focus states, accents)
- **Primary Green Hover**: \`#16a34a\` (hover state for primary buttons)
- **Primary Green Light**: \`#dcfce7\` (light background for success states)
- **Primary Green Focus Ring**: \`rgba(34, 197, 94, 0.1)\` (focus ring background)

#### Secondary Colors
- **White**: \`#ffffff\` (main background, card backgrounds)
- **Gray 50**: \`#f9fafb\` (page background)
- **Gray 100**: \`#f3f4f6\` (light backgrounds, disabled states)
- **Gray 200**: \`#e5e7eb\` (borders, dividers)
- **Gray 300**: \`#d1d5db\` (input borders)
- **Gray 400**: \`#9ca3af\` (placeholder text)
- **Gray 500**: \`#6b7280\` (secondary text)
- **Gray 600**: \`#4b5563\` (primary text)
- **Gray 700**: \`#374151\` (headings)
- **Gray 800**: \`#1f2937\` (dark text)
- **Gray 900**: \`#111827\` (darkest text)

#### Status Colors
- **Success Green**: \`#10b981\` (success messages, positive states)
- **Warning Yellow**: \`#f59e0b\` (warning states, pending)
- **Error Red**: \`#ef4444\` (error states, validation errors)
- **Info Blue**: \`#3b82f6\` (informational states)

### Typography System

#### Font Family
\`\`\`css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
\`\`\`

#### Font Weights
- **Light**: 300 (subtle text, large headings)
- **Regular**: 400 (body text, labels)
- **Medium**: 500 (form labels, secondary headings)
- **Semibold**: 600 (primary headings, buttons)
- **Bold**: 700 (emphasis, important headings)

### Component Library

#### Buttons

**Primary Button**
\`\`\`css
.btn-primary {
    background-color: #22c55e;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-primary:hover {
    background-color: #16a34a;
}
\`\`\`

#### Form Elements

**Text Input**
\`\`\`css
.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
\`\`\`

### Layout Structure

#### Header Navigation
\`\`\`html
<header class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
    <div class="flex items-center px-4 py-3">
        <div class="flex-1 flex justify-center">
            <img src="https://i.ibb.co/v42vBNsJ/TeamLogo.png" alt="TheTeam" class="theteam-logo">
        </div>
    </div>
</header>
\`\`\`

#### Logo Specifications
\`\`\`css
.theteam-logo {
    height: 40px;
    width: auto;
    max-width: none;
    object-fit: contain;
}
\`\`\`

**Logo Source**: https://ibb.co/Xxmk4nyz
**Direct Image URL**: \`https://i.ibb.co/v42vBNsJ/TeamLogo.png\`

#### Main Content Area
\`\`\`html
<main class="pt-16 pb-20">
    <div class="max-w-4xl mx-auto p-6">
        <!-- Content goes here -->
    </div>
</main>
\`\`\`

### Technical Implementation

#### Required Dependencies
\`\`\`html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Inter Font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
\`\`\`

## Output Format

The tool generates comprehensive deliverables:

1. **DocType JSON Files**: Complete JSON files ready for import into Frappe/ERPNext, please make sure the JSON is valid and the setting is based on the provided 4 REFERENCE EXAMPLES OF PROPERLY STRUCTURED ERPNEXT DOCTYPES json below.
2. **HTML Mockup**: Fully functional HTML prototype with exact TheTeam App v3 design
3. **Implementation Notes**: Deployment and integration guidance
4. **Business Logic**: Workflow and automation recommendations
`; 