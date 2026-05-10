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

**Phase 2 — first slice:** **Teacher creates a class** — store it in MongoDB (e.g. name, `teacherId` from session, unique **join code**), expose `POST /api/classes` (or similar), then a simple teacher UI (e.g. from `/dashboard`) to create a class and show its join code. After that: **student joins with code**, **my classes** lists, then **member-only access** for class data.

---

## Phase 2 — Classes (scope)

- **Teacher:** create class + join code  
- **Student:** join class with code  
- List “my classes” for teacher vs student  
- **Access rule:** only class members see that class’s data  

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
