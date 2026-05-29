import type { RouterOutput } from "@/integrations/orpc/client";

export type ResumeVersion = RouterOutput["resumeHistory"]["list"][number];
export type VersionChange = ResumeVersion["changes"][number];
