# Storm Shield: Implementation Plan (Version 4)

**Team Extokened · 8 November 2026**
Hackathon starts **Friday 13 November**. Two people. Everything below is sorted into what we build, what we simulate, and what stays as design.

> **Tags:** **[DOCTOR APPROVAL NEEDED: A#]**, **[TERMS CHECK: T#]**, **[MENTOR/ORGANIZER: M#]**, **[VERIFY]**. The full **Approval Register** is in the Concept Note v4 (Part 9).
> This file has **TAB 1 (committed plan)** and **TAB 2 (suggestions, not committed)**.

---

# TAB 1: THE PLAN

## 1. Can everything be done?

Everything can be **designed and documented**. Not everything can be **built by 13 November** with two people. The split:

| Item | By 13 Nov | How |
|---|---|---|
| Storm Alert with replay | **Build** | Saved DONKI/NOAA data |
| Health Twin (personalised) | **Build** | SVG body + JSON content |
| Care Mode (Scenarios A and B) | **Build** | Decision-tree runner |
| Retrace | **Build** | Rule-based |
| Crew Alert, Self-Support, check-in timer | **Build** (basic) | Simulated crew in one app; optional two-tab sync |
| Device Feed (Bio-Monitor-style) | **Simulate** | Mock adapter with a scripted anomaly, labelled |
| Voice output and spoken commands | **Build** (basic) | Browser speech APIs with button fallback |
| Assistant: grounded Q&A | **Build** (simple) | Retrieval over the reviewed library, no language model |
| Assistant: language-model mode | **Design only** | Future; needs approvals and a server |
| Handoff notes | **Build** | Template from the log |
| Real Bio-Monitor integration | **Design only** | Needs data format and permission **[TERMS CHECK: T2] [VERIFY]** |
| AI-performed treatment | **Not built** | Future research; autonomy level 5-6 |

**Core principle in code and UI:** the human acts. No function sends a command to a device or a person's body. The software only shows, speaks, records, and alerts.

## 2. Architecture

- **Frontend-only web app** (HTML/CSS/JS or React + Vite), bundled JSON, static hosting, works offline.
- **Engine separate from UI**, every rule unit-tested.
- **Content in JSON** written by Yarin and reviewed; Sobuj loads it.
- **Event bus** (in-memory) for alerts, with an optional `BroadcastChannel` so a second browser tab acts as another crew member (a strong demo, offline).

```
src/
├── engine/    baseline  assess  storm  care  retrace  handoff  alerts  anomaly
├── device/    adapter.js  mockBioMonitor.js
├── assistant/ commands.js  library.js  answer.js  speak.js  listen.js
├── content/   crew  regions  indicators  kit  scenarios/  assistant-library.json  sources.json  approvals.json
├── ui/        overview twin vitals storm care retrace assist selfsupport handoff sources
└── tests/
```

## 3. Device Feed (wearable integration)

**Adapter interface (the same for a mock and a future real device):**
```js
// returns one sample per tick
{ t, hr, ecg?, sbpEstimate, rr, spo2, skinTemp, activity, quality, provenance }
```
- `mockBioMonitor.js` generates samples **anchored** to each crew member's baseline, with a **scripted anomaly** the demo can trigger (for example heart rate climbing and blood oxygen dropping). Every sample is tagged `ANCHORED`/`SIMULATED` and shown with a badge.
- A future `realAdapter.js` would read the real device's output. **[TERMS CHECK: T2] [VERIFY]** data format, access, and permission.
- **Accuracy labels in the UI:** blood pressure from a wearable is an **estimate**, and skin temperature is **not** core temperature.

**Anomaly rules (transparent, not AI):**
- Compare each signal with the person's baseline and with general ranges.
- **Persistence rule:** raise an alert only after N consecutive samples outside range (fewer false alarms). **[DOCTOR APPROVAL NEEDED: A3, A7]**
- Alert levels reuse Normal / Watch / Act. An **Act** alert triggers the crew alert and opens Care Mode with the readings pre-filled.
- The crew sees the live values on screen (as the real device's tablet app does for its sessions) and the **next steps**.

## 4. Crew Alert, Self-Support, check-in timer

**Alert object:**
```json
{ "id": "...", "from": "Astronaut B", "kind": "medical", "reason": "SpO2 low, HR high",
  "time": "...", "location": "optional", "acks": [] }
```
- **Alert Crew button** (always visible): creates an alert, shows a banner on every other crew tab, and plays a sound.
- Other crew can press **On my way** (adds an ack and a timestamp). The patient sees who is coming.
- **Self-Support screen** for the patient: large text, one step at a time, read aloud. The first step is always "help has been alerted." **[DOCTOR APPROVAL NEEDED: A6]**
- **Check-in timer (dead-man switch):** the patient must tap "I'm OK" (or say "OK") every N minutes during an emergency. If not, the app escalates: alerts everyone with a louder signal. Timer length is a clinical setting. **[DOCTOR APPROVAL NEEDED: A7]**
- Demo speed option so judges can watch the escalate-on-silence behaviour in seconds.

## 5. Guided Assistant (voice and chat)

**What it is:** a side panel, always available, with three layers. Build 1 and 2 now; 3 is future.

| Layer | What | Build? |
|---|---|---|
| 1. **Voice output** | Reads the current step aloud, repeats on request | Yes |
| 2. **Voice and button commands** | next, back, repeat, done, start timer, alert crew, "log [text]", and spoken numbers for vitals ("heart rate one-twenty") | Yes |
| 3. **Grounded Q&A** | Answers questions only from `assistant-library.json` (each answer card has text, source id, approval id) using simple keyword/similarity matching | Yes (simple) |
| 4. **Language-model assist** | Reword text simply, summarise the log into handoff notes | Design only |

**Safety rules for the assistant:**
1. Answer only from the library. If no good match: *"I don't have a reviewed answer for that. Use Retrace or contact a doctor."*
2. Every answer shows its **source** and **approval status**. Pending cards are labelled "pending medical review." **[DOCTOR APPROVAL NEEDED: A5]**
3. **Emergency phrases** ("not breathing," "unresponsive," "bleeding heavily") skip chat and open the red-flag screen and crew alert immediately. **[DOCTOR APPROVAL NEEDED: A6]**
4. It never claims a diagnosis; it says "possible" and lists unknowns.
5. Everything said and answered is logged to the handoff.
6. **Voice reliability:** speech recognition is unreliable in noise, and some browsers send audio to an online service, which would not work offline. Always provide buttons. **[VERIFY]**
7. **If a language model is added later,** use a fixed system prompt that restricts it to the library, require citations, log every prompt, and disclose it in "Use of AI." Do not call an LLM API from public client code with a secret key. **[DOCTOR APPROVAL NEEDED: A5]**

**Library card format:**
```json
{ "id": "q-aspirin", "keywords": ["aspirin","chest pain medicine"],
  "answer": "...", "source": "medlineplus", "approval": { "id": "A1", "status": "pending", "by": null } }
```

## 6. Content and approval gates

Every scenario step, rule, threshold, assistant answer, and spoken phrase carries:
```json
"source": "cdc-ars", "approval": { "id": "A2", "status": "pending", "by": null, "date": null }
```
- **Build check 1:** fail the "approved demo" build if any item has `status: "pending"` **and** is not shown with a pending label.
- **Build check 2:** no number without a `source` and a provenance tag.
- **Build check 3:** every source has a license row. **[TERMS CHECK: T1]**
- The UI shows a visible **"pending medical review"** badge on every pending item. After a doctor approves, Yarin sets `status: "approved"` with their name and date, **only with their written or messaged confirmation**.

## 7. Data pipeline (real data first)
1. Download DONKI and NOAA files for the replay window (US VPN if needed). Log file, URL, dates, time, terms. **[TERMS CHECK: T1]**
2. Pull ISS dose-rate extracts from NASA RadLab or use published tables, after reading terms of use. **[TERMS CHECK: T1]**
3. A small script converts raw files to the clean JSON the app loads.
4. Generate **anchored** crew baselines and device samples inside cited ranges.
5. **No live fetching at the event.** Bundle everything.

## 8. Testing
- Unit test for every rule (given these readings, expect this status).
- **Anomaly tests:** a spike does not alert; a sustained deviation does.
- **Alert tests:** alert reaches all other crew; acks recorded; check-in timer escalates.
- **Assistant tests:** a red-team list of unsafe or tricky questions with the expected refusals (see Tab 2, S3).
- **Voice tests:** commands work, and buttons always work.
- Manual run of the full demo path on the deployed link, on a phone-size screen, on mobile data. Keep a backup screen recording.

## 9. Build order (so something always works)
1. Shell, crew tabs, deploy empty page.
2. Twin + vitals + assessment engine.
3. Storm replay + alert + body check.
4. Care Mode (A, then B).
5. Crew Alert + Self-Support + check-in timer.
6. Mock device feed + anomaly rules → triggers alert and Care Mode.
7. Handoff notes.
8. Retrace.
9. Assistant: voice output → commands → grounded Q&A.
10. Provenance/approval badges and Data & Sources screen; build checks.

**Cut order if time runs short (from the bottom):** grounded Q&A → voice commands → Retrace match feature → device feed polish. **Never cut:** Storm Alert, Twin, Scenario A, Crew Alert, approval badges, disclaimers, live link.

## 10. Roles (updated)

**Sobuj (build)**
- Steps 1-10 of the build order, the event bus, device mock, anomaly rules, assistant code, tests, deployment, AI-use log for code.

**Yarin (content, validation, presentation)**
- `indicators.json` (including SpO₂ and breathing rate), `crew.json`, `regions.json`, `kit.json`, both scenarios, Retrace content, Self-Support steps, the **assistant library** (cards with sources), emergency phrases, `sources.json` with licenses, `approvals.json`.
- **Book the medical reviewer** for A1-A7 on Wednesday, and track every approval.
- Check CSA terms for Bio-Monitor information **[TERMS CHECK: T2]**.
- README, NASA project page, videos, pitch deck, presenting.

**Schedule adjustments (add to the earlier plans)**
- **Mon 9:** Sobuj builds the event bus and alert UI skeleton; Yarin writes the assistant library outline and Self-Support steps.
- **Tue 10:** Sobuj builds the mock device feed and anomaly rules; Yarin completes library cards and checks CSA terms.
- **Wed 11:** doctor review of A1-A7; Sobuj builds voice output, commands, and grounded Q&A; both run the full demo.
- **Thu 12:** freeze at noon; red-team the assistant; tabletop test if possible.

## 11. Demo path (about 2 minutes)
1. Overview: three crew, live (mock) device feed on one astronaut.
2. Scripted anomaly: readings drift → **Watch → Act** → crew alert appears on the other tab → "On my way."
3. Patient's **Self-Support** screen reads the first step aloud.
4. Helper says "next… done… start timer" (or taps).
5. Assistant answers one reviewed question with its source.
6. Storm replay → Body Check → Scenario B.
7. **Retrace** with an unplanned event.
8. Handoff notes; flip the ground link to Available.
9. Data & Sources: provenance and approval badges.

## 12. Risks
| Risk | Plan |
|---|---|
| No doctor available in time | Ask the mentor today; if none, show "pending medical review" everywhere and say so on camera |
| Too much for two people | Fixed split in section 1, cut order in section 9 |
| Assistant says something unsafe | Library-only answers, refusals, red-team test, pending labels |
| Voice fails in a noisy room | Buttons always work |
| Device format unknown | Mock adapter now; real integration is future work |
| Over-claiming | Use the wording rules: assessment, guidance, decision support, prototype; human acts |
| Licensing | Paraphrase, credit, record terms |

---

# TAB 2: SUGGESTIONS (NOT COMMITTED)

| # | Suggestion | Technical note | Effort | Approval |
|---|---|---|---|---|
| T-1 | **Helper vs patient views** | Two UI modes sharing one state; helper view is voice-first with large controls | Medium | A6 |
| T-2 | **Two-tab live sync** with `BroadcastChannel` | Shows multi-crew alerting offline with no server | Low | None |
| T-3 | **Statistical anomaly detection** | Rolling baseline, deviation over consecutive samples, simple trend test; document it as statistics, not AI | Low | A7 |
| T-4 | **Tabletop test harness** | Scripted scenarios with timers and a scorecard; save results to the project page | Low | A1, A2 |
| T-5 | **Assistant red-team suite** | A JSON list of prompts and expected behaviours, run as an automated test | Low | A5 |
| T-6 | **Structured handoff export** | JSON plus printable page; consider a standard health-data format later | Medium | T1 |
| T-7 | **Kit inventory tracking** | Used items reduce stock; steps adapt to what remains | Medium | A1 |
| T-8 | **Mission-phase profiles** | Config files for transit, lunar base, Mars surface | Medium | A3 |
| T-9 | **Accessibility pack** | High contrast, large text, audio and visual alarms, screen-reader labels | Low | None |
| T-10 | **Offline language-model layer (future)** | A small on-device model for rewording and note summarising, restricted to the library, with the original log always shown beside any summary | High | A5 |
| T-11 | **Real device adapter (future)** | Implement `realAdapter.js` once the data format and permission are known | High | T2 |
| T-12 | **Provenance dashboard** | A page that counts values by tag (REAL/PUBLISHED/ANCHORED/ILLUSTRATIVE) to show you reduced simulated data | Low | None |
| T-13 | **Bangla toggle** | Strings file; voice may need Bangla voices **[VERIFY]** | Medium | A5, A6 |
| T-14 | **Privacy mode** | Local-only storage; explicit consent prompt before any "send to ground" | Low | None |

**My top picks for the hackathon:** T-2, T-3, T-4, T-5, and T-12. They are cheap, they demonstrate Validity and honesty, and they make the demo more convincing.
