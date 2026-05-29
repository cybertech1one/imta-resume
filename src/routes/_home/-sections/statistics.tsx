import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ================================================================== */
/*  STATISTICS — bold full-bleed editorial "by the numbers" band       */
/* ================================================================== */

const TERRACOTTA = "oklch(0.55 0.14 35)";
const EMERALD = "oklch(0.4 0.13 160)";
const EMERALD_DEEP = "oklch(0.32 0.11 162)";

type Stat = { value: number; suffix: string; label: string };

const getStats = (): Stat[] => [
	{ value: 200, suffix: "+", label: t`étudiants accompagnés` },
	{ value: 35, suffix: "", label: t`modèles professionnels` },
	{ value: 95, suffix: "%", label: t`taux de satisfaction` },
	{ value: 500, suffix: "+", label: t`CV créés` },
];

function StatCounter({ stat, index }: { stat: Stat; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-50px" });
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!isInView) return;
		const controls = animate(0, stat.value, {
			duration: 1.6,
			delay: index * 0.12,
			ease: "easeOut",
			onUpdate: (v) => setCount(Math.round(v)),
		});
		return () => controls.stop();
	}, [isInView, stat.value, index]);

	return (
		<motion.div
			ref={ref}
			className="relative px-6 text-center"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<div className="font-display text-6xl text-white leading-none tracking-tight md:text-7xl">
				{count}
				<span style={{ color: TERRACOTTA }}>{stat.suffix}</span>
			</div>
			<div className="mt-3 text-white/60 text-xs uppercase tracking-[0.2em]">{stat.label}</div>
		</motion.div>
	);
}

export function Statistics() {
	return (
		<section
			id="statistics"
			className="relative overflow-hidden py-20 md:py-28"
			style={{ background: `linear-gradient(135deg, ${EMERALD_DEEP}, ${EMERALD})` }}
		>
			{/* Faint zellige texture */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-[0.06]"
				style={{
					backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
					backgroundSize: "28px 28px",
				}}
			/>

			<div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
				<motion.p
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-12 text-center font-medium text-white/50 text-xs uppercase tracking-[0.3em]"
				>
					<Trans>L'IMTA en chiffres</Trans>
				</motion.p>

				<div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:divide-x md:divide-white/10">
					{getStats().map((stat, index) => (
						<StatCounter key={stat.label} stat={stat} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
