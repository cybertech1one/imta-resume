import { MinusIcon, NoteIcon, PlusIcon } from "@phosphor-icons/react";

export const formatBytes = (bytes: number) => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const getChangeIcon = (type: "addition" | "deletion" | "modification") => {
	switch (type) {
		case "addition":
			return <PlusIcon className="size-4 text-green-500" />;
		case "deletion":
			return <MinusIcon className="size-4 text-red-500" />;
		case "modification":
			return <NoteIcon className="size-4 text-yellow-500" />;
	}
};
