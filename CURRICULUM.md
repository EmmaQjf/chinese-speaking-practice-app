# Curriculum map

This document is the agreed build plan for **Chinese Speaking Scenarios** (`chinese-speaking-web`). Update the **Done?** column as you complete work.

---

## Phase 1 — Auth walking skeleton

| Step | What | Done? |
|------|------|-------|
| 1.1 | `/login` — form only (no real auth) | Done |
| 1.2 | `/register` — name, email, password, role | Done |
| 1.3 | `POST /api/register` — validate (Zod), return JSON; form uses `fetch` | Done |
| 1.4 | MongoDB + User model + hash password + save user (+ duplicate email) | Done |
| 1.5 | NextAuth (or similar) — real login, session with `id` + `role` | Done |
| 1.6 | Middleware — protect `/dashboard` (and similar) | Done |
| 1.7 | `/dashboard` — show logged-in user (placeholder) | Done |

**One-line “where you are”:** Phase 1 complete in code — move to **Phase 2 (classes)**.

### Next step

**Phase 2 complete.** Start with **Phase 3.2** (level constants in `lib/scenarioLevels.ts`). Build in order; reuse `assertClassAccess`, `TOPICS`, and the `Scenario` model.

---

## Phase 2 — Classes (scope)

- **Teacher:** create class + join code  
- **Student:** join class with code  
- List “my classes” for teacher vs student  
- **Access rule:** only class members see that class’s data  

### Phase 2 — Step-by-step (learn as you build)

Work through these in order. Check **Done?** when it works end-to-end (including errors you handle on purpose).

| Substep | What you build | What you learn | Done? |
|--------|----------------|----------------|-------|
| **2.1** | **Design + `Class` model** — fields e.g. `name`, `joinCode` (unique string), `teacherId` (ObjectId ref to `User`), `timestamps`. Export model like `User` (`models.Class ?? model(...)`). | How to model a *resource* that belongs to a user; `Schema.Types.ObjectId` + `ref: "User"`; why `joinCode` is `unique: true`. | Done |
| **2.2** | **`ClassMembership` model** (recommended) — `classId`, `userId`, maybe `roleInClass` (`teacher` \| `student`), unique compound index on `(classId, userId)` so a user can’t join twice. *Alternative:* store `memberIds` array on `Class` (simpler at first, harder to query at scale). | Many-to-many: users ↔ classes; indexes for fast lookups and no duplicates. | Done |
| **2.3** | **Teacher creates class — API only** — `POST /api/classes` (or `app/api/classes/route.ts`). Parse JSON body (`name`). Use **`getServerSession(authOptions)`** to require login; if `session.user.role !== "teacher"`, return 403. Generate a **short random join code** (e.g. 6–8 chars, avoid ambiguous `0`/`O` if you like), ensure uniqueness (retry or loop). Create `Class` with `teacherId: session.user.id`. Optionally **auto-create** a `ClassMembership` row for the teacher so “my classes” queries stay uniform. | Route handlers in App Router; **auth on the server**; separating “who can call this” from “what we save”. | Done |
| **2.4** | **Teacher UI** — On `/dashboard`, if role is teacher, show a small form: class name → `fetch` `POST /api/classes` → show success + **join code** (copy button is a nice touch). Handle JSON errors (400/403) like on register. | Conditional UI by role; calling your own API from the client with cookies (session). | Done |
| **2.5** | **Student joins — API** — `POST /api/classes/join` with body `{ code }` (normalize: trim, uppercase). Find `Class` by `joinCode`. If missing → 404. If user already in `ClassMembership` for that class → 200 or 409 (your choice). Else insert membership for `session.user.id`. **Never** trust client for `classId` from code alone without verifying the code exists. | **Lookup by code**, not by id; idempotent joins. | Done |
| **2.6** | **Student UI** — On `/dashboard`, if role is student: input for join code + submit → `POST /api/classes/join` → toast or message “Joined!” | Same client pattern as 2.4; different API. | Done |
| **2.7** | **List “my classes”** — `GET /api/classes` (or `/api/me/classes`): **Teachers:** classes where `teacherId === session.user.id`. **Students:** classes where they have a `ClassMembership`. Return JSON array `{ id, name, joinCode?, role }`. | One endpoint, **branch on role**; Mongo queries with `$in` or populate. | Done |
| **2.8** | **Dashboard list** — After login, call `GET` and render a simple list (links to `/classes/[id]` placeholder page optional). Empty state: “No classes yet.” | Loading state + empty state UX. | Done |
| **2.9** | **Access rule (enforcement)** — For any future route that loads **class-specific** data (e.g. `GET /api/classes/[id]/...`): load class, then check **teacher owns it OR user has membership**. If not → **403**. Add a tiny helper e.g. `assertClassAccess(userId, role, classId)` to reuse everywhere. | **Defense in depth**: middleware protects `/dashboard`; **per-resource** checks protect data. | Done |

**Concepts map (Phase 1 → Phase 2):**

| You already used (Phase 1) | You’ll extend (Phase 2) |
|---------------------------|-------------------------|
| `User` + Mongoose schema | `Class` + `ClassMembership` schemas |
| `POST /api/register` + Zod | `POST /api/classes`, `POST /api/classes/join` + Zod |
| `bcrypt` / hashing | Random **join codes** (crypto/random), uniqueness |
| NextAuth session (`id`, `role`) | **Authorize actions** (teacher vs student) in route handlers |
| Register form + `fetch` | Teacher + student forms on dashboard |

**Suggested first commit-sized goal:** finish **2.1 → 2.4** (model + teacher create + UI). Then **2.5 → 2.6** (join), then **2.7 → 2.8** (lists), then **2.9** before Phase 3 APIs that take `classId`.

---

## Phase 3 — Topics + scenarios (your UI choice)

- Horizontal topic strip — select topic → list scenarios for that topic  
- Level stays on each scenario (teacher sets it); show as badge on cards  
- **Teacher:** create scenario (class, topic, level, English prompt)  
- **API:** list scenarios filtered by `classId` + topic  

**Already in the repo:** `src/lib/topics.ts` (`TOPICS`, `TopicId`, `isTopicId`); home page topic strip preview (not clickable). **Class page** (`/classes/[id]`) has `assertClassAccess` — scenarios live there next.

### Phase 3 — Step-by-step (learn as you build)

Work through these in order. Check **Done?** when it works end-to-end.

| Substep | What you build | What you learn | Done? |
|--------|----------------|----------------|-------|
| **3.1** | **`Scenario` model** — e.g. `classId` (ref `Class`), `topicId` (string matching `TopicId` from `topics.ts`), `level` (enum), `promptEnglish` (string), optional `createdBy` (ref `User`). `timestamps`. Index on `(classId, topicId)` for fast filtering. | Resource **belongs to a class**; store stable **topic id**, show **label** in UI. | Done |
| **3.2** | **Level constants** — e.g. `SCENARIO_LEVELS` in `lib/scenarioLevels.ts` (or enum on schema): `"1"` \| `"2"` \| `"3"` or `beginner` \| `intermediate` \| `advanced`. Export type + `isScenarioLevel()`. | Allowed values / enums; same idea as `User.role` and `TopicId`. | |
| **3.3** | **`POST /api/classes/[classId]/scenarios`** — Teacher only. `assertClassAccess` then require teacher (owner or `roleInClass === "teacher"`). Zod: `{ topicId, level, promptEnglish }`. Validate `topicId` with `isTopicId()`. `Scenario.create(...)`. Return `{ ok, scenario: { id, ... } }`. | Nested routes; reuse **access helper**; Zod + domain validation. | |
| **3.4** | **`GET /api/classes/[classId]/scenarios?topic=daily_life`** — Any **class member** (`assertClassAccess`). `Scenario.find({ classId, topicId })`. Return `{ ok, scenarios: [...] }`. **400** if `topic` missing/invalid. | **Query params**; filter by topic; members read, teachers write. | |
| **3.5** | **Teacher UI — create scenario** — On `/classes/[id]`, if teacher: form with topic (select from `TOPICS`), level (select), English prompt (textarea). `fetch` → `POST` from 3.3. Success/error like create-class form. | Form → API; teacher-only block on class page. | |
| **3.6** | **`TopicStrip` component** (client) — Horizontal pills from `TOPICS`. Click sets `selectedTopicId`; highlight active. Buttons (not static spans). Reuse home page styling. | Client state; controlled selection; reusable UI. | |
| **3.7** | **`ScenarioList` component** (client) — When `classId` + `selectedTopicId` set, `fetch` `GET .../scenarios?topic=...`. Loading / error / empty (“No scenarios for this topic yet.”). **Cards** with prompt snippet + **level badge**. | `useEffect` + fetch; list UI; badges. | |
| **3.8** | **Wire class page** — On `/classes/[id]` (after access check): `TopicStrip` + `ScenarioList` for teachers and students. Teachers also see create form (3.5). Default topic = first in `TOPICS`. | Compose components; one page, multiple roles. | |
| **3.9** | **Polish** — Optional link on each card to `/classes/[classId]/scenarios/[scenarioId]` placeholder (Phase 4). Truncate long prompts. Re-fetch list after teacher creates (event or `router.refresh()`). | UX polish; prep for Phase 4 detail + recording. | |

**Data model sketch (3.1):**

```text
Scenario
  classId       → Class
  topicId       → "daily_life" | "health" | ...  (from TOPICS, not free text)
  level         → e.g. "1" | "2" | "3"
  promptEnglish → "Describe your morning routine..."
  createdBy?    → User (optional)
```

**Flow on `/classes/[classId]`:**

```text
assertClassAccess
  ├── Teacher: CreateScenarioForm → POST .../scenarios
  ├── TopicStrip → selectedTopicId
  └── ScenarioList → GET .../scenarios?topic=...
```

**Concepts map (Phase 2 → Phase 3):**

| You already used (Phase 2) | You’ll extend (Phase 3) |
|---------------------------|-------------------------|
| `Class` model | `Scenario` belongs to **one class** |
| `assertClassAccess` | Every scenario route checks class access first |
| `POST /api/classes` + Zod | `POST .../scenarios` + Zod + `isTopicId` |
| `MyClassesList` + fetch | `ScenarioList` + fetch with **query param** |
| `TeacherCreateClassForm` | Teacher **create scenario** form |
| Home topic preview (static) | **Clickable** `TopicStrip` on class page |

**Suggested first commit-sized goals:** **3.1 → 3.4** (model + APIs, test with curl/DevTools). Then **3.5** (teacher create). Then **3.6 → 3.9** (topic strip + cards on class page).

**Out of scope for Phase 3 (later phases):** recording audio, saving **responses**, scenario detail with mic (Phase 4), comments (5), AI hints (6).

---

## Phase 4 — Student work + audio

- Scenario detail page: prompt, notes, record / stop / play  
- Upload audio (dev vs production storage)  
- Save response (scenario + user + audio URL + notes)  
- List classmates’ responses on same scenario  

---

## Phase 5 — Comments

- Text comments on a response  
- Optional: audio comments (same upload idea, later)  

---

## Phase 6 — AI hints

- `POST /api/ai/hints` (server only, API key)  
- Button on scenario page; safe fallback if no key  

---

## Phase 7 — Ship + school readiness

- Deploy (e.g. Vercel + Atlas), HTTPS for mic  
- Empty states, basic a11y  
- District / FERPA / student-data policy for real use  
