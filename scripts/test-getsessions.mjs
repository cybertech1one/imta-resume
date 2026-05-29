// Test interview.getSessions with POST method
import { execSync } from "node:child_process";

const BASE = "http://localhost:3040";

// Login with proper shell escaping
const loginCmd = `curl -s -c - -X POST "${BASE}/api/auth/sign-in/email" -H "Content-Type: application/json" -H "Origin: ${BASE}" -H "Referer: ${BASE}/" -d "{\\"email\\":\\"student1@test.com\\",\\"password\\":\\"TestAccount123!\\"}"`;

const loginOut = execSync(loginCmd, { encoding: "utf-8" });
console.log("Login output (cookie jar):", loginOut.substring(0, 300));

// Extract the session token from the cookie jar format
const lines = loginOut.split("\n");
const tokenLine = lines.find(l => l.includes("better-auth.session_token"));
if (!tokenLine) {
  console.error("No session token found");
  // Try a different approach - use curl cookie jar file
  console.log("\n--- Trying with cookie jar file ---");

  execSync(`curl -s -c cookies.txt -X POST "${BASE}/api/auth/sign-in/email" -H "Content-Type: application/json" -H "Origin: ${BASE}" -H "Referer: ${BASE}/" -d "{\\"email\\":\\"student1@test.com\\",\\"password\\":\\"TestAccount123!\\"}"`, { cwd: process.cwd() });

  // Test GET
  const getRes = execSync(`curl -s -b cookies.txt -w "\\nSTATUS:%{http_code}" -X GET "${BASE}/api/rpc/interview/getSessions?data=${encodeURIComponent(JSON.stringify({json:{limit:5,offset:0}}))}" -H "Origin: ${BASE}" -H "Referer: ${BASE}/"`, { encoding: "utf-8", cwd: process.cwd() });
  console.log("GET result:", getRes.substring(0, 300));

  // Test POST
  const postRes = execSync(`curl -s -b cookies.txt -w "\\nSTATUS:%{http_code}" -X POST "${BASE}/api/rpc/interview/getSessions" -H "Content-Type: application/json" -H "Origin: ${BASE}" -H "Referer: ${BASE}/" -d "{\\"json\\":{\\"limit\\":5,\\"offset\\":0}}"`, { encoding: "utf-8", cwd: process.cwd() });
  console.log("POST result:", postRes.substring(0, 300));

  // cleanup
  try { execSync("del cookies.txt", { cwd: process.cwd() }); } catch {}
}
