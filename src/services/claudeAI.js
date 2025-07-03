/**
 * Enhanced Claude AI DocType Generator Service
 * Provides comprehensive DocType generation with advanced prompt engineering
 * and intelligent parsing to match web Claude.ai project capabilities
 */

import { projectKnowledge } from '../config/projectKnowledge.js';

/**
 * Generate DocType using Enhanced Claude AI Integration
 * @param {string} apiKey - Claude AI API key
 * @param {string} businessRequirements - Business requirements text
 * @returns {Object} Enhanced generated DocType and HTML mockup
 */
export const generateDocType = async (apiKey, businessRequirements) => {
  if (!apiKey || !businessRequirements) {
    throw new Error('API key and business requirements are required');
  }

  try {
    // Use local backend proxy instead of direct API call
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        prompt: buildEnhancedPrompt(businessRequirements)
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid response format from Claude API');
    }

    const responseText = data.content[0].text;
    return parseEnhancedClaudeResponse(responseText);

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to generate DocType: ${error.message}`);
  }
};

/**
 * Build Enhanced Prompt with Advanced Engineering
 * @param {string} requirements - Business requirements
 * @returns {string} Comprehensive prompt for Claude AI
 */
const buildEnhancedPrompt = (requirements) => {
  return `You are an expert DocType architect and UI/UX designer specializing in Frappe/ERPNext systems and modern web applications. You have deep expertise in business process analysis, database design, and creating intuitive user interfaces.

MISSION:
Transform business requirements into production-ready DocType JSON files and interactive HTML mockups that exceed enterprise-grade standards.

ENHANCED CAPABILITIES:
- Intelligent field type selection based on business context
- Advanced relationship modeling and data integrity
- Mobile-first responsive design with offline capabilities
- Automated workflow and business logic integration
- Performance-optimized database structures
- Comprehensive validation and security measures

BUSINESS REQUIREMENTS TO ANALYZE:
${requirements}

ADVANCED ANALYSIS FRAMEWORK:
Analyze the requirements using these dimensions:

1. BUSINESS PROCESS MAPPING:
   - Identify primary and secondary workflows
   - Map stakeholder interactions and permissions
   - Determine automation opportunities
   - Plan integration touchpoints

2. DATA ARCHITECTURE DESIGN:
   - Design optimal field structures and relationships
   - Plan data validation and integrity rules
   - Consider scalability and performance implications
   - Map required child tables and links

3. USER EXPERIENCE OPTIMIZATION:
   - Design intuitive form layouts and navigation
   - Plan mobile interactions and offline scenarios
   - Optimize for accessibility and usability
   - Consider role-based interface adaptations

4. TECHNICAL IMPLEMENTATION:
   - Select appropriate field types and configurations
   - Plan API integrations and external connections
   - Design security and permission structures
   - Consider deployment and maintenance requirements

${projectKnowledge}

ENHANCED OUTPUT REQUIREMENTS:

Generate a comprehensive solution including:

1. **MAIN DOCTYPE JSON** - Production-ready DocType definition
2. **CHILD DOCTYPES** - If applicable, with proper relationships
3. **INTERACTIVE HTML MOCKUP** - Fully functional prototype
4. **IMPLEMENTATION GUIDE** - Deployment and usage instructions
5. **BUSINESS LOGIC NOTES** - Workflow and automation recommendations

ADVANCED FORMATTING REQUIREMENTS:

Format your response with clear section markers:

\`\`\`json-main-doctype
[Main DocType JSON here]
\`\`\`

\`\`\`json-child-doctypes
[Array of child DocType JSONs if applicable]
\`\`\`

\`\`\`html-mockup
[Complete HTML mockup with TheTeam App v3 styling]
\`\`\`

\`\`\`implementation-notes
[Comprehensive implementation guide and recommendations]
\`\`\`

\`\`\`business-logic
[Advanced workflow suggestions and automation opportunities]
\`\`\`

QUALITY STANDARDS:
- Enterprise-grade field validation and data integrity
- Mobile-optimized responsive design
- Accessibility compliance (WCAG 2.1)
- Performance optimization for large datasets
- Security best practices implementation
- Comprehensive error handling and user feedback
- Integration readiness with existing systems

ADVANCED FEATURES TO CONSIDER:
- Dynamic field visibility and conditional logic
- Automated calculations and data transformations
- Real-time collaboration and notifications
- Advanced search and filtering capabilities
- Audit trails and change tracking
- Bulk operations and data import/export
- Custom dashboards and reporting views
- API endpoints for external integrations

Begin analysis and generation now, ensuring every aspect meets enterprise-grade standards and exceeds user expectations.`;
};

/**
 * Parse Enhanced Claude Response with Advanced Extraction
 * @param {string} responseText - Raw Claude response
 * @returns {Object} Parsed DocType components with enhanced structure
 */
const parseEnhancedClaudeResponse = (responseText) => {
  console.log('Parsing Claude response:', responseText.substring(0, 500));

  const result = {
    mainDocType: null,
    childDocTypes: [],
    htmlMockup: '',
    implementationNotes: '',
    businessLogic: '',
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '2.0.0',
      quality: 'enterprise-grade'
    }
  };

  try {
    // Enhanced JSON extraction with multiple fallback patterns
    const mainDocTypeMatch = extractSectionContent(responseText, 'json-main-doctype') ||
                            extractSectionContent(responseText, 'json') ||
                            extractJsonFromText(responseText, 'Main DocType') ||
                            extractFirstJsonObject(responseText);

    if (mainDocTypeMatch) {
      result.mainDocType = JSON.parse(mainDocTypeMatch);
      console.log('Successfully parsed main DocType');
    }

    // Enhanced child DocTypes extraction
    const childDocTypesMatch = extractSectionContent(responseText, 'json-child-doctypes');
    if (childDocTypesMatch) {
      try {
        const childData = JSON.parse(childDocTypesMatch);
        result.childDocTypes = Array.isArray(childData) ? childData : [childData];
        console.log(`Successfully parsed ${result.childDocTypes.length} child DocTypes`);
      } catch (e) {
        console.log('Child DocTypes parsing failed, continuing without...');
      }
    }

    // Enhanced HTML mockup extraction
    result.htmlMockup = extractSectionContent(responseText, 'html-mockup') ||
                       extractSectionContent(responseText, 'html') ||
                       extractHtmlFromText(responseText) ||
                       generateFallbackHtml(result.mainDocType);

    // Enhanced implementation notes extraction
    result.implementationNotes = extractSectionContent(responseText, 'implementation-notes') ||
                                extractSectionContent(responseText, 'implementation') ||
                                extractTextSection(responseText, 'Implementation') ||
                                generateFallbackImplementationNotes(result.mainDocType);

    // Enhanced business logic extraction
    result.businessLogic = extractSectionContent(responseText, 'business-logic') ||
                          extractTextSection(responseText, 'Business Logic') ||
                          extractTextSection(responseText, 'Workflow') ||
                          generateFallbackBusinessLogic(result.mainDocType);

    // Quality validation
    validateGeneratedOutput(result);

    return result;

  } catch (error) {
    console.error('Enhanced parsing error:', error);
    throw new Error(`Failed to parse Claude response: ${error.message}. Please try again with more specific requirements.`);
  }
};

/**
 * Extract content between code block markers
 */
const extractSectionContent = (text, sectionType) => {
  const patterns = [
    new RegExp(`\`\`\`${sectionType}\\s*([\\s\\S]*?)\`\`\``, 'i'),
    new RegExp(`\`\`\`\\s*${sectionType}\\s*([\\s\\S]*?)\`\`\``, 'i'),
    new RegExp(`<${sectionType}>([\\s\\S]*?)</${sectionType}>`, 'i')
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * Extract JSON from text with contextual markers
 */
const extractJsonFromText = (text, context) => {
  const lines = text.split('\n');
  let jsonStart = -1;
  let braceCount = 0;
  let jsonContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (jsonStart === -1 && (
        line.includes(context) ||
        line.match(/^\s*\{/) ||
        line.includes('"doctype"') ||
        line.includes('"name"')
    )) {
      jsonStart = i;
    }

    if (jsonStart !== -1) {
      jsonContent += line + '\n';
      
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      if (braceCount === 0 && jsonContent.trim().endsWith('}')) {
        try {
          return JSON.stringify(JSON.parse(jsonContent));
        } catch (e) {
          continue;
        }
      }
    }
  }
  return null;
};

/**
 * Extract first valid JSON object from text
 */
const extractFirstJsonObject = (text) => {
  const jsonRegex = /\{[\s\S]*?\}/g;
  const matches = text.match(jsonRegex);
  
  if (matches) {
    for (const match of matches) {
      try {
        const parsed = JSON.parse(match);
        if (parsed.doctype || parsed.name || parsed.fields) {
          return match;
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
};

/**
 * Extract HTML from text with various patterns
 */
const extractHtmlFromText = (text) => {
  const htmlPatterns = [
    /<!DOCTYPE html>[\s\S]*?<\/html>/i,
    /<html[\s\S]*?<\/html>/i,
    /<div[\s\S]*?<\/div>/i
  ];

  for (const pattern of htmlPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

/**
 * Extract text sections with headers
 */
const extractTextSection = (text, sectionName) => {
  const patterns = [
    new RegExp(`#{1,3}\\s*${sectionName}[\\s\\S]*?(?=#{1,3}|$)`, 'i'),
    new RegExp(`\\*\\*${sectionName}\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'i'),
    new RegExp(`${sectionName}:?\\s*\\n([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

/**
 * Generate fallback HTML if extraction fails
 */
const generateFallbackHtml = (docType) => {
  if (!docType) return '<p>HTML mockup generation failed</p>';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docType.name || 'Generated DocType'} - TheTeam App v3</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">${docType.name || 'Generated DocType'}</h1>
            <p class="text-gray-600">Interactive mockup generation failed. Please regenerate with more specific requirements.</p>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Generate fallback implementation notes
 */
const generateFallbackImplementationNotes = (docType) => {
  if (!docType) return 'Implementation notes generation failed';
  
  return `# Implementation Guide for ${docType.name || 'Generated DocType'}

## Quick Start
1. Import the DocType JSON file into your ERPNext instance
2. Run database migrations if needed
3. Set up user permissions
4. Test the form functionality

## Deployment Steps
1. Navigate to Developer > DocType
2. Click "Import DocType"
3. Upload the generated JSON file
4. Configure permissions as needed

## Integration Points
- Consider API endpoints for external systems
- Set up automation rules if applicable
- Configure email notifications
- Plan data migration if replacing existing forms`;
};

/**
 * Generate fallback business logic notes
 */
const generateFallbackBusinessLogic = (docType) => {
  if (!docType) return 'Business logic notes generation failed';
  
  return `# Business Logic Recommendations for ${docType.name || 'Generated DocType'}

## Workflow Automation
- Consider implementing automated status transitions
- Set up notification rules for key stakeholders
- Plan integration with existing business processes

## Data Validation
- Implement field validation rules
- Set up dependent field calculations
- Consider bulk operations for efficiency

## Reporting & Analytics
- Plan dashboard views for key metrics
- Set up automated reports
- Consider data export capabilities`;
};

/**
 * Validate the generated output quality
 */
const validateGeneratedOutput = (result) => {
  const issues = [];

  if (!result.mainDocType) {
    issues.push('Main DocType generation failed');
  } else {
    if (!result.mainDocType.name) issues.push('DocType missing name');
    if (!result.mainDocType.fields || result.mainDocType.fields.length === 0) {
      issues.push('DocType missing fields');
    }
  }

  if (!result.htmlMockup || result.htmlMockup.length < 100) {
    issues.push('HTML mockup is too short or missing');
  }

  if (!result.implementationNotes || result.implementationNotes.length < 50) {
    issues.push('Implementation notes are insufficient');
  }

  if (issues.length > 0) {
    console.warn('Generation quality issues:', issues);
    result.metadata.qualityIssues = issues;
    result.metadata.quality = 'needs-improvement';
  }

  result.metadata.validatedAt = new Date().toISOString();
};

// Export additional utilities for advanced usage
export const utils = {
  validateDocType: (docType) => {
    // Add DocType validation logic
    return true;
  },
  
  optimizeFields: (fields) => {
    // Add field optimization logic
    return fields;
  },
  
  generateApiEndpoints: (docType) => {
    // Generate suggested API endpoints
    return [];
  }
}; 