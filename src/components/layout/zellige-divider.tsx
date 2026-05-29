import { motion } from "motion/react";

export function ZelligeDivider() {
	return (
		<div className="relative h-12 w-full overflow-hidden opacity-20">
			<motion.div
				className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.5, ease: "circOut" }}
			/>
			<div className="moroccan-pattern absolute inset-0 opacity-40" style={{ backgroundSize: "40px 40px" }} />
		</div>
	);
}
