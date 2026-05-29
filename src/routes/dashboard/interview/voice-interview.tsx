import { t } from "@lingui/core/macro";
import { ChatCircleIcon, LightningIcon, MicrophoneIcon, SparkleIcon, TargetIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { DashboardHeader } from "../-components/header";
import { FeedbackPhaseView, InterviewPhaseView, SetupPhase } from "./-components/voice-interview-components";
import { PANEL_MEMBERS } from "./-components/voice-interview-config";
import type {
	Difficulty,
	FeedbackCategory,
	InterviewerFeedback,
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

	// Feedback state
	const [overallScore, setOverallScore] = useState(0);
	const [animatedScore, setAnimatedScore] = useState(0);
	const [feedbackCategories, setFeedbackCategories] = useState<FeedbackCategory[]>([]);
	const [strengths, setStrengths] = useState<string[]>([]);
	const [improvements, setImprovements] = useState<string[]>([]);
	const [recommendations, setRecommendations] = useState<string[]>([]);
	const [interviewerFeedback, setInterviewerFeedback] = useState<InterviewerFeedback[]>([]);

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

	// Generate feedback
	const generateFeedback = useCallback(() => {
		const score = Math.floor(Math.random() * 20) + 75; // 75-95
		setOverallScore(score);

		// Animate score counter
		let current = 0;
		const increment = score / 50;
		const animateCounter = () => {
			current += increment;
			if (current < score) {
				setAnimatedScore(Math.floor(current));
				requestAnimationFrame(animateCounter);
			} else {
				setAnimatedScore(score);
			}
		};
		animateCounter();

		// Category scores
		setFeedbackCategories([
			{
				name: "Communication",
				nameFr: "Communication",
				score: Math.floor(Math.random() * 15) + 80,
				maxScore: 100,
				icon: ChatCircleIcon,
				color: "text-blue-500",
			},
			{
				name: "Content",
				nameFr: "Contenu",
				score: Math.floor(Math.random() * 20) + 70,
				maxScore: 100,
				icon: TargetIcon,
				color: "text-emerald-500",
			},
			{
				name: "Confidence",
				nameFr: "Confiance",
				score: Math.floor(Math.random() * 15) + 75,
				maxScore: 100,
				icon: SparkleIcon,
				color: "text-purple-500",
			},
			{
				name: "Technical",
				nameFr: "Technique",
				score: Math.floor(Math.random() * 25) + 65,
				maxScore: 100,
				icon: LightningIcon,
				color: "text-amber-500",
			},
		]);

		// Strengths
		setStrengths([
			t`Excellent personal presentation and clarity of expression`,
			t`Good technical knowledge demonstrated`,
			t`Structured responses with concrete examples`,
			t`Positive and enthusiastic attitude`,
		]);

		// Improvements
		setImprovements([
			t`Deepen problem-solving examples`,
			t`Ask more questions about the company and team`,
			t`Reduce hesitations at the beginning of responses`,
		]);

		// Recommendations
		setRecommendations([
			t`Prepare 3-4 detailed STAR examples for each key competency`,
			t`Research the company more to ask relevant questions`,
			t`Practice strategic pauses before responding`,
			t`Record yourself to analyze your non-verbal language`,
		]);

		// Interviewer feedback
		setInterviewerFeedback(
			panelMembers.map((member) => ({
				interviewerId: member.id,
				interviewer: member,
				impression:
					member.voiceStyle === "technical"
						? t`Good technical foundation, but could go deeper on complex topics.`
						: member.voiceStyle === "challenging"
							? t`The candidate handles pressure well, thoughtful responses.`
							: member.voiceStyle === "friendly"
								? t`Excellent interpersonal skills, would integrate well with the team.`
								: t`Professional and structured profile, good overall presentation.`,
				keyPoints: [
					t`Clear response structure`,
					t`Relevant examples`,
					member.voiceStyle === "technical" ? t`Adequate technical knowledge` : t`Good communication`,
				],
				score: Math.floor(Math.random() * 15) + 75,
			})),
		);
	}, [panelMembers]);

	// End interview
	const endInterview = useCallback(() => {
		setIsInterviewActive(false);

		// Clear timer
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		// Cleanup audio
		cleanupAudio();

		// Generate feedback (simulated)
		generateFeedback();
		setPhase("feedback");
	}, [cleanupAudio, generateFeedback]);

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
			.map((entry) => `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
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
		setOverallScore(0);
		setAnimatedScore(0);
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
					<FeedbackPhaseView
						overallScore={overallScore}
						animatedScore={animatedScore}
						interviewDuration={interviewDuration}
						targetRole={targetRole}
						transcript={transcript}
						feedbackCategories={feedbackCategories}
						strengths={strengths}
						improvements={improvements}
						recommendations={recommendations}
						interviewType={interviewType}
						interviewerFeedback={interviewerFeedback}
						formatDuration={formatDuration}
						downloadTranscript={downloadTranscript}
						practiceAgain={practiceAgain}
					/>
				)}
			</AnimatePresence>
		</>
	);
}
