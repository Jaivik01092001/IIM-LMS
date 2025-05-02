/**
 * Utility script to add i18n support to all JSX components
 */
import fs from "fs";
import path from "path";
import { addUseTranslationHook, addTFunction } from "./i18nHelper";

// Directory to scan for JSX components
const sourceDir = path.resolve(__dirname, "../");

// Function to scan a directory recursively for JSX files
const scanDir = (dir) => {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules
      if (entry.name === "node_modules") continue;
      files.push(...scanDir(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".jsx") || entry.name.endsWith(".tsx"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
};

// Function to update a component with i18n support
const updateComponent = (filePath) => {
  try {
    console.log(`Processing: ${filePath}`);

    // Read the component file
    let code = fs.readFileSync(filePath, "utf-8");

    // Skip if the component already has useTranslation
    if (code.includes("useTranslation") && code.includes("const { t }")) {
      console.log(`  Already has translations, skipping...`);
      return;
    }

    // Add the useTranslation hook import
    code = addUseTranslationHook(code);

    // Add the t function declaration
    code = addTFunction(code);

    // Write the updated component back to the file
    fs.writeFileSync(filePath, code, "utf-8");
    console.log(`  ✓ Updated successfully!`);
  } catch (error) {
    console.error(`  ✗ Error updating ${filePath}:`, error);
  }
};

// Main function to run the script
const updateAllComponents = () => {
  const jsxFiles = scanDir(sourceDir);
  console.log(`Found ${jsxFiles.length} JSX/TSX files to process`);

  jsxFiles.forEach(updateComponent);

  console.log("Finished processing all components!");
};

// Run the script
updateAllComponents();
