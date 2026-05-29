/**
 * Extract all ORPC endpoints from router files
 * Outputs a JSON catalog of all endpoints with their paths, methods, and auth levels
 * Handles nested routers (both external variable references and inline definitions)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const routerDir = "src/integrations/orpc/router";
const indexContent = readFileSync(join(routerDir, "index.ts"), "utf-8");

// Parse index.ts to get routerKey -> imported variable name
const exportBlock = indexContent.match(/export default \{([\s\S]*?)\};/);
const exportLines = exportBlock[1].split("\n");
const routerKeyToVar = {};
for (const line of exportLines) {
	const m = line.match(/^\s+(\w+):\s*(\w+)/);
	if (m) routerKeyToVar[m[1]] = m[2];
}

// Parse import statements to map variable names to files
const importMap = {};
const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']\.\/([^"']+)["']/g;
let im;
while ((im = importRegex.exec(indexContent)) !== null) {
	const vars = im[1].split(",").map((v) => v.trim().split(/\s+as\s+/)[0].trim());
	const file = im[2];
	for (const v of vars) {
		importMap[v] = file;
	}
}

const PROC_TYPES =
	"publicProcedure|protectedProcedure|adminProcedure|serverOnlyProcedure|aiRateLimitedProcedure|uploadRateLimitedProcedure";
const procRegex = new RegExp(`(\\w+):\\s*(${PROC_TYPES})`);

function findMethod(lines, startLine) {
	for (let j = startLine; j < Math.min(startLine + 10, lines.length); j++) {
		const methodMatch = lines[j].match(/method:\s*["'](\w+)["']/);
		if (methodMatch) return methodMatch[1];
	}
	return "POST";
}

/**
 * Recursively parse a router object to find all endpoints.
 * Handles both inline nested objects and references to external const variables.
 * @param {string[]} lines - All lines of the file
 * @param {number} blockStart - Start line of the object block
 * @param {number} blockEnd - End line of the object block
 * @param {string} pathPrefix - Current ORPC path prefix
 * @param {string[]} allLines - Reference to full file lines for resolving external refs
 * @returns {Array} - Array of endpoint objects
 */
function parseBlock(lines, blockStart, blockEnd, pathPrefix, allLines) {
	const endpoints = [];
	let i = blockStart;

	while (i <= blockEnd) {
		const line = lines[i];

		// Check for procedure definition: `name: procedureType`
		const procMatch = line.match(procRegex);
		if (procMatch) {
			const method = findMethod(lines, i);
			endpoints.push({
				path: `${pathPrefix}/${procMatch[1]}`,
				procType: procMatch[2].replace("Procedure", ""),
				method,
			});
			i++;
			continue;
		}

		// Check for external sub-router reference: `name: variableRouter,`
		const externalRef = line.match(/^\s+(\w+):\s*(\w+Router)\s*,?\s*$/);
		if (externalRef && !line.match(procRegex)) {
			const subKey = externalRef[1];
			const subVarName = externalRef[2];

			// Find the const definition for this sub-router variable
			let subStart = -1;
			for (let j = 0; j < allLines.length; j++) {
				if (
					allLines[j].includes(`const ${subVarName}`) &&
					allLines[j].includes("=") &&
					!allLines[j].includes("export const")
				) {
					subStart = j;
					break;
				}
			}
			if (subStart !== -1) {
				const subEnd = findBlockEnd(allLines, subStart);
				const subEndpoints = parseBlock(allLines, subStart, subEnd, `${pathPrefix}/${subKey}`, allLines);
				endpoints.push(...subEndpoints);
			}
			i++;
			continue;
		}

		// Check for inline nested object: `name: {`
		// This handles patterns like: `providers: { list: publicProcedure ... }`
		const inlineNested = line.match(/^\s+(\w+):\s*\{\s*$/);
		if (inlineNested) {
			const subKey = inlineNested[1];
			const subEnd = findBlockEnd(lines, i);
			const subEndpoints = parseBlock(lines, i + 1, subEnd, `${pathPrefix}/${subKey}`, allLines);
			endpoints.push(...subEndpoints);
			i = subEnd + 1;
			continue;
		}

		i++;
	}

	return endpoints;
}

function findBlockEnd(lines, startLine) {
	let braceDepth = 0;
	for (let i = startLine; i < lines.length; i++) {
		for (const ch of lines[i]) {
			if (ch === "{") braceDepth++;
			if (ch === "}") braceDepth--;
		}
		if (braceDepth <= 0 && i > startLine) return i;
	}
	return lines.length - 1;
}

const allEndpoints = [];
const uniquePaths = new Set();

for (const [routerKey, varName] of Object.entries(routerKeyToVar)) {
	const file = importMap[varName];
	if (!file) {
		console.log(`No file mapping for ${varName} (router key: ${routerKey})`);
		continue;
	}

	const filePath = join(routerDir, file + ".ts");
	if (!existsSync(filePath)) {
		console.log(`File not found: ${filePath}`);
		continue;
	}

	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	// Find the export const for this router variable
	let exportStart = -1;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes(`export const ${varName}`) && lines[i].includes("=")) {
			exportStart = i;
			break;
		}
	}
	if (exportStart === -1) continue;

	const exportEnd = findBlockEnd(lines, exportStart);

	// Parse the export block recursively
	const eps = parseBlock(lines, exportStart, exportEnd, routerKey, lines);

	for (const ep of eps) {
		if (!uniquePaths.has(ep.path)) {
			uniquePaths.add(ep.path);
			allEndpoints.push(ep);
		}
	}
}

writeFileSync("scripts/endpoints-full.json", JSON.stringify(allEndpoints, null, 2));
console.log(`Total unique endpoints: ${allEndpoints.length}`);

const byType = {};
for (const e of allEndpoints) byType[e.procType] = (byType[e.procType] || 0) + 1;
console.log("By auth type:", JSON.stringify(byType));

const byMethod = {};
for (const e of allEndpoints) byMethod[e.method] = (byMethod[e.method] || 0) + 1;
console.log("By method:", JSON.stringify(byMethod));

// Verify known nested paths
const knownPaths = [
	"auth/providers/list",
	"notification/preferences/get",
	"resume/tags/list",
	"resume/statistics/getById",
	"admin/analytics/getOverview",
	"aiConfig/providers/list",
	"aiConfig/status/check",
];
console.log("\nVerification of known nested paths:");
for (const p of knownPaths) {
	const found = allEndpoints.find((e) => e.path === p);
	console.log(`  ${found ? "OK" : "MISSING"}: ${p}`);
}

// Show first 30 paths
console.log("\nFirst 30 endpoints:");
for (const e of allEndpoints.slice(0, 30)) {
	console.log(`  ${e.method.padEnd(6)} ${e.path} [${e.procType}]`);
}
