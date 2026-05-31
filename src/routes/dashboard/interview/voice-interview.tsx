import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, ClockIcon, DownloadIcon, MicrophoneIcon, SparkleIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardHeader } from "../-components/header";
import { InterviewPhaseView, SetupPhase } from "./-components/voice-interview-components";
import { PANEL_MEMBERS } from "./-components/voice-interview-config";
import type {
	Difficulty,
	InterviewPhase,
	InterviewType,
	Language,
	PanelMember,
	TranscriptEntry,
} from "./-components/voice-interview-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/voice-interview" as any)({
	component: VoiceInterviewPage,
	errorComponent: ErrorComponent,
});

function VoiceInterviewPage() {
	// Interview state
	const [phase, setPhase] = useState<InterviewPhase>("setup");
	const [targetRole, setTargetRole] = useState("");
	const [targetCompany, setTargetCompany] = useState("");
	const [interviewType, setInterviewType] = useState<InterviewType>("single");
	const [panelSize, setPanelSize] = useState(2);
	const [difficulty, setDifficulty] = useState<Difficulty>("medium");
	const [language, setLanguage] = useState<Language>("fr");

	// Audio state
	const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
	const [isMuted, setIsMuted] = useState(false);
	const [isUserSpeaking, setIsUserSpeaking] = useState(false);
	const [audioLevel, setAudioLevel] = useState(0);

	// Interview session state
	const [panelMembers, setPanelMembers] = useState<PanelMember[]>([]);
	const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
	const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
	const [interviewDuration, setInterviewDuration] = useState(0);
	const [isInterviewActive, setIsInterviewActive] = useState(false);

	// Refs
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const transcriptEndRef = useRef<HTMLDivElement>(null);

	// Check microphone permission
	const checkMicPermission = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for (const track of stream.getTracks()) track.stop();
			setHasMicPermission(true);
		} catch {
			setHasMicPermission(false);
		}
	}, []);

	useEffect(() => {
		checkMicPermission();
	}, [checkMicPermission]);

	// Initialize audio analysis
	const initAudioAnalysis = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			const audioContext = new AudioContext();
			audioContextRef.current = audioContext;

			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			analyserRef.current = analyser;

			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);

			// Audio level monitoring
			const dataArray = new Uint8Array(analyser.frequencyBinCount);
			const updateAudioLevel = () => {
				if (!analyserRef.current) return;
				analyserRef.current.getByteFrequencyData(dataArray);
				const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
				setAudioLevel(average / 255);
				setIsUserSpeaking(average > 30);
				requestAnimationFrame(updateAudioLevel);
			};
			updateAudioLevel();
		} catch (error) {
			console.error("Failed to initialize audio:", error);
		}
	}, []);

	// Cleanup audio
	const cleanupAudio = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) track.stop();
			streamRef.current = null;
		}
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}
		analyserRef.current = null;
	}, []);

	// Add transcript entry
	const addTranscriptEntry = useCallback((speaker: PanelMember | "user", text: string) => {
		const entry: TranscriptEntry = {
			id: `entry-${Date.now()}`,
			speaker: speaker === "user" ? "You" : speaker.name,
			speakerId: speaker === "user" ? "user" : speaker.id,
			text,
			timestamp: Date.now(),
			isUser: speaker === "user",
		};
		setTranscript((prev) => [...prev, entry]);
	}, []);

	// Start interview
	const startInterview = useCallback(async () => {
		// Select panel members based on type and size
		const selectedMembers = interviewType === "single" ? [PANEL_MEMBERS[0]] : PANEL_MEMBERS.slice(0, panelSize);

		setPanelMembers(selectedMembers);
		setActiveSpeaker(selectedMembers[0].id);
		setTranscript([]);
		setInterviewDuration(0);
		setIsInterviewActive(true);
		setPhase("interview");

		// Initialize audio
		await initAudioAnalysis();

		// Start timer
		timerRef.current = setInterval(() => {
			setInterviewDuration((prev) => prev + 1);
		}, 1000);

		// Simulate initial greeting
		setTimeout(() => {
			addTranscriptEntry(
				selectedMembers[0],
				t`Hello and welcome to this interview for the position of ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}. I am ${selectedMembers[0].name}, ${selectedMembers[0].role}. Could you start by introducing yourself?`,
			);
		}, 1000);
	}, [interviewType, panelSize, targetRole, targetCompany, initAudioAnalysis, addTranscriptEntry]);

	// Scroll to bottom of transcript
	useEffect(() => {
		transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	// End interview
	//
	// HONESTY NOTE: This page is a Beta simulation — it does not yet transcribe
	// the candidate's speech or run a real evaluation. Previously it fabricated a
	// score and detailed feedback with Math.random() and showed it as if it were
	// a real assessment, which is dishonest. Until real speech-to-text +
	// AI evaluation is wired here, we show an honest "coming soon" feedback state
	// instead of inventing numbers. (A real `voiceInterview.feedback.generate`
	// backend exists but requires a genuinely captured transcript, which this
	// simulation does not produce.)
	const endInterview = useCallback(() => {
		setIsInterviewActive(false);

		// Clear timer
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		// Cleanup audio
		cleanupAudio();

		setPhase("feedback");
	}, [cleanupAudio]);

	// Toggle mute
	const toggleMute = useCallback(() => {
		if (streamRef.current) {
			const audioTracks = streamRef.current.getAudioTracks();
			audioTracks.forEach((track) => {
				track.enabled = isMuted;
			});
		}
		setIsMuted(!isMuted);
	}, [isMuted]);

	// Format duration
	const formatDuration = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}, []);

	// Download transcript
	const downloadTranscript = useCallback(() => {
		const content = transcript
			.map((entry) => `[${new Date(entry.timestamp).toLocaleTimeString("fr-FR")}] ${entry.speaker}: ${entry.text}`)
			.join("\n\n");

		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `interview-transcript-${new Date().toISOString().split("T")[0]}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}, [transcript]);

	// Reset for new practice
	const practiceAgain = useCallback(() => {
		setPhase("setup");
		setTranscript([]);
		setInterviewDuration(0);
	}, []);

	// Cleanup timer and audio on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			cleanupAudio();
		};
	}, [cleanupAudio]);

	// Simulate interviewer speaking (for demo)
	useEffect(() => {
		if (phase !== "interview" || !isInterviewActive) return;

		// Rotate active speaker periodically for panel interviews
		if (interviewType === "panel" && panelMembers.length > 1) {
			const rotationInterval = setInterval(() => {
				const currentIndex = panelMembers.findIndex((m) => m.id === activeSpeaker);
				const nextIndex = (currentIndex + 1) % panelMembers.length;
				setActiveSpeaker(panelMembers[nextIndex].id);
			}, 15000);

			return () => clearInterval(rotationInterval);
		}
	}, [phase, isInterviewActive, interviewType, panelMembers, activeSpeaker]);

	// Memoized values
	const canStartInterview = useMemo(() => {
		return targetRole.trim().length > 0 && hasMicPermission === true;
	}, [targetRole, hasMicPermission]);

	return (
		<>
			<DashboardHeader icon={MicrophoneIcon} title={t`Voice Interview (Beta)`} />

			<AnimatePresence mode="wait">
				{phase === "setup" && (
					<SetupPhase
						targetRole={targetRole}
						setTargetRole={setTargetRole}
						targetCompany={targetCompany}
						setTargetCompany={setTargetCompany}
						interviewType={interviewType}
						setInterviewType={setInterviewType}
						panelSize={panelSize}
						setPanelSize={setPanelSize}
						difficulty={difficulty}
						setDifficulty={setDifficulty}
						language={language}
						setLanguage={setLanguage}
						hasMicPermission={hasMicPermission}
						checkMicPermission={checkMicPermission}
						canStartInterview={canStartInterview}
						startInterview={startInterview}
					/>
				)}

				{phase === "interview" && (
					<InterviewPhaseView
						panelMembers={panelMembers}
						activeSpeaker={activeSpeaker}
						transcript={transcript}
						interviewDuration={interviewDuration}
						isUserSpeaking={isUserSpeaking}
						isMuted={isMuted}
						audioLevel={audioLevel}
						targetRole={targetRole}
						targetCompany={targetCompany}
						difficulty={difficulty}
						formatDuration={formatDuration}
						toggleMute={toggleMute}
						endInterview={endInterview}
						transcriptEndRef={transcriptEndRef}
					/>
				)}

				{phase === "feedback" && (
					<motion.div
						key="feedback"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.4 }}
						className="mx-auto max-w-2xl p-4"
					>
						<Card className="overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-primary/10 to-transparent text-center">
								<div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10">
									<SparkleIcon className="size-8 text-primary" weight="duotone" />
								</div>
								<Badge variant="secondary" className="mx-auto mb-2 w-fit">
									<ClockIcon className="mr-1 size-3" />
									<Trans>Coming soon</Trans>
								</Badge>
								<CardTitle>
									<Trans>AI voice analysis — coming soon</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>
										Automatic scoring of your spoken answers is under development. We will not show you a score that has
										not been truly measured.
									</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 p-6 text-center">
								<p className="text-muted-foreground text-sm">
									<Trans>
										Practice for {formatDuration(interviewDuration)} on the role of {targetRole}. You can download the
										transcript of your session below to review your answers.
									</Trans>
								</p>
								<div className="flex flex-col justify-center gap-3 sm:flex-row">
									{transcript.length > 0 && (
										<Button variant="outline" onClick={downloadTranscript}>
											<DownloadIcon className="mr-2 size-4" />
											<Trans>Download transcript</Trans>
										</Button>
									)}
									<Button onClick={practiceAgain}>
										<ArrowClockwiseIcon className="mr-2 size-4" />
										<Trans>Practice again</Trans>
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
