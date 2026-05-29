/**
 * Comprehensive CRUD Test Script
 * Tests full Create-Read-Update-Delete cycles for:
 *   1. Job Applications
 *   2. Career Goals (with milestones)
 *   3. Skills Tracking (skillProgress)
 *   4. Portfolio Projects (workSamples)
 *   5. Networking Contacts
 *   6. Interview Sessions
 *   7. User Settings (AI language preference)
 *
 * ORPC wire protocol:
 *   POST body: { json: <input> }
 *   Response:  { json: <output>, meta: [...] }
 *   URL paths use "/" separators (e.g. /api/rpc/goals/milestones/create)
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "student1@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

// ============================================================================
// UTILITIES
// ============================================================================

function log(status, name, detail = "") {
	const icon =
		status === "PASS"
			? "\x1b[32m PASS\x1b[0m"
			: status === "FAIL"
				? "\x1b[31m FAIL\x1b[0m"
				: "\x1b[33m SKIP\x1b[0m";
	const line = `  ${icon}  ${name}${detail ? ` -- ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else skipped++;
}

function section(title) {
	console.log(`\n\x1b[1m\x1b[36m--- ${title} ---\x1b[0m`);
}

/** POST an ORPC endpoint with {json: input} envelope */
async function rpc(path, input = undefined) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify(envelope),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

// ============================================================================
// AUTH
// ============================================================================

async function login() {
	section("AUTHENTICATION");
	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: BASE_URL },
			body: JSON.stringify(CREDENTIALS),
			redirect: "manual",
		});
		const cookies = res.headers.getSetCookie?.() || [];
		sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");

		if (res.ok || res.status === 302) {
			log("PASS", "Login as student1@test.com", `cookies=${cookies.length}`);
		} else {
			const body = await res.text();
			log("FAIL", "Login", `status=${res.status} ${body.slice(0, 200)}`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Login", e.message);
		return false;
	}

	// Verify session
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.email) {
			log("PASS", "Session verified", `user=${body.user.email}`);
			return true;
		}
		log("FAIL", "Session check", "no user in session");
		return false;
	} catch (e) {
		log("FAIL", "Session check", e.message);
		return false;
	}
}

// ============================================================================
// 1. JOB APPLICATIONS CRUD
// ============================================================================

async function testJobApplicationsCRUD() {
	section("1. JOB APPLICATIONS - Full CRUD Cycle");

	let appId = null;

	// CREATE
	try {
		const r = await rpc("jobApplications/create", {
			companyName: "TestCorp CRUD",
			position: "Senior Engineer",
			location: "Remote",
			status: "applied",
			notes: "Created by CRUD test script",
			tags: ["test", "crud"],
			priority: 3,
			isRemote: true,
		});
		if (r.ok && r.json) {
			appId = r.json;
			log("PASS", "Create job application", `id=${appId}`);
		} else {
			log("FAIL", "Create job application", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create job application", e.message);
		return;
	}

	// READ (getById)
	try {
		const r = await rpc("jobApplications/getById", { id: appId });
		if (r.ok && r.json?.companyName === "TestCorp CRUD") {
			log("PASS", "Read job application", `company=${r.json.companyName}, position=${r.json.position}`);
		} else {
			log("FAIL", "Read job application", `status=${r.status} got=${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read job application", e.message);
	}

	// UPDATE
	try {
		const r = await rpc("jobApplications/update", {
			id: appId,
			position: "Staff Engineer",
			notes: "Updated by CRUD test",
		});
		if (r.ok) {
			log("PASS", "Update job application", "position -> Staff Engineer");
		} else {
			log("FAIL", "Update job application", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update job application", e.message);
	}

	// READ AFTER UPDATE
	try {
		const r = await rpc("jobApplications/getById", { id: appId });
		if (r.ok && r.json?.position === "Staff Engineer") {
			log("PASS", "Verify update persisted", `position=${r.json.position}`);
		} else {
			log("FAIL", "Verify update persisted", `expected 'Staff Engineer', got '${r.json?.position}'`);
		}
	} catch (e) {
		log("FAIL", "Verify update persisted", e.message);
	}

	// UPDATE STATUS
	try {
		const r = await rpc("jobApplications/updateStatus", { id: appId, status: "interview" });
		if (r.ok) {
			log("PASS", "Update application status", "status -> interview");
		} else {
			log("FAIL", "Update application status", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update application status", e.message);
	}

	// VERIFY STATUS UPDATE
	try {
		const r = await rpc("jobApplications/getById", { id: appId });
		if (r.ok && r.json?.status === "interview") {
			log("PASS", "Verify status update", `status=${r.json.status}`);
		} else {
			log("FAIL", "Verify status update", `expected 'interview', got '${r.json?.status}'`);
		}
	} catch (e) {
		log("FAIL", "Verify status update", e.message);
	}

	// DELETE
	try {
		const r = await rpc("jobApplications/delete", { id: appId });
		if (r.ok) {
			log("PASS", "Delete job application", `id=${appId}`);
		} else {
			log("FAIL", "Delete job application", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete job application", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("jobApplications/getById", { id: appId });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify deletion (read should fail)", `status=${r.status}`);
		} else {
			log("FAIL", "Verify deletion", "application still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify deletion (threw error)", e.message);
	}
}

// ============================================================================
// 2. CAREER GOALS CRUD (with milestones)
// ============================================================================

async function testGoalsCRUD() {
	section("2. CAREER GOALS - Full CRUD Cycle with Milestones");

	let goalId = null;
	let milestoneId = null;

	// CREATE GOAL
	try {
		const r = await rpc("goals/create", {
			title: "CRUD Test Goal",
			description: "Created by comprehensive test script",
			category: "career",
			priority: 4,
			tags: ["test", "automated"],
		});
		if (r.ok && r.json) {
			goalId = r.json;
			log("PASS", "Create career goal", `id=${goalId}`);
		} else {
			log("FAIL", "Create career goal", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create career goal", e.message);
		return;
	}

	// READ GOAL
	try {
		const r = await rpc("goals/getById", { id: goalId });
		if (r.ok && r.json?.title === "CRUD Test Goal") {
			log("PASS", "Read career goal", `title=${r.json.title}, category=${r.json.category}`);
		} else {
			log("FAIL", "Read career goal", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read career goal", e.message);
	}

	// ADD MILESTONE
	try {
		const r = await rpc("goals/milestones/create", {
			goalId: goalId,
			title: "Complete CRUD test",
			description: "Milestone created by test script",
			order: 1,
		});
		if (r.ok && r.json) {
			milestoneId = r.json;
			log("PASS", "Create milestone", `id=${milestoneId}`);
		} else {
			log("FAIL", "Create milestone", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Create milestone", e.message);
	}

	// VERIFY MILESTONE APPEARS ON GOAL
	try {
		const r = await rpc("goals/getById", { id: goalId });
		if (r.ok && r.json?.milestones?.length > 0) {
			log("PASS", "Verify milestone on goal", `milestones=${r.json.milestones.length}`);
		} else {
			log("FAIL", "Verify milestone on goal", `milestones=${r.json?.milestones?.length || 0}`);
		}
	} catch (e) {
		log("FAIL", "Verify milestone on goal", e.message);
	}

	// TOGGLE MILESTONE COMPLETION
	if (milestoneId) {
		try {
			const r = await rpc("goals/milestones/toggle", { id: milestoneId, goalId: goalId });
			if (r.ok) {
				log("PASS", "Toggle milestone completion", `completed=${r.json}`);
			} else {
				log("FAIL", "Toggle milestone completion", `status=${r.status} ${r.text?.slice(0, 200)}`);
			}
		} catch (e) {
			log("FAIL", "Toggle milestone completion", e.message);
		}
	}

	// UPDATE GOAL PROGRESS
	try {
		const r = await rpc("goals/updateProgress", { id: goalId, progress: 50 });
		if (r.ok) {
			log("PASS", "Update goal progress", "progress -> 50%");
		} else {
			log("FAIL", "Update goal progress", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update goal progress", e.message);
	}

	// VERIFY PROGRESS
	try {
		const r = await rpc("goals/getById", { id: goalId });
		if (r.ok && r.json?.progress === 50) {
			log("PASS", "Verify progress update", `progress=${r.json.progress}%`);
		} else {
			log("FAIL", "Verify progress update", `expected 50, got ${r.json?.progress}`);
		}
	} catch (e) {
		log("FAIL", "Verify progress update", e.message);
	}

	// UPDATE GOAL
	try {
		const r = await rpc("goals/update", {
			id: goalId,
			title: "Updated CRUD Test Goal",
			status: "in_progress",
		});
		if (r.ok) {
			log("PASS", "Update career goal", "title + status updated");
		} else {
			log("FAIL", "Update career goal", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update career goal", e.message);
	}

	// VERIFY UPDATE
	try {
		const r = await rpc("goals/getById", { id: goalId });
		if (r.ok && r.json?.title === "Updated CRUD Test Goal" && r.json?.status === "in_progress") {
			log("PASS", "Verify goal update persisted", `title=${r.json.title}, status=${r.json.status}`);
		} else {
			log("FAIL", "Verify goal update persisted", `got title=${r.json?.title}, status=${r.json?.status}`);
		}
	} catch (e) {
		log("FAIL", "Verify goal update persisted", e.message);
	}

	// DELETE MILESTONE
	if (milestoneId) {
		try {
			const r = await rpc("goals/milestones/delete", { id: milestoneId, goalId: goalId });
			if (r.ok) {
				log("PASS", "Delete milestone", `id=${milestoneId}`);
			} else {
				log("FAIL", "Delete milestone", `status=${r.status} ${r.text?.slice(0, 200)}`);
			}
		} catch (e) {
			log("FAIL", "Delete milestone", e.message);
		}
	}

	// DELETE GOAL
	try {
		const r = await rpc("goals/delete", { id: goalId });
		if (r.ok) {
			log("PASS", "Delete career goal", `id=${goalId}`);
		} else {
			log("FAIL", "Delete career goal", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete career goal", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("goals/getById", { id: goalId });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify goal deletion", `status=${r.status}`);
		} else {
			log("FAIL", "Verify goal deletion", "goal still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify goal deletion (threw error)", e.message);
	}
}

// ============================================================================
// 3. SKILLS TRACKING CRUD (skillProgress)
// ============================================================================

async function testSkillsTrackingCRUD() {
	section("3. SKILLS TRACKING - Full CRUD Cycle");

	const skillName = "CRUDTestSkill_" + Date.now();

	// CREATE (upsert)
	try {
		const r = await rpc("skillProgress/upsert", {
			skillName: skillName,
			category: "technical",
			currentLevel: 2,
			targetLevel: 5,
			notes: "Created by CRUD test",
		});
		if (r.ok) {
			log("PASS", "Create skill progress", `skill=${skillName}`);
		} else {
			log("FAIL", "Create skill progress", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create skill progress", e.message);
		return;
	}

	// READ
	try {
		const r = await rpc("skillProgress/get", { skillName: skillName });
		if (r.ok && r.json?.skillName === skillName && r.json?.currentLevel === 2) {
			log("PASS", "Read skill progress", `level=${r.json.currentLevel}, target=${r.json.targetLevel}`);
		} else {
			log("FAIL", "Read skill progress", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read skill progress", e.message);
	}

	// UPDATE LEVEL
	try {
		const r = await rpc("skillProgress/updateLevel", {
			skillName: skillName,
			level: 4,
			notes: "Updated via CRUD test",
		});
		if (r.ok) {
			log("PASS", "Update skill level", "level -> 4");
		} else {
			log("FAIL", "Update skill level", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update skill level", e.message);
	}

	// VERIFY UPDATE
	try {
		const r = await rpc("skillProgress/get", { skillName: skillName });
		if (r.ok && r.json?.currentLevel === 4) {
			log("PASS", "Verify skill level update", `level=${r.json.currentLevel}`);
		} else {
			log("FAIL", "Verify skill level update", `expected 4, got ${r.json?.currentLevel}`);
		}
	} catch (e) {
		log("FAIL", "Verify skill level update", e.message);
	}

	// LOG PRACTICE
	try {
		const r = await rpc("skillProgress/logPractice", {
			skillName: skillName,
			hours: 1.5,
			notes: "Practice logged by CRUD test",
		});
		if (r.ok) {
			log("PASS", "Log practice session", `hours=1.5 for ${skillName}`);
		} else {
			log("FAIL", "Log practice session", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Log practice session", e.message);
	}

	// LIST SKILLS
	try {
		const r = await rpc("skillProgress/list");
		if (r.ok && Array.isArray(r.json)) {
			const found = r.json.find((s) => s.skillName === skillName);
			if (found) {
				log("PASS", "List skills (find our skill)", `total=${r.json.length}, found=${skillName}`);
			} else {
				log("FAIL", "List skills (find our skill)", `skill not found in list of ${r.json.length}`);
			}
		} else {
			log("FAIL", "List skills", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "List skills", e.message);
	}

	// DELETE
	try {
		const r = await rpc("skillProgress/delete", { skillName: skillName });
		if (r.ok) {
			log("PASS", "Delete skill progress", `skill=${skillName}`);
		} else {
			log("FAIL", "Delete skill progress", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete skill progress", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("skillProgress/get", { skillName: skillName });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify skill deletion", `status=${r.status}`);
		} else {
			log("FAIL", "Verify skill deletion", "skill still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify skill deletion (threw error)", e.message);
	}
}

// ============================================================================
// 4. PORTFOLIO PROJECTS CRUD (workSamples)
// ============================================================================

async function testPortfolioProjectsCRUD() {
	section("4. PORTFOLIO PROJECTS - Full CRUD Cycle");

	let projectId = null;

	// CREATE
	try {
		const r = await rpc("workSamples/createProject", {
			title: "CRUD Test Project",
			description: "A test project created by automated CRUD testing",
			type: "fullstack",
			status: "in-progress",
			technologies: [
				{ name: "TypeScript", category: "frontend" },
				{ name: "PostgreSQL", category: "database" },
			],
			skills: ["Testing", "Automation"],
			featured: false,
		});
		if (r.ok && r.json) {
			projectId = r.json;
			log("PASS", "Create portfolio project", `id=${projectId}`);
		} else {
			log("FAIL", "Create portfolio project", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create portfolio project", e.message);
		return;
	}

	// READ
	try {
		const r = await rpc("workSamples/getProjectById", { id: projectId });
		if (r.ok && r.json?.title === "CRUD Test Project") {
			log("PASS", "Read portfolio project", `title=${r.json.title}, type=${r.json.type}`);
		} else {
			log("FAIL", "Read portfolio project", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read portfolio project", e.message);
	}

	// UPDATE
	try {
		const r = await rpc("workSamples/updateProject", {
			id: projectId,
			title: "Updated CRUD Test Project",
			status: "completed",
			description: "Updated description from CRUD test",
		});
		if (r.ok) {
			log("PASS", "Update portfolio project", "title + status updated");
		} else {
			log("FAIL", "Update portfolio project", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update portfolio project", e.message);
	}

	// VERIFY UPDATE
	try {
		const r = await rpc("workSamples/getProjectById", { id: projectId });
		if (r.ok && r.json?.title === "Updated CRUD Test Project" && r.json?.status === "completed") {
			log("PASS", "Verify project update", `title=${r.json.title}, status=${r.json.status}`);
		} else {
			log("FAIL", "Verify project update", `got title=${r.json?.title}, status=${r.json?.status}`);
		}
	} catch (e) {
		log("FAIL", "Verify project update", e.message);
	}

	// TOGGLE FEATURED
	try {
		const r = await rpc("workSamples/toggleFeatured", { id: projectId, featured: true });
		if (r.ok) {
			log("PASS", "Toggle featured status", "featured -> true");
		} else {
			log("FAIL", "Toggle featured status", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Toggle featured status", e.message);
	}

	// VERIFY FEATURED
	try {
		const r = await rpc("workSamples/getProjectById", { id: projectId });
		if (r.ok && r.json?.featured === true) {
			log("PASS", "Verify featured toggle", `featured=${r.json.featured}`);
		} else {
			log("FAIL", "Verify featured toggle", `expected featured=true, got ${r.json?.featured}`);
		}
	} catch (e) {
		log("FAIL", "Verify featured toggle", e.message);
	}

	// LIST PROJECTS
	try {
		const r = await rpc("workSamples/listProjects");
		if (r.ok && Array.isArray(r.json)) {
			const found = r.json.find((p) => p.id === projectId);
			if (found) {
				log("PASS", "List projects (find ours)", `total=${r.json.length}`);
			} else {
				log("FAIL", "List projects (find ours)", `project not in list of ${r.json.length}`);
			}
		} else {
			log("FAIL", "List projects", `status=${r.status}`);
		}
	} catch (e) {
		log("FAIL", "List projects", e.message);
	}

	// DELETE
	try {
		const r = await rpc("workSamples/deleteProject", { id: projectId });
		if (r.ok) {
			log("PASS", "Delete portfolio project", `id=${projectId}`);
		} else {
			log("FAIL", "Delete portfolio project", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete portfolio project", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("workSamples/getProjectById", { id: projectId });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify project deletion", `status=${r.status}`);
		} else {
			log("FAIL", "Verify project deletion", "project still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify project deletion (threw error)", e.message);
	}
}

// ============================================================================
// 5. NETWORKING CONTACTS CRUD
// ============================================================================

async function testNetworkingContactsCRUD() {
	section("5. NETWORKING CONTACTS - Full CRUD Cycle");

	let contactId = null;

	// CREATE
	try {
		const r = await rpc("networking/create", {
			name: "Test Contact CRUD",
			email: "testcontact@example.com",
			company: "TestCorp",
			position: "Engineering Manager",
			relationship: "industry_peer",
			relationshipStrength: "moderate",
			howMet: "Created by CRUD test script",
			notes: "Automated test contact",
			tags: ["test", "crud"],
			isFavorite: false,
		});
		if (r.ok && r.json) {
			contactId = r.json;
			log("PASS", "Create networking contact", `id=${contactId}`);
		} else {
			log("FAIL", "Create networking contact", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create networking contact", e.message);
		return;
	}

	// READ
	try {
		const r = await rpc("networking/getById", { id: contactId });
		if (r.ok && r.json?.name === "Test Contact CRUD") {
			log("PASS", "Read networking contact", `name=${r.json.name}, company=${r.json.company}`);
		} else {
			log("FAIL", "Read networking contact", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read networking contact", e.message);
	}

	// UPDATE
	try {
		const r = await rpc("networking/update", {
			id: contactId,
			name: "Updated Test Contact",
			position: "VP of Engineering",
			company: "BigCorp",
			notes: "Updated by CRUD test",
		});
		if (r.ok) {
			log("PASS", "Update networking contact", "name, position, company updated");
		} else {
			log("FAIL", "Update networking contact", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update networking contact", e.message);
	}

	// VERIFY UPDATE
	try {
		const r = await rpc("networking/getById", { id: contactId });
		if (
			r.ok &&
			r.json?.name === "Updated Test Contact" &&
			r.json?.position === "VP of Engineering" &&
			r.json?.company === "BigCorp"
		) {
			log("PASS", "Verify contact update", `name=${r.json.name}, position=${r.json.position}`);
		} else {
			log(
				"FAIL",
				"Verify contact update",
				`got name=${r.json?.name}, position=${r.json?.position}, company=${r.json?.company}`,
			);
		}
	} catch (e) {
		log("FAIL", "Verify contact update", e.message);
	}

	// TOGGLE FAVORITE
	try {
		const r = await rpc("networking/toggleFavorite", { id: contactId });
		if (r.ok) {
			log("PASS", "Toggle favorite", `isFavorite=${r.json}`);
		} else {
			log("FAIL", "Toggle favorite", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Toggle favorite", e.message);
	}

	// LIST CONTACTS
	try {
		const r = await rpc("networking/list");
		if (r.ok && Array.isArray(r.json)) {
			const found = r.json.find((c) => c.id === contactId);
			if (found) {
				log("PASS", "List contacts (find ours)", `total=${r.json.length}`);
			} else {
				log("FAIL", "List contacts (find ours)", `contact not in list of ${r.json.length}`);
			}
		} else {
			log("FAIL", "List contacts", `status=${r.status}`);
		}
	} catch (e) {
		log("FAIL", "List contacts", e.message);
	}

	// DELETE
	try {
		const r = await rpc("networking/delete", { id: contactId });
		if (r.ok) {
			log("PASS", "Delete networking contact", `id=${contactId}`);
		} else {
			log("FAIL", "Delete networking contact", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete networking contact", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("networking/getById", { id: contactId });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify contact deletion", `status=${r.status}`);
		} else {
			log("FAIL", "Verify contact deletion", "contact still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify contact deletion (threw error)", e.message);
	}
}

// ============================================================================
// 6. INTERVIEW SESSIONS
// ============================================================================

async function testInterviewSessionsCRUD() {
	section("6. INTERVIEW SESSIONS - Create/Read/Delete Cycle");

	let sessionId = null;

	// CREATE SESSION
	try {
		const r = await rpc("interview/createSession", {
			title: "CRUD Test Interview",
			description: "Created by automated test script",
			field: "general",
			types: ["behavioral"],
			difficulty: "beginner",
			language: "en",
			questions: [
				{
					id: "test-q-1",
					question: "Tell me about yourself",
					type: "behavioral",
					field: "general",
					difficulty: "beginner",
					order: 1,
				},
				{
					id: "test-q-2",
					question: "What is your greatest strength?",
					type: "behavioral",
					field: "general",
					difficulty: "beginner",
					order: 2,
				},
			],
		});
		if (r.ok && r.json?.id) {
			sessionId = r.json.id;
			log("PASS", "Create interview session", `id=${sessionId}, questions=${r.json.totalQuestions}`);
		} else {
			log("FAIL", "Create interview session", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Create interview session", e.message);
		return;
	}

	// READ SESSION
	try {
		const r = await rpc("interview/getSession", { sessionId: sessionId });
		if (r.ok && r.json?.title === "CRUD Test Interview") {
			log(
				"PASS",
				"Read interview session",
				`title=${r.json.title}, status=${r.json.status}, questions=${r.json.totalQuestions}`,
			);
		} else {
			log("FAIL", "Read interview session", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Read interview session", e.message);
	}

	// START SESSION
	try {
		const r = await rpc("interview/startSession", { sessionId: sessionId });
		if (r.ok && r.json?.status === "in_progress") {
			log("PASS", "Start interview session", `status=${r.json.status}`);
		} else {
			log("FAIL", "Start interview session", `status=${r.status} ${JSON.stringify(r.json).slice(0, 150)}`);
		}
	} catch (e) {
		log("FAIL", "Start interview session", e.message);
	}

	// LIST SESSIONS
	try {
		const r = await rpc("interview/getSessions", { limit: 10, offset: 0 });
		if (r.ok && Array.isArray(r.json)) {
			const found = r.json.find((s) => s.id === sessionId);
			if (found) {
				log("PASS", "List sessions (find ours)", `total=${r.json.length}, ours status=${found.status}`);
			} else {
				log("FAIL", "List sessions (find ours)", `session not in list of ${r.json.length}`);
			}
		} else {
			log("FAIL", "List sessions", `status=${r.status}`);
		}
	} catch (e) {
		log("FAIL", "List sessions", e.message);
	}

	// DELETE SESSION
	try {
		const r = await rpc("interview/deleteSession", { sessionId: sessionId });
		if (r.ok) {
			log("PASS", "Delete interview session", `id=${sessionId}`);
		} else {
			log("FAIL", "Delete interview session", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Delete interview session", e.message);
	}

	// VERIFY DELETION
	try {
		const r = await rpc("interview/getSession", { sessionId: sessionId });
		if (!r.ok || r.status >= 400) {
			log("PASS", "Verify session deletion", `status=${r.status}`);
		} else {
			log("FAIL", "Verify session deletion", "session still exists after delete");
		}
	} catch (e) {
		log("PASS", "Verify session deletion (threw error)", e.message);
	}
}

// ============================================================================
// 7. USER SETTINGS
// ============================================================================

async function testUserSettings() {
	section("7. USER SETTINGS - Read/Update/Verify Cycle");

	let originalLanguage = null;

	// READ CURRENT SETTING
	try {
		const r = await rpc("userSettings/getPreferredAiLanguage");
		if (r.ok && r.json?.language) {
			originalLanguage = r.json.language;
			log("PASS", "Read AI language preference", `language=${originalLanguage}`);
		} else {
			log("FAIL", "Read AI language preference", `status=${r.status} ${r.text?.slice(0, 200)}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Read AI language preference", e.message);
		return;
	}

	// UPDATE SETTING
	const newLanguage = originalLanguage === "en" ? "fr" : "en";
	try {
		const r = await rpc("userSettings/updatePreferredAiLanguage", { language: newLanguage });
		if (r.ok && r.json?.success) {
			log("PASS", "Update AI language preference", `changed to '${newLanguage}'`);
		} else {
			log("FAIL", "Update AI language preference", `status=${r.status} ${r.text?.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update AI language preference", e.message);
	}

	// VERIFY UPDATE
	try {
		const r = await rpc("userSettings/getPreferredAiLanguage");
		if (r.ok && r.json?.language === newLanguage) {
			log("PASS", "Verify setting update persisted", `language=${r.json.language}`);
		} else {
			log("FAIL", "Verify setting update persisted", `expected '${newLanguage}', got '${r.json?.language}'`);
		}
	} catch (e) {
		log("FAIL", "Verify setting update persisted", e.message);
	}

	// RESTORE ORIGINAL SETTING
	try {
		const r = await rpc("userSettings/updatePreferredAiLanguage", { language: originalLanguage });
		if (r.ok && r.json?.success) {
			log("PASS", "Restore original setting", `restored to '${originalLanguage}'`);
		} else {
			log("FAIL", "Restore original setting", `status=${r.status}`);
		}
	} catch (e) {
		log("FAIL", "Restore original setting", e.message);
	}

	// VERIFY RESTORE
	try {
		const r = await rpc("userSettings/getPreferredAiLanguage");
		if (r.ok && r.json?.language === originalLanguage) {
			log("PASS", "Verify setting restored", `language=${r.json.language}`);
		} else {
			log("FAIL", "Verify setting restored", `expected '${originalLanguage}', got '${r.json?.language}'`);
		}
	} catch (e) {
		log("FAIL", "Verify setting restored", e.message);
	}
}

// ============================================================================
// BONUS: Update user profile name via Better Auth
// ============================================================================

async function testProfileNameUpdate() {
	section("7b. USER PROFILE NAME - Update via Better Auth");

	let originalName = null;

	// Read current session to get name
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.name) {
			originalName = body.user.name;
			log("PASS", "Read current profile name", `name='${originalName}'`);
		} else {
			log("FAIL", "Read current profile name", `status=${res.status}`);
			return;
		}
	} catch (e) {
		log("FAIL", "Read current profile name", e.message);
		return;
	}

	// Update name via Better Auth
	const testName = "CRUD Test Student";
	try {
		const res = await fetch(`${BASE_URL}/api/auth/update-user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: sessionCookie,
				Origin: BASE_URL,
			},
			body: JSON.stringify({ name: testName }),
		});
		if (res.ok) {
			log("PASS", "Update profile name", `name -> '${testName}'`);
		} else {
			const text = await res.text();
			log("FAIL", "Update profile name", `status=${res.status} ${text.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Update profile name", e.message);
	}

	// Verify name change
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.name === testName) {
			log("PASS", "Verify name update", `name='${body.user.name}'`);
		} else {
			log("FAIL", "Verify name update", `expected '${testName}', got '${body?.user?.name}'`);
		}
	} catch (e) {
		log("FAIL", "Verify name update", e.message);
	}

	// Restore original name
	try {
		const res = await fetch(`${BASE_URL}/api/auth/update-user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: sessionCookie,
				Origin: BASE_URL,
			},
			body: JSON.stringify({ name: originalName }),
		});
		if (res.ok) {
			log("PASS", "Restore original name", `name -> '${originalName}'`);
		} else {
			log("FAIL", "Restore original name", `status=${res.status}`);
		}
	} catch (e) {
		log("FAIL", "Restore original name", e.message);
	}
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("\x1b[1m\x1b[36m============================================================\x1b[0m");
	console.log("\x1b[1m\x1b[36m   Comprehensive CRUD Test Suite                            \x1b[0m");
	console.log("\x1b[1m\x1b[36m   7 Feature Areas | Full Create-Read-Update-Delete Cycles  \x1b[0m");
	console.log("\x1b[1m\x1b[36m============================================================\x1b[0m");
	console.log(`Server: ${BASE_URL}`);
	console.log(`User:   ${CREDENTIALS.email}\n`);

	const loggedIn = await login();
	if (!loggedIn) {
		console.log("\n\x1b[31mCannot proceed without authentication. Aborting.\x1b[0m\n");
		process.exit(1);
	}

	await testJobApplicationsCRUD();
	await testGoalsCRUD();
	await testSkillsTrackingCRUD();
	await testPortfolioProjectsCRUD();
	await testNetworkingContactsCRUD();
	await testInterviewSessionsCRUD();
	await testUserSettings();
	await testProfileNameUpdate();

	// SUMMARY
	console.log("\n\x1b[1m============================================================\x1b[0m");
	console.log("\x1b[1m   SUMMARY\x1b[0m");
	console.log("\x1b[1m============================================================\x1b[0m");
	console.log(`  \x1b[32mPASSED:  ${passed}\x1b[0m`);
	console.log(`  \x1b[31mFAILED:  ${failed}\x1b[0m`);
	console.log(`  \x1b[33mSKIPPED: ${skipped}\x1b[0m`);
	console.log(`  TOTAL:   ${passed + failed + skipped}\n`);

	if (failed > 0) {
		console.log("\x1b[31m\x1b[1m  Failed tests:\x1b[0m");
		for (const r of results.filter((r) => r.status === "FAIL")) {
			console.log(`    \x1b[31m FAIL\x1b[0m  ${r.name}: ${r.detail}`);
		}
		console.log("");
	}

	// Per-section summary
	const sections = [
		{ label: "Job Applications", prefix: "job application" },
		{ label: "Career Goals", prefix: "goal" },
		{ label: "Skills Tracking", prefix: "skill" },
		{ label: "Portfolio Projects", prefix: "portfolio project" },
		{ label: "Networking Contacts", prefix: "networking contact" },
		{ label: "Interview Sessions", prefix: "interview session" },
		{ label: "User Settings", prefix: "setting" },
		{ label: "Profile Name", prefix: "profile name" },
	];

	console.log("\x1b[1m  Per-feature breakdown:\x1b[0m");
	for (const s of sections) {
		const sectionResults = results.filter((r) => r.name.toLowerCase().includes(s.prefix.toLowerCase()));
		if (sectionResults.length === 0) continue;
		const sPassed = sectionResults.filter((r) => r.status === "PASS").length;
		const sFailed = sectionResults.filter((r) => r.status === "FAIL").length;
		const icon = sFailed === 0 ? "\x1b[32m OK \x1b[0m" : "\x1b[31mFAIL\x1b[0m";
		console.log(`    ${icon}  ${s.label}: ${sPassed}/${sectionResults.length} passed`);
	}
	console.log("");

	process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
	console.error("\x1b[31mFatal error:\x1b[0m", err);
	process.exit(1);
});
