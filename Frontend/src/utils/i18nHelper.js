/**
 * Helper functions for i18n implementation
 */

/**
 * Adds the useTranslation hook to a component
 * 
 * @param {string} componentCode - The component code
 * @returns {string} - The updated component code with useTranslation hook
 */
export const addUseTranslationHook = (componentCode) => {
  // Check if useTranslation is already imported
  if (!componentCode.includes('useTranslation')) {
    // Add import statement
    if (componentCode.includes('import React')) {
      return componentCode.replace(
        /import React.+?;/,
        (match) => `${match}\nimport { useTranslation } from "react-i18next";`
      );
    } else {
      // Find the last import statement
      const lastImportIndex = componentCode.lastIndexOf('import');
      const lastImportEndIndex = componentCode.indexOf(';', lastImportIndex) + 1;
      
      return (
        componentCode.substring(0, lastImportEndIndex) +
        '\nimport { useTranslation } from "react-i18next";' +
        componentCode.substring(lastImportEndIndex)
      );
    }
  }
  
  return componentCode;
};

/**
 * Adds the t function to a component
 * 
 * @param {string} componentCode - The component code
 * @returns {string} - The updated component code with t function
 */
export const addTFunction = (componentCode) => {
  // Check if t function is already declared
  if (!componentCode.includes('const { t }')) {
    // Find the component function declaration
    const componentFunctionRegex = /const\s+(\w+)\s*=\s*\(.*?\)\s*=>\s*{/;
    const match = componentCode.match(componentFunctionRegex);
    
    if (match) {
      const insertIndex = componentCode.indexOf('{', match.index) + 1;
      return (
        componentCode.substring(0, insertIndex) +
        '\n  const { t } = useTranslation();' +
        componentCode.substring(insertIndex)
      );
    }
    
    // Try class component pattern
    const classComponentRegex = /class\s+(\w+)\s+extends\s+React\.Component\s*{/;
    const classMatch = componentCode.match(classComponentRegex);
    
    if (classMatch) {
      // For class components, add in constructor or componentDidMount
      if (componentCode.includes('constructor')) {
        const constructorIndex = componentCode.indexOf('constructor');
        const constructorBodyIndex = componentCode.indexOf('{', constructorIndex) + 1;
        
        return (
          componentCode.substring(0, constructorBodyIndex) +
          '\n    this.t = this.props.t;' +
          componentCode.substring(constructorBodyIndex)
        );
      } else {
        // Add componentDidMount if it doesn't exist
        const renderIndex = componentCode.indexOf('render()');
        
        return (
          componentCode.substring(0, renderIndex) +
          '\n  componentDidMount() {\n    this.t = this.props.t;\n  }\n\n' +
          componentCode.substring(renderIndex)
        );
      }
    }
  }
  
  return componentCode;
};

/**
 * Replaces hardcoded text with translation keys
 * 
 * @param {string} componentCode - The component code
 * @param {Object} translationMap - Map of hardcoded text to translation keys
 * @returns {string} - The updated component code with translation keys
 */
export const replaceHardcodedText = (componentCode, translationMap) => {
  let updatedCode = componentCode;
  
  Object.entries(translationMap).forEach(([hardcodedText, translationKey]) => {
    // Replace exact matches with translation function
    const regex = new RegExp(`>\\s*${escapeRegExp(hardcodedText)}\\s*<`, 'g');
    updatedCode = updatedCode.replace(regex, `>{t("${translationKey}")}<`);
    
    // Replace in attributes
    const attrRegex = new RegExp(`(\\w+)=["']${escapeRegExp(hardcodedText)}["']`, 'g');
    updatedCode = updatedCode.replace(attrRegex, `$1={t("${translationKey}")}`);
  });
  
  return updatedCode;
};

/**
 * Escape special characters in a string for use in a regular expression
 * 
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Wraps a component with withTranslation HOC
 * 
 * @param {string} componentCode - The component code
 * @returns {string} - The updated component code wrapped with withTranslation
 */
export const wrapWithTranslation = (componentCode) => {
  // Check if already wrapped
  if (componentCode.includes('withTranslation')) {
    return componentCode;
  }
  
  // Add import
  componentCode = componentCode.replace(
    /import { useTranslation } from "react-i18next";/,
    'import { useTranslation, withTranslation } from "react-i18next";'
  );
  
  // Find export statement
  const exportRegex = /export default (\w+);/;
  const match = componentCode.match(exportRegex);
  
  if (match) {
    const componentName = match[1];
    return componentCode.replace(
      exportRegex,
      `export default withTranslation()(${componentName});`
    );
  }
  
  return componentCode;
};
