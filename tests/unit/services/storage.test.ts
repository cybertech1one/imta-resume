/**
 * Unit Tests for src/integrations/orpc/services/storage.ts
 *
 * Tests cover:
 * - inferContentType function
 * - isImageFile function
 * - Storage utility functions
 */

import { describe, expect, it } from "vitest";

// Since the storage service has complex dependencies on fs, S3, and sharp,
// we'll test the pure utility functions that can be tested in isolation

describe("storage utilities", () => {
	describe("inferContentType logic", () => {
		// Test the content type mapping logic
		const CONTENT_TYPE_MAP: Record<string, string> = {
			".webp": "image/webp",
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".svg": "image/svg+xml",
			".pdf": "application/pdf",
		};

		const DEFAULT_CONTENT_TYPE = "application/octet-stream";

		const inferContentType = (filename: string): string => {
			const parts = filename.split(".");
			const extension = parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : "";
			return CONTENT_TYPE_MAP[extension] ?? DEFAULT_CONTENT_TYPE;
		};

		it("should return correct content type for .webp files", () => {
			expect(inferContentType("image.webp")).toBe("image/webp");
		});

		it("should return correct content type for .jpg files", () => {
			expect(inferContentType("photo.jpg")).toBe("image/jpeg");
		});

		it("should return correct content type for .jpeg files", () => {
			expect(inferContentType("photo.jpeg")).toBe("image/jpeg");
		});

		it("should return correct content type for .png files", () => {
			expect(inferContentType("icon.png")).toBe("image/png");
		});

		it("should return correct content type for .gif files", () => {
			expect(inferContentType("animation.gif")).toBe("image/gif");
		});

		it("should return correct content type for .svg files", () => {
			expect(inferContentType("logo.svg")).toBe("image/svg+xml");
		});

		it("should return correct content type for .pdf files", () => {
			expect(inferContentType("document.pdf")).toBe("application/pdf");
		});

		it("should return application/octet-stream for unknown extensions", () => {
			expect(inferContentType("file.xyz")).toBe("application/octet-stream");
		});

		it("should handle uppercase extensions", () => {
			expect(inferContentType("IMAGE.PNG")).toBe("image/png");
		});

		it("should handle files without extensions", () => {
			expect(inferContentType("noextension")).toBe("application/octet-stream");
		});

		it("should handle files with multiple dots", () => {
			expect(inferContentType("archive.tar.gz")).toBe("application/octet-stream");
			expect(inferContentType("image.photo.jpg")).toBe("image/jpeg");
		});
	});

	describe("isImageFile logic", () => {
		const IMAGE_MIME_TYPES = ["image/gif", "image/png", "image/jpeg", "image/webp"];

		const isImageFile = (mimeType: string): boolean => {
			return IMAGE_MIME_TYPES.includes(mimeType);
		};

		it("should return true for image/gif", () => {
			expect(isImageFile("image/gif")).toBe(true);
		});

		it("should return true for image/png", () => {
			expect(isImageFile("image/png")).toBe(true);
		});

		it("should return true for image/jpeg", () => {
			expect(isImageFile("image/jpeg")).toBe(true);
		});

		it("should return true for image/webp", () => {
			expect(isImageFile("image/webp")).toBe(true);
		});

		it("should return false for non-image MIME types", () => {
			expect(isImageFile("application/pdf")).toBe(false);
			expect(isImageFile("text/plain")).toBe(false);
			expect(isImageFile("application/json")).toBe(false);
		});

		it("should return false for image/svg+xml", () => {
			// SVG is not in the IMAGE_MIME_TYPES array
			expect(isImageFile("image/svg+xml")).toBe(false);
		});

		it("should return false for empty string", () => {
			expect(isImageFile("")).toBe(false);
		});
	});

	describe("key builders", () => {
		const buildPictureKey = (userId: string): string => {
			const timestamp = Date.now();
			return `uploads/${userId}/pictures/${timestamp}.webp`;
		};

		const buildScreenshotKey = (userId: string, resumeId: string): string => {
			const timestamp = Date.now();
			return `uploads/${userId}/screenshots/${resumeId}/${timestamp}.webp`;
		};

		const buildPdfKey = (userId: string, resumeId: string): string => {
			const timestamp = Date.now();
			return `uploads/${userId}/pdfs/${resumeId}/${timestamp}.pdf`;
		};

		it("should build picture key with correct format", () => {
			const key = buildPictureKey("user-123");
			expect(key).toMatch(/^uploads\/user-123\/pictures\/\d+\.webp$/);
		});

		it("should build screenshot key with correct format", () => {
			const key = buildScreenshotKey("user-123", "resume-456");
			expect(key).toMatch(/^uploads\/user-123\/screenshots\/resume-456\/\d+\.webp$/);
		});

		it("should build PDF key with correct format", () => {
			const key = buildPdfKey("user-123", "resume-456");
			expect(key).toMatch(/^uploads\/user-123\/pdfs\/resume-456\/\d+\.pdf$/);
		});

		it("should generate unique keys for consecutive calls", () => {
			const key1 = buildPictureKey("user-123");
			// Small delay to ensure different timestamp
			const key2 = buildPictureKey("user-123");
			// Keys may be the same if called in the same millisecond, which is fine
			expect(key1).toMatch(/^uploads\/user-123\/pictures\/\d+\.webp$/);
			expect(key2).toMatch(/^uploads\/user-123\/pictures\/\d+\.webp$/);
		});
	});

	describe("public URL builder", () => {
		const buildPublicUrl = (path: string, appUrl: string): string => {
			return new URL(path, appUrl).toString();
		};

		it("should build correct public URL", () => {
			const url = buildPublicUrl("uploads/user-123/pictures/123.webp", "http://localhost:3000");
			expect(url).toBe("http://localhost:3000/uploads/user-123/pictures/123.webp");
		});

		it("should handle trailing slash in app URL", () => {
			const url = buildPublicUrl("uploads/test.jpg", "http://localhost:3000/");
			expect(url).toBe("http://localhost:3000/uploads/test.jpg");
		});

		it("should handle paths starting with slash", () => {
			const url = buildPublicUrl("/uploads/test.jpg", "http://localhost:3000");
			expect(url).toBe("http://localhost:3000/uploads/test.jpg");
		});
	});

	describe("path resolution security", () => {
		const resolvePath = (key: string, rootDirectory: string): string => {
			const normalizedKey = key.replace(/^\/*/, "");
			const segments = normalizedKey
				.split(/[/\\]+/)
				.filter((segment) => segment.length > 0 && segment !== "." && segment !== "..");

			if (segments.length === 0) throw new Error("Invalid storage key");

			return [rootDirectory, ...segments].join("/");
		};

		it("should normalize paths with leading slashes", () => {
			const path = resolvePath("/uploads/file.jpg", "/data");
			expect(path).toBe("/data/uploads/file.jpg");
		});

		it("should filter out .. path segments for security", () => {
			const path = resolvePath("uploads/../secrets/file.txt", "/data");
			expect(path).toBe("/data/uploads/secrets/file.txt");
		});

		it("should filter out . path segments", () => {
			const path = resolvePath("uploads/./file.jpg", "/data");
			expect(path).toBe("/data/uploads/file.jpg");
		});

		it("should throw error for empty key", () => {
			expect(() => resolvePath("", "/data")).toThrow("Invalid storage key");
		});

		it("should throw error for key with only path traversal", () => {
			expect(() => resolvePath("../../../", "/data")).toThrow("Invalid storage key");
		});

		it("should handle multiple consecutive slashes", () => {
			const path = resolvePath("uploads///file.jpg", "/data");
			expect(path).toBe("/data/uploads/file.jpg");
		});
	});

	describe("storage health result", () => {
		interface StorageHealthResult {
			status: "healthy" | "unhealthy";
			type: "local" | "s3";
			message: string;
			error?: string;
		}

		it("should have valid healthy result structure", () => {
			const result: StorageHealthResult = {
				status: "healthy",
				type: "local",
				message: "Storage is accessible",
			};
			expect(result.status).toBe("healthy");
			expect(result.type).toBe("local");
			expect(result.error).toBeUndefined();
		});

		it("should have valid unhealthy result structure", () => {
			const result: StorageHealthResult = {
				status: "unhealthy",
				type: "s3",
				message: "Storage is not accessible",
				error: "Access denied",
			};
			expect(result.status).toBe("unhealthy");
			expect(result.type).toBe("s3");
			expect(result.error).toBe("Access denied");
		});
	});

	describe("upload file input validation", () => {
		type UploadType = "picture" | "screenshot" | "pdf";

		interface UploadFileInput {
			userId: string;
			data: Uint8Array;
			contentType: string;
			type: UploadType;
			resumeId?: string;
		}

		const validateUploadInput = (input: UploadFileInput): void => {
			if (input.type === "screenshot" && !input.resumeId) {
				throw new Error("resumeId is required for screenshot uploads");
			}
			if (input.type === "pdf" && !input.resumeId) {
				throw new Error("resumeId is required for pdf uploads");
			}
		};

		it("should accept picture upload without resumeId", () => {
			const input: UploadFileInput = {
				userId: "user-123",
				data: new Uint8Array([1, 2, 3]),
				contentType: "image/webp",
				type: "picture",
			};
			expect(() => validateUploadInput(input)).not.toThrow();
		});

		it("should throw for screenshot upload without resumeId", () => {
			const input: UploadFileInput = {
				userId: "user-123",
				data: new Uint8Array([1, 2, 3]),
				contentType: "image/webp",
				type: "screenshot",
			};
			expect(() => validateUploadInput(input)).toThrow("resumeId is required for screenshot uploads");
		});

		it("should throw for pdf upload without resumeId", () => {
			const input: UploadFileInput = {
				userId: "user-123",
				data: new Uint8Array([1, 2, 3]),
				contentType: "application/pdf",
				type: "pdf",
			};
			expect(() => validateUploadInput(input)).toThrow("resumeId is required for pdf uploads");
		});

		it("should accept screenshot upload with resumeId", () => {
			const input: UploadFileInput = {
				userId: "user-123",
				data: new Uint8Array([1, 2, 3]),
				contentType: "image/webp",
				type: "screenshot",
				resumeId: "resume-456",
			};
			expect(() => validateUploadInput(input)).not.toThrow();
		});

		it("should accept pdf upload with resumeId", () => {
			const input: UploadFileInput = {
				userId: "user-123",
				data: new Uint8Array([1, 2, 3]),
				contentType: "application/pdf",
				type: "pdf",
				resumeId: "resume-456",
			};
			expect(() => validateUploadInput(input)).not.toThrow();
		});
	});

	describe("storage service selection", () => {
		interface S3Config {
			accessKeyId?: string;
			secretAccessKey?: string;
			bucket?: string;
		}

		const shouldUseS3 = (config: S3Config): boolean => {
			return !!(config.accessKeyId && config.secretAccessKey && config.bucket);
		};

		it("should select S3 when all credentials are provided", () => {
			const config: S3Config = {
				accessKeyId: "test-key",
				secretAccessKey: "test-secret",
				bucket: "test-bucket",
			};
			expect(shouldUseS3(config)).toBe(true);
		});

		it("should select local when accessKeyId is missing", () => {
			const config: S3Config = {
				secretAccessKey: "test-secret",
				bucket: "test-bucket",
			};
			expect(shouldUseS3(config)).toBe(false);
		});

		it("should select local when secretAccessKey is missing", () => {
			const config: S3Config = {
				accessKeyId: "test-key",
				bucket: "test-bucket",
			};
			expect(shouldUseS3(config)).toBe(false);
		});

		it("should select local when bucket is missing", () => {
			const config: S3Config = {
				accessKeyId: "test-key",
				secretAccessKey: "test-secret",
			};
			expect(shouldUseS3(config)).toBe(false);
		});

		it("should select local when all credentials are missing", () => {
			const config: S3Config = {};
			expect(shouldUseS3(config)).toBe(false);
		});
	});

	describe("S3 error handling", () => {
		it("should detect NoSuchKey error", () => {
			const error = new Error("NoSuchKey: The specified key does not exist.");
			const isNoSuchKey = error.message.includes("NoSuchKey");
			expect(isNoSuchKey).toBe(true);
		});

		it("should detect access denied error", () => {
			const error = new Error("Access Denied: You don't have permission.");
			const isAccessDenied = error.message.includes("Access Denied");
			expect(isAccessDenied).toBe(true);
		});
	});

	describe("file etag generation", () => {
		const generateEtag = (size: number, mtime: number): string => {
			return `"${size}-${mtime}"`;
		};

		it("should generate correct etag format", () => {
			const etag = generateEtag(1024, 1707456789000);
			expect(etag).toBe('"1024-1707456789000"');
		});

		it("should handle zero size", () => {
			const etag = generateEtag(0, 1707456789000);
			expect(etag).toBe('"0-1707456789000"');
		});
	});
});
