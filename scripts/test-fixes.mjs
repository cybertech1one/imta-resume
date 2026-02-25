/**
 * Quick test for AI fixes - tests all critical endpoints
 */
const BASE_URL = "http://localhost:3040";

async function test() {
	const results = [];
	function log(name, pass, detail) {
		const icon = pass ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
		console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
		results.push({ name, pass });
	}

	// Login
	try {
		const authRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: BASE_URL },
			body: JSON.stringify({ email: "admin@test.com", password: "TestAccount123!" }),
		});
		const cookie = authRes.headers.get("set-cookie")?.split(";")[0] || "";
		const authData = await authRes.json();
		log("Auth Login", authRes.status === 200, authData.user?.email);

		const h = { Origin: BASE_URL, Cookie: cookie };
		const hPost = { ...h, "Content-Type": "application/json" };

		// 1. AI Status
		const s = await (await fetch(`${BASE_URL}/api/rpc/aiConfig/status/check`, { headers: h })).json();
		log("AI Status", s.json?.available === true, `available=${s.json?.available}, provider=${s.json?.provider?.displayName}`);

		// 2. Resume List
		const r = await (await fetch(`${BASE_URL}/api/rpc/resume/list`, { headers: h })).json();
		log("Resume List", Array.isArray(r.json), `${r.json?.length || 0} resumes`);

		// 3. AI History List
		const hist = await (await fetch(`${BASE_URL}/api/rpc/aiHistory/list`, { headers: h })).json();
		log("AI History List", Array.isArray(hist.json), hist.json?.code || `${hist.json?.length || 0} items`);

		// 4. AI Writer List
		const wr = await (await fetch(`${BASE_URL}/api/rpc/aiWriter/list`, { headers: h })).json();
		log("AI Writer List", Array.isArray(wr.json), wr.json?.code || `${wr.json?.length || 0} items`);

		// 5. AI Providers
		const prov = await (await fetch(`${BASE_URL}/api/rpc/aiConfig/providers/list`, { headers: h })).json();
		log("AI Providers", Array.isArray(prov.json), `${prov.json?.length || 0} providers`);

		// 6. Voice Interview Sessions
		const vi = await (await fetch(`${BASE_URL}/api/rpc/voiceInterview/sessions/list`, { headers: h })).json();
		const viOk = vi.json?.items !== undefined || Array.isArray(vi.json);
		log("Voice Interview List", viOk, vi.json?.code || `${vi.json?.items?.length ?? 0} sessions, total=${vi.json?.total ?? "?"}`);


		// 7. AI Improve Content (streaming)
		const imp = await fetch(`${BASE_URL}/api/rpc/ai/improveContent`, {
			method: "POST",
			headers: hPost,
			body: JSON.stringify({ json: { content: "i am a good worker and i do tasks", language: "en" } }),
		});
		const impText = await imp.text();
		log("AI Improve Content", imp.status === 200, `${impText.length} bytes streamed`);

		// 8. AI History Save (via improve content - check server logs)
		const hist2 = await (await fetch(`${BASE_URL}/api/rpc/aiHistory/list`, { headers: h })).json();
		const histSaved = Array.isArray(hist2.json) && hist2.json.length > 0;
		log("AI History Saved", histSaved, hist2.json?.code || `${hist2.json?.length || 0} items after improve`);

		// Summary
		const passed = results.filter((r) => r.pass).length;
		const total = results.length;
		console.log(`\n\x1b[1m${passed}/${total} passed\x1b[0m`);
	} catch (e) {
		console.error("FATAL:", e.message);
	}
}

test();
