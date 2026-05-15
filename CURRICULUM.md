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

Start with **Phase 2.8** (dashboard class list — `GET /api/classes`). Build in order; each step reuses patterns from Phase 1 (Mongoose model, Zod, `fetch`, session).

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
| **2.8** | **Dashboard list** — After login, call `GET` and render a simple list (links to `/classes/[id]` placeholder page optional). Empty state: “No classes yet.” | Loading state + empty state UX. | |
| **2.9** | **Access rule (enforcement)** — For any future route that loads **class-specific** data (e.g. `GET /api/classes/[id]/...`): load class, then check **teacher owns it OR user has membership**. If not → **403**. Add a tiny helper e.g. `assertClassAccess(userId, role, classId)` to reuse everywhere. | **Defense in depth**: middleware protects `/dashboard`; **per-resource** checks protect data. | |

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
