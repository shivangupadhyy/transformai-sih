# TransformAI — Phase 1 Scope Lock

## Product statement

TransformAI converts one trusted source into clear, audience-specific communication artefacts. The MVP is for communications officers, government/defence analysts, corporate PR teams, and general content creators who need accurate, consistent content quickly.

## The single demo workflow

1. An operator signs in and creates a project named **Phishing Defence Advisory**.
2. They paste the supplied fictional cyber-security incident brief (or upload its PDF equivalent).
3. They select Executive Summary, Advisory, LinkedIn Post, and Video Package.
4. They set the audience to `Government and critical-infrastructure stakeholders`, tone to `Clear and authoritative`, objective to `Inform and prompt action`, detail to `Standard`, and language to `English`.
5. TransformAI generates four saved, editable outputs. The operator opens the advisory, verifies its source-grounded key claims, and copies or downloads it.

Every MVP screen and endpoint must serve one of these six steps. A feature that does not is deferred.

## In scope

- Email/password authentication and per-user project history.
- Source intake: pasted text, PDF, DOCX, PNG/JPG, public article URL, and short MP4.
- Extraction into a canonical source record, with the original asset retained privately.
- Four structured outputs defined in `contracts/`.
- Audience, tone, objective, detail-level, and language controls.
- Saved results, inline editing, copy, Markdown download, regeneration, and friendly error states.
- A source-grounding panel that lists the claims the generator used.

## Explicitly out of scope

- Rendered AI videos, social-media publishing, payment, team collaboration, SSO, public share links, custom knowledge bases, and slide/PDF design export.
- Long or live video processing, OCR perfection, and extraction from paywalled/logged-in URLs.

## Product limits

| Input | Accepted types | Limit | MVP behaviour |
|---|---|---:|---|
| Pasted text | UTF-8 text | 50,000 characters | Reject longer input with guidance to upload a document. |
| Document | PDF, DOCX | 20 MB | Extract text; retain original securely. |
| Image | PNG, JPG, JPEG, WEBP | 10 MB | Analyse visual/textual information. |
| Article | Public `https://` URL | 2 MB fetched HTML / 15 s | Extract main article text; reject private/local URLs. |
| Video | MP4 | 50 MB / 5 minutes | Sample frames and transcribe audio; do not create an MP4 output. |

## Acceptance criteria

- A new authenticated user can complete the single demo workflow in under five minutes.
- The selected source and settings are visible before generation and are preserved with the project.
- One generation request produces valid instances of all four output schemas.
- Outputs contain no unsupported factual claims; each output exposes at least three source-grounded claims when applicable.
- The owner can reopen, edit, copy, download, and regenerate their outputs; a different user cannot access them.
- Upload, extraction, generation, unsupported format, and API failure states have clear recovery messages.

## Definition of done

The scope, sample source, JSON contracts, limits, UI copy, and environment-variable contract in this repository are approved as the build baseline. New work is accepted only if it supports the single demo workflow above.
