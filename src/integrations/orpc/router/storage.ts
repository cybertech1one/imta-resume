import { ORPCError } from "@orpc/server";
import z from "zod";
import { protectedProcedure, uploadRateLimitedProcedure } from "../context";
import { getStorageService, isImageFile, processImageForUpload, uploadFile } from "../services/storage";

const storageService = getStorageService();

const fileSchema = z.file().max(10 * 1024 * 1024, "File size must be less than 10MB");

const filenameSchema = z.object({ filename: z.string().min(1) });

// Allowlist of MIME types that can be uploaded.
// Restricts uploads to images and PDFs to prevent XSS via HTML/SVG with embedded scripts.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

export const storageRouter = {
	uploadFile: uploadRateLimitedProcedure
		.route({ tags: ["Internal"], summary: "Upload a file" })
		.input(fileSchema)
		.output(
			z.object({
				url: z.string(),
				path: z.string(),
				contentType: z.string(),
			}),
		)
		.handler(async ({ context, input: file }) => {
			const originalMimeType = file.type || "";

			// Validate MIME type against allowlist to prevent malicious file uploads
			if (!ALLOWED_MIME_TYPES.some((allowed) => originalMimeType.startsWith(allowed))) {
				throw new ORPCError("BAD_REQUEST", {
					message: "File type not allowed. Accepted types: JPEG, PNG, GIF, WebP, PDF.",
				});
			}

			const isImage = isImageFile(originalMimeType);

			let data: Uint8Array;
			let contentType: string;

			if (isImage) {
				const processed = await processImageForUpload(file);
				data = processed.data;
				contentType = processed.contentType;
			} else {
				const fileBuffer = await file.arrayBuffer();
				data = new Uint8Array(fileBuffer);
				contentType = originalMimeType;
			}

			const result = await uploadFile({
				userId: context.user.id,
				data,
				contentType,
				type: "picture",
			});

			return {
				url: result.url,
				path: result.key,
				contentType,
			};
		}),

	deleteFile: protectedProcedure
		.route({ tags: ["Internal"], summary: "Delete a file" })
		.input(filenameSchema)
		.output(z.void())
		.handler(async ({ context, input }): Promise<void> => {
			const key = input.filename.startsWith("uploads/")
				? input.filename
				: `uploads/${context.user.id}/pictures/${input.filename}`;

			if (!key.startsWith(`uploads/${context.user.id}/`)) {
				throw new ORPCError("FORBIDDEN", { message: "Access denied" });
			}

			const deleted = await storageService.delete(key);

			if (!deleted) throw new ORPCError("NOT_FOUND");
		}),
};
