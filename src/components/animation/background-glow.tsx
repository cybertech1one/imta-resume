import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

export function BackgroundGlow() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
	const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			mouseX.set(e.clientX);
			mouseY.set(e.clientY);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			<motion.div
				className="absolute size-[500px] rounded-full bg-primary/5 blur-[120px]"
				style={{
					x: springX,
					y: springY,
					translateX: "-50%",
					translateY: "-50%",
				}}
			/>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,white_100%)] opacity-40" />
		</div>
	);
}
