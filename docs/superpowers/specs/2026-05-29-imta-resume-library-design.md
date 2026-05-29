# IMTA Vocational Resume Example Library — Design

**Date:** 2026-05-29
**Status:** Approved direction (user chose: purge non-IMTA, per-program ~25 each ~300 total, AI-generated, gallery + demo account)
**Author:** Claude (autonomous prod-hardening session)

## Problem

The app already has a "resume examples" feature — a `resume_gallery` table (filled example
resumes, distinct from blank templates), an ORPC router, and a live student UI at
`/dashboard/tools/resume-gallery` (linked in the sidebar). It is populated with **1,111 example
resumes on prod**, but only **24 are IMTA-vocational** (8 healthcare + 8 industrial + 8 HSE with
coarse labels). The other **~1,087 are generic engineering/business/university CVs** (software
engineering 103, finance 91, management 79, marketing 78, plus law, pharmacy, architecture,
tourism, etc.). A nursing or welding student browsing "examples" sees mostly irrelevant CVs.

**Goal:** Replace the gallery contents with a curated, vocational-only library (~300 examples)
mapped to the **actual IMTA programs**, generated with realistic French content, surfaced both
in the gallery UI and as shareable public resumes under a demo account.

## Decisions (from brainstorming)

1. **Existing data:** Purge all non-IMTA gallery rows (backup first). Gallery becomes 100% vocational.
2. **Granularity & count:** Per-program tagging, ~25 each, ~300 total.
3. **Generation:** AI-generated via DeepSeek, validated against `resumeDataSchema`.
4. **Demo account:** Build BOTH — the gallery library AND a demo account holding the same
   resumes as real public `resume` rows with `/exemples/{slug}` URLs.

## Programs (11 real, excludes `other`)

Source of truth: `src/schema/interview/index.ts` (`IMTA_PROGRAMS`) + `imta_program` table.

| Field | Program ids |
|---|---|
| healthcare | infirmier_polyvalent, sage_femme, aide_soignant, infirmier_auxiliaire |
| industrial | soudure, cariste, conducteur_engins, mecanique_engins, tourneur_industriel, electromecanique |
| hse | hse_specialist |

Target ~27 per program (11 × 27 ≈ 297). HSE has one program → ~27 HSE examples.

## Data shapes (must conform exactly)

- Resume content: `ResumeData` from `src/schema/resume/data.ts` (`resumeDataSchema`,
  `defaultResumeData`). Sections: profiles, experience, education, projects, skills, languages,
  interests, awards, certifications, publications, volunteer, references, **internships** (IMTA).
  `basics` has IMTA fields: cin, militaryServiceStatus, dateOfBirth, nationality, maritalStatus.
  Reference sample: `src/schema/resume/sample.ts` (`sampleResumeData`).
- Gallery row: `resume_gallery` table — id, name, nameFr, field, subField, experienceYears,
  templateName, language, description, descriptionFr, resumeData(JSONB), tags(text[]), atsScore,
  isFeatured, viewCount, useCount, isActive, timestamps.
- Resume row: `resume` table — id, name, slug, tags(text[]), isPublic, isLocked, password,
  data(JSONB), userId, timestamps.
- Templates: `src/schema/templates.ts` (35). Public route: `/$username/$slug`
  (`src/routes/$username/$slug.index.tsx` → `resume.getBySlug`, requires `isPublic`).
- AI: `ai_provider_config` (columns: provider, api_key, model, base_url, is_default,
  is_enabled, max_tokens_per_request, temperature). Use the `is_default` row (DeepSeek).

## Architecture

### Generation pipeline — `scripts/generate-imta-resume-library.ts` (run via `tsx`)
Per (program, index):
1. Build a focused French prompt embedding: program name/curriculum, target experience tier
   (fresh grad / 1–3 yrs / 5+ yrs by index), a Moroccan city, sector employers, required
   certifications, and a request for STRICT JSON containing only *content* fields
   (fullName, headline, summaryHtml, experience[], education[], skills[], certifications[],
   internships[], languages[], interests[]).
2. Call DeepSeek (key/model/base_url from `ai_provider_config`), `response_format` JSON where
   supported; otherwise strip fences (reuse `stripMarkdownFences` logic).
3. **Merge** parsed content into a deep clone of `defaultResumeData`: set basics.name/headline,
   summary.content, and map content arrays into the corresponding section `items` (with generated
   ids, visible=true). Pick `metadata.template` rotating across a curated subset of the 35.
4. **Validate** with `resumeDataSchema.safeParse`. On failure → one repair retry with the Zod
   error fed back; else skip and log.
5. Compute `atsScore` heuristically (sections filled, summary length, skills count → 78–96).
6. Emit a record: { programId, field, experienceYears, language:'fr', templateName, name, nameFr,
   descriptionFr, tags, atsScore, isFeatured (index < 3), resumeData }.

Concurrency ~4; runs in background; writes results to a local JSON artifact first
(`resume-maker-sdlc/generated/library-<ts>.json`) so DB insert is decoupled from generation.

### Insert — `scripts/insert-imta-resume-library.cjs`
From the artifact, inside a transaction:
1. Ensure demo user `exemples@imta.ma` (username `exemples`, role user, emailVerified, strong pw).
2. For each record: insert a `resume_gallery` row AND a `resume` row (userId=demo,
   isPublic=true, slug = kebab(programId-name-nnnn), data=resumeData).
3. Optionally store the public slug in the gallery row tags for cross-linking.

### Cleanup — after new data is in
`DELETE FROM resume_gallery WHERE id NOT IN (<new ids>)` (i.e. remove the 1,111 legacy rows).
Backup `resume_gallery` to `resume-maker-sdlc/backups/gallery-pre-purge-<ts>.json` first.

### UI enhancement — gallery program filter
In `src/routes/dashboard/tools/resume-gallery.tsx` (+ `-components/`): add a program (`subField`)
filter dropdown; default the active filter to the logged-in user's `imtaProgram` when set. Reuse
`resumeGallery.list` (already supports field/search/template filters — extend with `subField`).
Add `subField` to the gallery `list` input + service query if not present.

## Safe rollout (staged)

- **Phase A — sample:** generate 10 (2 programs), inspect content quality + 100% schema-valid.
- **Phase B — full:** generate ~300 to the artifact.
- **Phase C — insert:** demo user + gallery + public resume rows (transaction).
- **Phase D — purge:** backup, then delete legacy gallery rows.
- **Phase E — verify:** browser-test the gallery (filter by program, open an example, "use as
  template"), open an `/exemples/{slug}` public URL; gates green; redeploy if UI changed.

## Out of scope / follow-ups
- Per-program cover-letter example library (note for later).
- Auto-translating example content to Arabic (French-first now).
- Linking each gallery card to its rendered `/exemples/{slug}` page (nice-to-have in Phase C).

## Risks & mitigations
- **AI cost/time:** ~300 calls, DeepSeek cheap; background + concurrency; the artifact decouples
  generation from insert (re-insert without re-paying for AI).
- **Schema drift:** validate every record against the real Zod schema; merge into defaults so
  required/metadata fields always present.
- **Empty gallery window:** insert-before-purge ordering; backups for both gallery and (existing) DB.
- **Duplicate/again runs:** insert keyed/idempotent on slug + gallery name; safe re-run.
