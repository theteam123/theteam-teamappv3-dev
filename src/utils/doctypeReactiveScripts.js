import { watch } from 'vue';

/**
 * Setup reactive scripts for specific doctypes
 * @param {string} doctypeName - The name of the doctype
 * @param {object} formData - The reactive form data object
 * @param {object} docType - The doctype object
 */
export const setupDoctypeReactiveScripts = (doctypeName, formData, docType) => {
  // UGL BESS Project - Fibre Splicing and Testing specific scripts
  if (doctypeName === "UGL BESS Project - Fibre Splicing and Testing") {
    setupUGLBESSReactiveScript(formData, docType);
  }
  
  // Add other doctype-specific scripts here
  // Example:
  // if (doctypeName === "Another DocType Name") {
  //   setupAnotherDoctypeScript(formData, docType);
  // }
};

/**
 * UGL BESS Project - Fibre Splicing and Testing reactive script
 * @param {object} formData - The reactive form data object
 * @param {object} docType - The doctype object
 */
const setupUGLBESSReactiveScript = (formData, docType) => {
  // Variables to temporarily hold field values
  let temporaryElectricianName = null;
  let temporaryEmailAddress = null;
  let temporaryElectricianDateSigned = null;
  let temporarySignature = null;
  
  // Watch for changes to task_complete field
  watch(
    () => formData.value.task_complete,
    (newValue, oldValue) => {
      if (newValue === "Yes") {
        formData.value.job_status = "Pending - Client Approval";
        
        // Restore electrician_name if we have a temporarily stored value
        if (temporaryElectricianName !== null) {
          formData.value.electrician_name = temporaryElectricianName;
          temporaryElectricianName = null; // Clear the temporary storage
        }
        
        // Restore email_address if we have a temporarily stored value
        if (temporaryEmailAddress !== null) {
          formData.value.email_address = temporaryEmailAddress;
          temporaryEmailAddress = null; // Clear the temporary storage
        }
        
        // Restore electrician_date_signed if we have a temporarily stored value
        if (temporaryElectricianDateSigned !== null) {
          formData.value.electrician_date_signed = temporaryElectricianDateSigned;
          temporaryElectricianDateSigned = null; // Clear the temporary storage
        }
        
        // Restore signature if we have a temporarily stored value
        if (temporarySignature !== null) {
          formData.value.signature = temporarySignature;
          temporarySignature = null; // Clear the temporary storage
        }
      } else if (newValue === "No") {
        // Store the current electrician_name value if it exists
        if (formData.value.electrician_name) {
          temporaryElectricianName = formData.value.electrician_name;
        }
        
        // Store the current email_address value if it exists
        if (formData.value.email_address) {
          temporaryEmailAddress = formData.value.email_address;
        }
        
        // Store the current electrician_date_signed value if it exists
        if (formData.value.electrician_date_signed) {
          temporaryElectricianDateSigned = formData.value.electrician_date_signed;
        }
        
        // Store the current signature value if it exists
        if (formData.value.signature) {
          temporarySignature = formData.value.signature;
        }
        
        // Clear all the electrician fields
        formData.value.electrician_name = "";
        formData.value.email_address = "";
        formData.value.electrician_date_signed = "";
        formData.value.signature = "";
      }
    },
    { immediate: false }
  );
};

/**
 * Template for adding new doctype-specific scripts
 * @param {object} formData - The reactive form data object
 * @param {object} docType - The doctype object
 */
// const setupAnotherDoctypeScript = (formData, docType) => {
//   // Add your reactive logic here
//   watch(
//     () => formData.value.your_field,
//     (newValue, oldValue) => {
//       // Your reactive logic
//     },
//     { immediate: false }
//   );
// }; 