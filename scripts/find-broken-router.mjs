// find-broken-router.mjs — Find which router is breaking ORPC
// This checks if each router file exports valid ORPC routers

import { readFileSync } from "fs";
import { resolve } from "path";

const indexPath = resolve("src/integrations/orpc/router/index.ts");
const content = readFileSync(indexPath, "utf-8");

// Extract all import lines
const importLines = content.match(/import .+ from "\.\/(.+)"/g);
console.log(`Found ${importLines.length} router imports\n`);

// List all router files
const routerFiles = importLines.map(line => {
  const match = line.match(/from "\.\/(.+)"/);
  return match?.[1];
}).filter(Boolean);

console.log("Router files to check:");
routerFiles.forEach(f => console.log(`  ${f}`));
console.log(`\nTotal: ${routerFiles.length} router files`);

// Check each file for common issues
for (const file of routerFiles) {
  const filePath = resolve(`src/integrations/orpc/router/${file}.ts`);
  try {
    const src = readFileSync(filePath, "utf-8");

    // Check for undefined exports
    const exportMatches = src.match(/export\s+(const|function)\s+(\w+)/g) || [];

    // Check if it imports from the right places
    const hasORPC = /from.*@orpc|from.*orpc/i.test(src);
    const hasProcedure = /protectedProcedure|publicProcedure|adminProcedure/.test(src);
    const hasRouter = /\.router\(|os\.router/i.test(src);

    // Check for potential issues
    if (!hasORPC && !hasProcedure) {
      console.log(`\n  WARNING: ${file}.ts — No ORPC imports found`);
    }

    // Check for empty exports or re-exports
    if (exportMatches.length === 0) {
      console.log(`\n  WARNING: ${file}.ts — No named exports found`);
    }

    // Check file size
    if (src.length < 50) {
      console.log(`\n  WARNING: ${file}.ts — Very small file (${src.length} bytes)`);
    }
  } catch (e) {
    console.log(`\n  ERROR: ${file}.ts — ${e.message}`);
  }
}
