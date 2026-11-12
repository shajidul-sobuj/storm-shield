# Storm Shield: Concept Note (Version 4)

**Team Extokened (Yarin + Sobuj) · NASA Space Apps Challenge 2026 · Bangladesh · 8 November 2026**
Challenge: **Create Health Monitoring Software for Astronauts on Space Missions**

> **How to read the tags.**
> **[DOCTOR APPROVAL NEEDED: A#]** = a medical professional must approve this before it is shown as guidance.
> **[TERMS CHECK: T#]** = check copyright or terms of use first.
> **[MENTOR/ORGANIZER: M#]** = confirm with the mentor or Local Lead.
> All tags are collected in the **Approval Register** in Part 9. **[VERIFY]** = could not confirm.
> This file has two tabs: **TAB 1 (the plan we commit to)** and **TAB 2 (suggestions, not committed)**.

---

# TAB 1: THE PLAN

## 1. The problem
On long Moon and Mars missions, astronauts face NASA's five spaceflight hazards: radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments. These contribute to immune changes, bone loss, cardiovascular events, poor nutrition, and behavioural health problems. The challenge asks for a tool that helps astronauts assess their own health. With communication delays and no guarantee that a doctor is aboard, the crew may have to act first.

NASA is working on this too. Its Earth-Independent Medical Operations concept covers tools that assist the Crew Medical Officer when ground support is unavailable or delayed, and NASA and Google have tested a crew medical assistant prototype. Storm Shield is a student prototype in the same direction.

## 2. The idea
*Storm Shield watches the Sun and the crew. It warns of solar storms, notices when a crew member's readings leave normal, alerts the rest of the crew, and guides the person and their helper through the next safe step. It keeps the notes for the doctor.*

## 3. The core principle: a human does everything
**At this stage, Storm Shield recommends, explains, and records. A human performs every action, and the software never acts on a patient.** Say this on camera and on the project page.

**Autonomy ladder (where we are, and what is future work):**
| Level | What the system does | Status |
|---|---|---|
| 0 | Shows information | Done |
| 1 | Gives advice | Done |
| **2** | **Guides step by step and records; the human acts** | **Our prototype** |
| 3 | Reads a wearable's data and flags anomalies | Designed; mock feed in the demo |
| 4 | Coordinates the crew response (alerts, roles, check-ins) | Built in basic form |
| 5 | AI-assisted procedures with devices, under human supervision | Future development |
| 6 | Autonomous treatment by AI | Long-term research; needs clinical validation and regulation. Not claimed |

## 4. The parts

1. **Storm Alert (our focus).** Real space-weather data converted into three crew levels (Watch, Warning, Shelter now) from NOAA's radiation storm scale, with onset, intensity, duration, and "Why this alert?". After a storm, it prompts a body check.
2. **Health Twin.** A clickable body figure per astronaut, judged against **that person's own baseline** first, then general ranges. Each region shows function, baseline vs now, hazard effects, status, and guidance.
3. **Device Feed (wearable integration).** A Bio-Monitor-style adapter brings in pulse, heart rhythm, blood pressure estimate, breathing rate, skin temperature, blood oxygen, and activity.
   - **What the real device does (CSA):** it measures those signals, includes a tablet application, and relays data to scientists on the ground. During sessions the astronaut can see their own vital signs on the tablet.
   - **What we add:** when the readings leave normal, the app alerts the crew and shows the next steps. We did not find documentation that the device itself gives on-board next-step guidance, so we describe this as our addition, and we do **not** claim the device has no alerts. **[VERIFY]**
   - **At this stage:** the feed is **simulated** (a mock adapter with a scripted anomaly), clearly labelled. Real integration needs the device's data format and permission. **[TERMS CHECK: T2] [VERIFY]**
4. **Care Mode.** Guided emergency steps for two scenarios (A: cardiovascular scare, B: illness after a solar storm): first response, triage, vitals, assessment with stated unknowns, steps from published sources, recheck timers, and a handoff log. **[DOCTOR APPROVAL NEEDED: A1, A2]**
5. **Retrace.** A fill-in form for anything outside the planned scenarios or for actions already taken. It rebuilds the timeline, checks for red flags, and suggests the lowest-loss next steps. Always labelled **low confidence**. **[DOCTOR APPROVAL NEEDED: A4]**
6. **Crew Alert and Self-Support.**
   - **Alert Crew:** one press sends an alert to every other crew member (with who, where, and what), who can reply "on my way."
   - **Self-Support mode:** a minimal, large-text screen for the patient with the safest actions to take until help arrives.
   - **Check-in timer:** if the patient stops responding to prompts, the app alerts the crew automatically.
   - The first step is always to get help; self-support is a bridge, because some emergencies leave the patient unable to act.
   **[DOCTOR APPROVAL NEEDED: A3, A6]**
7. **Guided Assistant (voice and chat).** A side assistant that reads steps aloud, takes spoken commands from the helper (next, repeat, done, start timer, alert crew), and answers questions **only from the reviewed content library**, with a source on each answer.
   - It does not diagnose freely, invent steps, or answer outside the library. When it can't help, it says so and points to Retrace.
   - Voice output uses the browser's speech synthesis; voice input uses speech recognition where available, with buttons as a fallback. **[VERIFY offline behaviour]**
   - Any use of a language model (for example to reword text or summarise notes) is optional, experimental, and disclosed. **[DOCTOR APPROVAL NEEDED: A5]**
8. **Handoff notes.** A structured, time-stamped summary a doctor can read in 30 seconds: who, what, when, vitals over time, actions, supplies used, and current state.

## 5. Indicators
The six from the challenge statement, plus two that a wearable provides:

| Indicator | Input | Notes |
|---|---|---|
| Blood pressure | Device estimate or manual cuff | The wearable gives an estimate, not a cuff reading; label it |
| Heart rate (and rhythm) | Device or manual | |
| Blood sugar (mg/dL) | Manual | The wearable does not measure it |
| Body temperature | Device (skin) or manual | Skin temperature is not core temperature; label it |
| Sleep hours | Manual or activity data | |
| Mood | Self-rating | |
| Blood oxygen (added) | Device | |
| Breathing rate (added) | Device | |

All thresholds are prototype defaults and are shown with a source. **[DOCTOR APPROVAL NEEDED: A3]**

## 6. How it answers the updated challenge
A visual tool for self-assessment (twin, charts, colour) · guidance on treatments and health improvements (Care Mode, Retrace, assistant) · any kind of input (typed, clicked, device feed, voice) · when to involve others (alerts, ground-link modes, handoff) · explanations for non-experts ("Why this?") · prompts (check-in timers) · dynamic charts and colour coding · different environments (selector).

## 7. Data and honesty
Every number is labelled **REAL** (measured public data), **PUBLISHED** (value from a cited source), **ANCHORED** (synthetic inside cited ranges), or **ILLUSTRATIVE** (placeholder; we aim for none).
- **Real:** storm events and proton flux (NASA CCMC DONKI, NOAA SWPC); radiation measurements (NASA RadLab); shelter measurements from the Artemis I Orion mission.
- **Published:** radiation-illness facts (CDC); first-aid steps (NIH MedlinePlus); cardiovascular effects (NASA HRP).
- **Anchored:** fictional crew baselines and the simulated device feed.
Sources are paraphrased and credited, with licenses recorded. **[TERMS CHECK: T1]**

## 8. Safety design
1. Human executes; software recommends and records.
2. Always show one safe next action; get help first.
3. Buy time: stabilise and monitor before anything invasive.
4. Prefer low-risk, reversible steps; show "what not to do."
5. Show uncertainty and unknowns; label Retrace low confidence.
6. A source on every step; a doctor's approval on every demo scenario.
7. Reduce false alarms (alerts need persistent readings, not a single spike). **[DOCTOR APPROVAL NEEDED: A7]**
8. The assistant answers only from the reviewed library.
9. Clear labels: *student prototype, not clinically validated, not a medical device.*

## 9. Approval Register
| ID | What needs approval | Who | When | Status |
|---|---|---|---|---|
| A1 | Scenario A steps, order, and the aspirin decision | Doctor | Wed 11 Nov | Pending |
| A2 | Scenario B rules (dose check, vomiting-time rule), steps | Doctor | Wed 11 Nov | Pending |
| A3 | Reference ranges and thresholds for all indicators, including SpO₂ and breathing rate | Doctor | Wed 11 Nov | Pending |
| A4 | Retrace red-flag list and loss-ladder wording | Doctor | Wed 11 Nov | Pending |
| A5 | Every answer card in the assistant library, plus its refusal and boundary behaviour | Doctor | Wed 11 Nov | Pending |
| A6 | Spoken emergency phrases and Self-Support steps | Doctor | Wed 11 Nov | Pending |
| A7 | Device-alert rules (persistence, escalation, check-in timer length) | Doctor | Wed 11 Nov | Pending |
| A8 | Any mental-health check-in wording (if added) | Doctor or psychologist | Before use | Not started |
| T1 | Licenses and terms for every source and dataset | Yarin | Wed 11 Nov | In progress |
| T2 | Use of CSA Bio-Monitor information, images, and any data format | Yarin | Tue 10 Nov | Pending |
| M1 | Written permission to work before the event | Local Lead | Today | Requested |
| M2 | Scope and demo review | Mentor (Nishat Mushfiqua) | Mon 9 and Wed 11 Nov | Pending |

**Rule:** anything with a pending doctor approval is labelled "pending medical review" in the app and must not be presented as approved guidance.

## 10. What makes it different
NASA researches onboard medical decision support, and other student teams build baseline dashboards. Our combination: the **storm-to-body chain**, a **personalised body twin**, a **wearable feed that alerts the crew and says what to do**, **crew alerting with self-support**, **supply-aware, source-backed care**, **Retrace** for the unexpected, a **voice-enabled assistant limited to reviewed content**, and radical transparency about data and sources.

## 11. Benefits
- **Crews:** never left without a next action; the rest of the crew is alerted quickly; a clean record for the doctor.
- **Ground teams:** structured handoffs.
- **Earth:** the CSA itself lists remote-community telemedicine and workers in strenuous environments as uses of this kind of monitoring, so the approach could serve places with few doctors.

## 12. Honest limits
A student prototype with fictional crew data and a simulated device feed. It is not clinically validated and does not replace a doctor. The AI assistant is limited and optional. Autonomous treatment is future research.

## 13. Key sources
NASA EIMO Concept of Operations (NTRS 20250000009) · NASA paper on spaceflight clinical decision support (NTRS 20220007443) · CSA Bio-Monitor pages (csa-asc.gc.ca) · NASA HRP cardiovascular risk page · CDC acute radiation syndrome fact sheet for clinicians · NIH MedlinePlus heart attack first aid · NOAA Space Weather Scales · NASA CCMC DONKI · NASA OSDR RadLab · Artemis I Orion radiation measurements (Nature, 2024). Full links are in the Resource Guide.

---

# TAB 2: SUGGESTIONS (NOT COMMITTED)

Each suggestion lists value, effort, and risk. Choose after the core is done.

| # | Suggestion | Why it could help | Effort | Approval needed |
|---|---|---|---|---|
| S1 | **Helper view** separate from the **patient view** (big buttons, voice-first) | Hands are busy in an emergency; the patient may be unable to use the screen | Medium | A6 |
| S2 | **Tabletop test**: run both scenarios with a classmate (and a doctor if possible), measure time to first correct action, and report the results | Gives real validity evidence for the judges | Low | A1, A2 |
| S3 | **Red-team the assistant**: a list of 30 unsafe or tricky questions, with the expected refusals | Shows you tested safety | Low | A5 |
| S4 | **Drill mode with a readiness score** | Training is part of NASA's autonomy concept; doubles as gamification | Medium | A1, A2 |
| S5 | **Role assignment:** the alert suggests who responds first (nearest, the medical officer) | Faster, organised response | Low-Medium | A7 |
| S6 | **Statistical anomaly detection** (baseline deviation over several consecutive readings) | Fewer false alarms without calling it AI | Low | A7 |
| S7 | **Structured handoff export** (for example a standard health-data format) | Helps a real doctor use the notes | Medium | T1 |
| S8 | **Medical-kit tracking**: used items reduce stock, and low stock changes the suggestions | Supports "with whatever is available" | Medium | A1 |
| S9 | **Mission-phase profiles** (transit, lunar base, Mars surface) | Hazards and shelters differ | Medium | A3 |
| S10 | **Bangla language toggle** | Useful for training and local audiences (the judging videos need English) | Medium | A5, A6 |
| S11 | **Offline small language model** for note-taking and rewording | A real on-board AI direction | High | A5; disclose fully |
| S12 | **Wellbeing check-ins** for isolation, with a validated short scale | Behavioural health is a named hazard | Low | A8 |
| S13 | **Privacy design**: data stays on device, the crew consents before anything goes to the ground | Trust, and likely judge questions | Low | None |
| S14 | **Earth spin-off page**: remote clinics and disaster response | Strengthens the Impact story | Low | None |
| S15 | **Post-event review**: what worked, what didn't, from the log | Learning loop | Low | None |

**My top three for the hackathon:** S2 (tabletop test), S3 (red-team the assistant), and S6 (statistical anomaly detection). They are cheap and raise Validity.
