# Storm Shield: AI-Use Log

**Team Extokened · NASA Space Apps Challenge 2026**  
**Role Log: Software Architecture, Engine Rules, UI Development & Testing**

This log documents all AI tools, prompts, queries, rationale, human verifications, and manual adjustments made during the development of Storm Shield to ensure transparency, reproducibility, and academic integrity.

---

## Log Entries

### Entry 1 — 8 November 2026: Project Scaffolding & Architecture
- **Tool:** Google Antigravity (Gemini 3.8 Flash High)
- **Prompt / Purpose:** Read the official team roadmap, concept note, implementation idea, and Sobuj's work plan. Create a comprehensive implementation plan, configure Vite + React with Tailwind CSS, and set up the folder structure.
- **AI Output Provided:** Suggested decoupled engine architecture (`baseline.js`, `assess.js`, `storm.js`, `care.js`, `retrace.js`, `handoff.js`), content directory structure with cited JSON files, and automated unit test setup.
- **Human Review / Changes:** Verified against the NASA challenge brief ("Create Health Monitoring Software for Astronauts on Space Missions"). Enforced that all medical decision steps require a cited `source` and a `reviewedBy` sign-off, and that no `ILLUSTRATIVE` data appears in the demo path.

### Entry 2 — 8 November 2026: Deterministic Medical Engine & Provenance Tests
- **Tool:** Google Antigravity (Gemini 3.8 Flash High)
- **Prompt / Purpose:** Implement deterministic rule algorithms for personal baseline comparison, NOAA radiation storm mapping, and loss-minimising Retrace priority ladder.
- **AI Output Provided:** Vitest test suites and pure ES modules with no network dependencies.
- **Human Review / Changes:** Checked that dose thresholds follow CDC Acute Radiation Syndrome guidelines (1 Gy / 1000 mGy symptom threshold) and NOAA Space Weather Scales. Confirmed that all clinical rules are transparent decision trees rather than black-box AI-generated diagnostic claims.

### Entry 3 — 8 November 2026: Clinical Light Theme Redesign & NASA DONKI Gateway Integration
- **Tool:** Google Antigravity (Gemini 3.8 Flash High)
- **Prompt / Purpose:** Redesign the entire application to an uncluttered, high-contrast, premium Light Theme (Apple Health / Swiss clinical aerospace standard) for judge presentations, eliminating dark sci-fi visual clutter. Add live NASA DONKI API integration with resilient offline/simulated fallback.
- **AI Output Provided:** Tailored Tailwind UI palette (`bg-slate-50`, pure white card surfaces, Slate-900 typography, WCAG 2.1 AA compliant badges), refactored SVG Health Twin anatomical blueprint, clinical table formatting, and test timeout adjustments.
- **Human Review / Changes:** Verified that all 27 unit tests pass, zero unanchored data exists, and visual presentation is crisp, readable under bright presentation projectors, and free from distracting dark scanlines.

### Entry 4 — 12-13 November 2026: Version 4 Implementation, Guided Voice Assistant & Formal AI Declaration
- **Tool:** Google Antigravity (Gemini 3.8 Flash High & Gemini 2.5 Pro)
- **Prompt / Purpose:** Implement Version 4 capabilities as specified in `Storm-Shield-Concept-Note-v4.md` and `Storm-Shield-Implementation-Plan-v4.md`: CSA Bio-Monitor wearable feed simulation, transparent anomaly persistence engine ($N=3$ ticks), `BroadcastChannel` multi-tab crew alert bus with Web Audio siren synthesis, Patient Self-Support mode, Guided Voice Assistant (Web Speech API speech synthesis, voice command grammar, grounded Q&A over `assistant-library.json`), medical Approval Register (`approvals.json`), expansion of Vitest suite to 44 tests, and creation of `AI uses and declearation.md`.
- **AI Output Provided:** Implemented `alerts.js`, `anomaly.js`, `mockBioMonitor.js`, `adapter.js`, `commands.js`, `library.js`, `answer.js`, `speak.js`, `listen.js`, `SelfSupport.jsx`, `CrewAlertModal.jsx`, `AssistantPanel.jsx`, updated `SourcesScreen.jsx`, 17 new Vitest unit tests (44 total across 10 test suites), and the comprehensive `AI uses and declearation.md` document.
- **Human Review / Changes:** Red-teamed boundary queries to ensure the assistant never hallucinates medical diagnoses and strictly refuses unverified queries; verified dead-man switch check-in timer functionality; confirmed all 44 unit tests pass cleanly; validated that the application strictly complies with NASA Autonomy Ladder Level 2 ("Human acts; software visualizes, calculates, alerts, speaks, and records").

