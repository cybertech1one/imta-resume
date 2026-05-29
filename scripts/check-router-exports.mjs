// check-router-exports.mjs — Check that each router file exports what index.ts expects
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const dir = resolve("src/integrations/orpc/router");
const indexPath = resolve(dir, "index.ts");
const content = readFileSync(indexPath, "utf-8");

// Parse multi-line imports
const importRegex = /import\s+\{([^}]+)\}\s+from\s+"\.\/([^"]+)"/g;
let match;
const problems = [];

while ((match = importRegex.exec(content)) !== null) {
  const names = match[1].split(",").map(s => s.trim()).filter(Boolean);
  const file = match[2];
  const filePath = resolve(dir, `${file}.ts`);

  if (!existsSync(filePath)) {
    problems.push(`MISSING FILE: ${file}.ts`);
    continue;
  }

  const src = readFileSync(filePath, "utf-8");

  for (const name of names) {
    // Check if this name is exported
    const exportPattern = new RegExp(`export\\s+(const|function|let|var|class)\\s+${name}\\b`);
    if (!exportPattern.test(src)) {
      // Also check for re-exports
      const reExportPattern = new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`);
      if (!reExportPattern.test(src)) {
        problems.push(`${file}.ts does NOT export "${name}"`);
      }
    }
  }
}

if (problems.length === 0) {
  console.log("All imports look valid!");
} else {
  console.log(`Found ${problems.length} problem(s):`);
  problems.forEach(p => console.log(`  - ${p}`));
}
