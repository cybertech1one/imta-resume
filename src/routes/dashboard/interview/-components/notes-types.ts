import type { RouterOutput } from "@/integrations/orpc/client";

export type InterviewNote = RouterOutput["interviewNotes"]["list"][number];
export type InterviewNoteType = InterviewNote["type"];
export type InterviewNoteStatus = InterviewNote["status"];
export type InterviewNoteImpression = NonNullable<InterviewNote["overallImpression"]>;
