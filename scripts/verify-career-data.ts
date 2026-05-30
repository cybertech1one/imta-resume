import {
	careerDescriptions,
	careerPrograms,
	marketInsightsData,
	topEmployersData,
} from "../src/integrations/orpc/router/career-data";

const fields = ["healthcare", "industrial", "hse", "technology", "management"] as const;
console.log("field        | careerPrograms | marketInsight | employers | description");
for (const f of fields) {
	const cp = careerPrograms.filter((p) => p.category === f).length;
	const mi = marketInsightsData[f] ? "yes" : "NO";
	const emp = topEmployersData.filter((e) => e.hiringFields.includes(f)).length;
	const desc = careerDescriptions[f] ? "yes" : "NO";
	console.log(
		`${f.padEnd(12)} | ${String(cp).padStart(13)}  | ${mi.padEnd(13)} | ${String(emp).padStart(8)}  | ${desc}`,
	);
}
