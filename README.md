# TheTeam App v3

A modern Vue.js application for managing forms and documents with ERPNext integration.

## Features

- **Form Management**: Create, edit, and submit forms with various field types
- **Document Management**: View and manage document submissions
- **User Authentication**: OAuth-based authentication with ERPNext
- **File Upload**: Support for file and image uploads with watermarking
- **Geolocation**: Built-in geolocation support for location-based fields
- **Dynamic Forms**: Conditional field visibility based on dependencies
- **Mobile Support**: Responsive design with camera integration for mobile devices

## Field Types Supported

The application supports the following ERPNext field types:

### Basic Field Types
- **Data**: Text input fields
- **Int/Float**: Number input fields
- **Date/Datetime/Time**: Date and time pickers
- **Duration**: Duration input with popup selector
- **Select**: Dropdown and radio button selections
- **Link**: Dropdown selection from ERPNext doctypes
- **Dynamic Link**: Two-step selection (doctype + document) following ERPNext v15+ standards
- **Check**: Checkbox fields
- **Small Text/Text/Long Text**: Multi-line text areas
- **JSON**: JSON input with validation and formatting
- **Text Editor**: Rich text editing
- **Attach/Attach Image**: File and image uploads
- **Color**: Color picker
- **Currency**: Currency input with symbol
- **Phone**: International phone number input
- **Password**: Password input
- **Rating**: Star rating system
- **Signature**: Digital signature capture
- **HTML**: HTML content display with PDF viewer support

### Advanced Field Types
- **Table**: Child table with add/edit/delete functionality
- **Geolocation**: Interactive map with drawing tools
- **Table MultiSelect**: Multi-select dropdown with search
- **Multiple Upload**: Bulk file upload with preview grid

## Dynamic Link Field Type

The **Dynamic Link** field type follows ERPNext v15+ implementation standards:

### How it Works
1. **Link Field**: A separate Link field specifies the document type (e.g., Customer, Supplier, Item)
2. **Dynamic Link Field**: Searches and selects a specific document from the doctype specified by the Link field
3. **Data Storage**: The Dynamic Link field stores only the document name, while the doctype is stored in the referenced Link field

### Configuration
- **Field Options**: Contains the name of the Link field that specifies the doctype
- **Dependency**: The Dynamic Link field is disabled until a doctype is selected in the referenced Link field
- **Search Integration**: Uses ERPNext's `search_link` API for document search within the selected doctype
- **Validation**: Ensures both doctype (in Link field) and document (in Dynamic Link field) are selected

### Usage Example
```javascript
// Link field configuration (specifies the doctype)
{
  fieldname: "link_doctype",
  label: "Document Type",
  fieldtype: "Link",
  options: "DocType", // Links to DocType to select available doctypes
  reqd: 1
}

// Dynamic Link field configuration (references the Link field)
{
  fieldname: "linked_document",
  label: "Linked Document",
  fieldtype: "Dynamic Link",
  options: "link_doctype", // References the Link field above
  reqd: 1
}

// Stored values
// link_doctype: "Customer"
// linked_document: "CUSTOMER-001"
```

### User Experience
1. User first selects a document type in the Link field (e.g., "Customer")
2. The Dynamic Link field becomes enabled and shows "Search Customer documents..."
3. User types to search within the selected doctype
4. User selects a specific document from the search results
5. The Dynamic Link field stores the document name

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- ERPNext instance with API access

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Configuration

### Environment Variables
- `VITE_ERP_API_URL`: ERPNext API base URL
- `VITE_OAUTH_CLIENT_ID`: OAuth client ID
- `VITE_OAUTH_REDIRECT_URI`: OAuth redirect URI

### Domain Configuration
Edit `src/config/domains.js` to configure domain-specific settings:
- API endpoints
- Logo and branding
- Feature flags

## API Integration

The application integrates with ERPNext through:
- **REST API**: For CRUD operations
- **OAuth 2.0**: For authentication
- **File Upload API**: For document attachments
- **Search API**: For dynamic link and table multi-select fields

## Mobile Features

- **Camera Integration**: Direct camera access for image fields
- **Geolocation**: GPS-based location capture
- **Touch-friendly UI**: Optimized for mobile interactions
- **Offline Support**: Basic offline functionality for form filling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/theteam123/theteamappv3)