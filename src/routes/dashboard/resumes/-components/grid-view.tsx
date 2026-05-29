import { AnimatePresence, motion } from "motion/react";
import type { RouterOutput } from "@/integrations/orpc/client";
import { CreateResumeCard } from "./cards/create-card";
import { ImportResumeCard } from "./cards/import-card";
import { ResumeCard } from "./cards/resume-card";

type Resume = RouterOutput["resume"]["list"][number];

type Props = {
	resumes: Resume[];
};

export function GridView({ resumes }: Props) {
	const hasResumes = resumes && resumes.length > 0;

	return (
		<div className="grid 3xl:grid-cols-6 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ type: "spring", stiffness: 400, damping: 28 }}
			>
				<CreateResumeCard />
			</motion.div>

			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ delay: 0.06, type: "spring", stiffness: 400, damping: 28 }}
			>
				<ImportResumeCard />
			</motion.div>

			<AnimatePresence mode="popLayout">
				{hasResumes &&
					resumes.map((resume, index) => (
						<motion.div
							layout
							key={resume.id}
							initial={{ opacity: 0, y: 20, scale: 0.94 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
							transition={{
								delay: Math.min(index, 15) * 0.04,
								type: "spring",
								stiffness: 400,
								damping: 26,
							}}
							className="group/resume-card"
						>
							<ResumeCard resume={resume} />
						</motion.div>
					))}
			</AnimatePresence>
		</div>
	);
}
