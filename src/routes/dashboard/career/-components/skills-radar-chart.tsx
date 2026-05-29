import { motion } from "motion/react";

import type { SkillGap } from "./gap-analysis-types";

export function SkillsRadarChart({ gaps, size = 300 }: { gaps: SkillGap[]; size?: number }) {
	const centerX = size / 2;
	const centerY = size / 2;
	const maxRadius = size / 2 - 40;

	// Limit to max 8 skills for readability
	const displayGaps = gaps.slice(0, 8);
	const angleStep = (2 * Math.PI) / displayGaps.length;

	// Calculate points for current and required levels
	const currentPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.currentLevel / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const requiredPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.requiredLevel / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const benchmarkPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.industryBenchmark / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const currentPath = `${currentPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;
	const requiredPath = `${requiredPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;
	const benchmarkPath = `${benchmarkPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;

	return (
		<svg viewBox={`0 0 ${size} ${size}`} className="size-full max-h-[350px]">
			{/* Background circles */}
			{[1, 2, 3, 4, 5].map((level) => (
				<circle
					key={level}
					cx={centerX}
					cy={centerY}
					r={(level / 5) * maxRadius}
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.1"
					strokeWidth="1"
				/>
			))}

			{/* Axis lines and labels */}
			{displayGaps.map((gap, i) => {
				const angle = i * angleStep - Math.PI / 2;
				const endX = centerX + maxRadius * Math.cos(angle);
				const endY = centerY + maxRadius * Math.sin(angle);
				const labelX = centerX + (maxRadius + 25) * Math.cos(angle);
				const labelY = centerY + (maxRadius + 25) * Math.sin(angle);

				return (
					<g key={gap.skillName}>
						<line
							x1={centerX}
							y1={centerY}
							x2={endX}
							y2={endY}
							stroke="currentColor"
							strokeOpacity="0.2"
							strokeWidth="1"
						/>
						<text
							x={labelX}
							y={labelY}
							textAnchor="middle"
							dominantBaseline="middle"
							className="fill-current font-medium text-[8px]"
						>
							{gap.skillNameFr.length > 12 ? `${gap.skillNameFr.slice(0, 12)}...` : gap.skillNameFr}
						</text>
					</g>
				);
			})}

			{/* Industry benchmark area */}
			<motion.path
				d={benchmarkPath}
				fill="oklch(0.7 0.1 200 / 0.1)"
				stroke="oklch(0.6 0.15 200)"
				strokeWidth="1"
				strokeDasharray="4 2"
				initial={false}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			/>

			{/* Required level area */}
			<motion.path
				d={requiredPath}
				fill="oklch(0.7 0.15 30 / 0.15)"
				stroke="oklch(0.6 0.2 30)"
				strokeWidth="2"
				initial={false}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.6, delay: 0.3 }}
			/>

			{/* Current level area */}
			<motion.path
				d={currentPath}
				fill="oklch(0.7 0.2 250 / 0.3)"
				stroke="oklch(0.5 0.25 250)"
				strokeWidth="2"
				initial={false}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, delay: 0.4 }}
			/>

			{/* Current level points */}
			{currentPoints.map((point, i) => (
				<motion.circle
					key={i}
					cx={point.x}
					cy={point.y}
					r="4"
					fill="oklch(0.5 0.25 250)"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
				/>
			))}
		</svg>
	);
}
