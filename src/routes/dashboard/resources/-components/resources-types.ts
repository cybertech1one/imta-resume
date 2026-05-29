// User's tracked training interests
export interface TrainingInterest {
	id: string;
	programId: string;
	programName: string;
	category: string;
	addedAt: string;
	progress: number;
	notes: string;
}
