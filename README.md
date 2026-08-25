# AI English Companion

A local-first AI English conversation companion. It runs entirely on
your machine — a Next.js app backed by SQLite and a locally-running
[Ollama](https://ollama.com) model — so you can practice speaking and
writing English with an AI partner, track vocabulary and grammar over
time, and get spaced-repetition review, without any of your
conversation data leaving your computer.

## Prerequisites

- **Node.js 22.5+** (this project uses Node's built-in `node:sqlite`
  module, stable since Node 22.5; tested on Node v22.22.2). No native
  build toolchain is required — `npm install` never compiles anything.
- **[Ollama](https://ollama.com)** installed and running locally, with
  the model pulled that `.env.example`'s `OLLAMA_MODEL` expects. The
  default is `llama3.2`:
  ```bash
  ollama pull llama3.2
  ```
  If you want a different model, pull it and set `OLLAMA_MODEL` in
  your `.env` accordingly.

## Setup

Run these in order:

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). Every value
in `.env.example` has a safe local-development default — the only one
you need to touch is `OLLAMA_MODEL`, and only if you're not using
`llama3.2`.

## Features

- **Persona system** — 25 AI conversation partner personalities to talk
  with. A persona is not cosmetic: its tone, correction style,
  vocabulary level, humour, reply length, and difficulty calibration are
  all rendered into the assembled system prompt, so picking a different
  partner really does change how the conversation goes.
- **Conversation Modes** — Free Talk, Daily Practice, Role Play,
  Interview Practice, Business English, Grammar Practice, Vocabulary
  Builder, Pronunciation Practice, and Listening Practice.
- **Fun Mode** — game-style practice modes: Guess the Word, Twenty
  Questions, Story Adventure, Would You Rather, Quiz Battle, and
  Rapid Fire.
- **Scenarios** — 18 real-life situations to practise inside (airport,
  hotel, restaurant, clinic, taxi, shopping, bank, police station,
  office, meeting, university, border control, café, phone call, trip
  planning, job interview, customer service, urgent help). Each scene
  defines its setting, both roles, the student's objective, the beats a
  real version of the exchange contains, how it can plausibly end, the
  vocabulary it naturally uses, and what it teaches — all of which reach
  the model. A scenario is optional and off by default; picking one is
  stored on the conversation, so reloading a session resumes in the same
  scene. Scenes that put the model in a professional's chair (clinic,
  police, border, emergency, bank) carry an explicit roleplay boundary:
  it plays the role for language practice and never gives real medical,
  legal, financial, immigration, or emergency instructions.
- **Post-session analysis** — ending a session shows what was actually
  recorded from it: the summary, every correction, the vocabulary
  extracted, derived homework, and the recommended next activity. Short
  sessions that produced nothing say so rather than inventing progress.
  Past sessions keep their report too: History has a "What was saved?"
  button per finished session, rebuilt from data already on disk
  (`GET /api/conversation/:id/report`). Nothing is stored twice for
  this, and the one thing that cannot be rebuilt — the corrections,
  which are streamed live and not kept per session — is stated in the
  report instead of shown as an empty list.
- **Recommended next activity** — one concrete suggestion on the
  Dashboard and after each session, derived only from real state
  (whether anything is due for review, the weakest tracked grammar
  topic, and today's real minutes against your own configured goal).
- **Challenge Mode** — daily and weekly challenges with scored quizzes.
- **Vocabulary & Grammar tracking** — with spaced repetition scheduling.
- **Flashcards** — spaced-repetition review of due vocabulary.
- **Dashboard / Analytics** — progress over time, streaks, and stats.
- **Achievements** — unlockable achievements and XP/leveling.
- **Voice input/output** — speak to your conversation partner and hear
  it reply, via the browser's Web Speech APIs.
- **3D Avatar** — a rendered avatar for the conversation partner
  (React Three Fiber / three.js).
- **Export** — export your data.
- **Search** — full-text search across your conversation history.
- **Reset** — reset learning progress for a fresh start, with an
  automatic full-database backup taken first.

### Browser support note

Voice input/output uses the browser's Web Speech API, which is only
implemented in Chromium-based browsers. Use **Chrome** or **Edge** for
Voice features; other browsers will work for everything else.

## Prompt assembly

Everything the model is told is assembled in exactly one place —
`src/modules/ai/prompt-builder/build-system-prompt.ts` — from ordered
layers: base instructions, conversational stance, profile context,
settings context, persona, delivery instructions, conversation mode,
**scenario**, correction policy, learning context, memory injection,
relevant vocabulary, grammar focus, and this turn's pronunciation hint.
Later layers win when two conflict, which is why mode overrides persona
and a scenario overrides both. Empty layers are omitted entirely rather
than rendered as placeholders. No prompt text lives in controllers,
services, or the frontend.

## Architecture

The backend follows a layered, module-per-domain structure under
`src/modules/` (one module per business domain — `conversation`, `ai`,
`learning`, `progress`, `achievements`, `search`, `reset`, etc.), each
typically split into `controllers/ → services/ → repositories/`, with
`domain/`, `dto/`, and `validators/` alongside. Dependencies point
inward — Repositories don't know about Services, Services don't know
about Controllers — and everything is wired together in one
composition root: `src/shared/di/composition-root.ts`. The database
layer uses Drizzle ORM over Node's built-in `node:sqlite` (see
`src/db/client.ts` for the rationale). For the full reasoning behind
these choices, see the in-repo architecture docs referenced from
`AGENTS.md`/`CLAUDE.md`.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

**Note on `npm run build` in offline/restricted environments:** the
app uses `next/font/google` to self-host the Inter and JetBrains Mono
fonts (Design Tokens Architecture §2) — this requires a one-time
network fetch from `fonts.googleapis.com` _at build time only_
(nothing is fetched from Google at runtime; the fonts are bundled into
the build output). If your build environment has no network access to
Google Fonts, `npm run build` will fail on that fetch even though the
application code itself is correct — `typecheck`, `lint`, and `test`
are unaffected. This is a known, recurring point of friction in
sandboxed/offline CI environments specifically, not a defect in the
app.

## Database migrations

Migrations live in `src/db/migrations/` and are applied by
`npm run db:migrate` (which `npm run dev` runs for you via `predev`).
The most recent one, `0011_scenario_on_conversation.sql`, adds a
nullable `scenario_id` column to `conversation`. It is deliberately not
backfilled: conversations that happened before scenarios existed were
genuinely not set in one, and `NULL` is the honest value for them.

## Known limitations

- No real phoneme-level pronunciation scoring (pronunciation feedback
  is heuristic, not audio-analysis-based).
- Single-profile design — the app supports one learner profile at a
  time.
- Voice input/output is browser-dependent (Chrome/Edge only, per
  above).
