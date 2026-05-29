// test-router-import.mjs — Try to find undefined router exports
import { readFileSync } from "fs";
import { resolve } from "path";

const indexPath = resolve("src/integrations/orpc/router/index.ts");
const content = readFileSync(indexPath, "utf-8");

// Extract the export default object entries
const exportBlock = content.match(/export default \{([\s\S]*)\}/)?.[1] || "";
const entries = exportBlock.match(/\w+:\s*\w+/g) || [];

console.log(`Found ${entries.length} router entries in export default\n`);

// For each entry, check the imported variable exists in import statements
for (const entry of entries) {
  const [key, value] = entry.split(":").map(s => s.trim());

  // Check if value is imported
  const importPattern = new RegExp(`import\\s+.*\\b${value}\\b.*from`);
  if (!importPattern.test(content)) {
    console.log(`  PROBLEM: ${key}: ${value} — not found in any import statement!`);
  }
}

// Also check for routers in the import that are NOT in the export
const allImportedNames = [];
const importBlocks = content.matchAll(/import\s+\{([^}]+)\}\s+from/g);
for (const m of importBlocks) {
  const names = m[1].split(",").map(s => s.trim()).filter(Boolean);
  allImportedNames.push(...names);
}

const exportedNames = entries.map(e => e.split(":")[1].trim());
const unusedImports = allImportedNames.filter(n => !exportedNames.includes(n));
if (unusedImports.length > 0) {
  console.log("\nImported but NOT in export default:");
  unusedImports.forEach(n => console.log(`  - ${n}`));
}

console.log("\nDone.");
