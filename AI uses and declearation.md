# Storm Shield: AI Uses & Declaration

**Project Name:** Storm Shield 🛡️  
**Challenge:** Create Health Monitoring Software for Astronauts on Space Missions  
**Competition:** NASA Space Apps Challenge 2026 (Dhaka, Bangladesh)  
**Team:** Extokened (Sajidul Islam Sobuj & Yarin)  
**Date:** November 2026  
**Document Status:** Official AI Transparency & Compliance Disclosure  

---

## 1. Executive Declaration

Team Extokened hereby submits this comprehensive **AI Uses and Declaration Document** for the **Storm Shield** project in accordance with the NASA Space Apps Challenge rules, academic integrity guidelines, and global standards for ethical artificial intelligence in healthcare and aerospace engineering.

### Core Declaration Principles
1. **Radical Transparency:** We believe in full, unreserved disclosure of all artificial intelligence tools, models, workflows, and prompts utilized during the design, architecture, engineering, and testing of Storm Shield.
2. **Clinical Safety & Zero-Hallucination Mandate:** In deep-space operations where lives depend on deterministic accuracy, **generative AI is strictly isolated from clinical diagnosis and medical decision execution**. Every medical recommendation, medication dose, and contraindication check is 100% deterministic, rule-based, and grounded in published clinical protocols (CDC, NIH, NASA HRP).
3. **Autonomy Ladder Adherence (Level 2):** Storm Shield strictly adheres to **Level 2 ("Decision Support & Guidance; the Human Acts")** on NASA's Clinical Autonomy Ladder. The software visualizes telemetry, detects baseline deviations, alerts crew, speaks, and records handoffs. **A human performs every physical medical action.** The software never autonomously administers treatments or controls life-support actuation.
4. **100% Human Verification & Accountability:** Every line of code, architectural pattern, and test assertion synthesized with AI assistance was rigorously inspected, executed in local runtime environments, unit-tested via Vitest, and validated by the team engineers.

---

## 2. AI Technology Stack & Model Attribution

| Attribute | Specification |
|---|---|
| **Primary AI Assistant** | Google DeepMind Antigravity System |
| **Foundation Models** | Google Gemini Models (including Gemini 2.5 Pro / Flash & Gemini 3.8 Flash High) |
| **Interface / Environment** | Antigravity Agentic IDE & Autonomous Coding Agent Environment |
| **Development Period** | November 2026 |
| **Operating System & Tooling** | Linux x86_64, Node.js v24, Vite, Vitest, Tailwind CSS, Playwright |
| **Human In The Loop** | Sajidul Islam Sobuj (Architecture, Coding, Testing, UI) & Yarin (Clinical Literature, Scenario Formulation, Content Curation) |

---

## 3. Comprehensive Breakdown: Where AI Was Used

AI was used as an **agentic pair programmer, system architect, refactoring assistant, test engineer, and technical documentation co-author**. Below is the detailed breakdown across each functional layer of the project:

### 3.1. System Architecture & Project Scaffolding
- **What AI Assisted With:**
  - Designed the decoupled, zero-backend, client-side offline architecture separating pure algorithmic logic (`src/engine/`), wearable interface (`src/device/`), guided voice assistant (`src/assistant/`), static content repositories (`src/content/`), and React presentation components (`src/ui/`).
  - Generated the initial file structure, Vite bundler configuration, and Tailwind CSS configuration.
- **Human Verification:**
  - Enforced a 100% offline-first static requirement (no cloud database, no external auth, zero runtime telemetry leakage).
  - Ensured compatibility with static hosting (GitHub Pages, Vercel) and strict browser offline execution.

### 3.2. Pure Algorithmic Engine & Module Implementation
- **What AI Assisted With:**
  - Implemented pure JavaScript (ES modules) translation of spaceflight formulas and clinical criteria:
    - `baseline.js`: Algorithmic delta calculation comparing personal crew baselines against real-time vitals.
    - `assess.js`: Multi-factor composite health condition assessment (`NOMINAL`, `WATCH`, `ACT`).
    - `storm.js`: Real-time and historical energetic proton flux categorization against the NOAA Space Weather Radiation Storm Scale (S0–S5) and Artemis I Orion shielding attenuation factors ($\sim 4.0\times$ dose reduction).
    - `care.js`: Supply-aware clinical decision tree navigator with automated patient allergy profile contraindication checking (e.g. blocking Aspirin for allergic crew members).
    - `retrace.js`: Automated ABCDE (Airway, Breathing, Circulation, Disability, Exposure) red-flag scanner and 6-tier loss-minimizing priority ladder for unscripted emergencies.
    - `handoff.js`: EIMO-compliant 30-second flight surgeon briefing compiler synthesizing vitals, doses, kit usage, and timestamps.
    - `alerts.js`: Multi-tab crew notification bus using the browser `BroadcastChannel` API and Web Audio API procedural sound synthesizer (synthesizing acoustic alarm sirens without external audio files).
    - `anomaly.js`: Transparent statistical anomaly detection engine implementing the clinical Persistence Rule ($N=3$ consecutive abnormal ticks) [Approval A7].
    - `mockBioMonitor.js` & `adapter.js`: Realistic Canadian Space Agency (CSA) Bio-Monitor wearable feed emulator with scripted cardiovascular and respiratory anomalies.
    - `commands.js`, `library.js`, `answer.js`, `speak.js`, `listen.js`: Natural voice command parsing, speech synthesis, speech recognition fallback, and grounded Q&A retrieval.
    - `nasaApi.js`: Resilient live NASA DONKI / NOAA SWPC API client with automatic offline failover to cached solar storm event datasets.
- **Human Verification:**
  - Verified every mathematical equation and threshold against official scientific source documents (NASA-STD-3001, CDC ARS guidelines, NOAA Space Weather Scales).
  - Code reviewed for pure functional purity (no hidden side effects, deterministic returns, 0 network dependencies).

### 3.3. Automated Unit Testing & Provenance Gate (Vitest)
- **What AI Assisted With:**
  - Drafted comprehensive unit test suites covering edge cases, arithmetic boundaries, clinical decision branches, and data integrity:
    1. `tests/baseline.test.js`: Personal baseline comparison logic.
    2. `tests/assess.test.js`: Multi-factor assessment rules.
    3. `tests/storm.test.js`: NOAA scale mapping and Artemis I attenuation formulas.
    4. `tests/care.test.js`: Clinical scenario execution and allergy blocking logic.
    5. `tests/retrace.test.js`: ABCDE red-flag detection and loss ladder sequencing.
    6. `tests/handoff.test.js`: Flight surgeon summary structure and timestamping.
    7. `tests/alerts.test.js`: Alert lifecycle, dead-man check-in timers, and escalation states.
    8. `tests/anomaly.test.js`: Persistence rule and statistical threshold boundaries.
    9. `tests/assistant.test.js`: Grounded library retrieval, emergency phrase interception, and safety refusals.
    10. `tests/provenance.test.js`: Automated CI verification gate ensuring **ZERO unanchored or illustrative placeholders** exist in production datasets.
- **Human Verification:**
  - Ran `npx vitest run` locally; **all 10 test suites and 44 unit tests pass cleanly**.
  - Verified that tests assert real-world medical boundaries (e.g., $1000\text{ mGy}$ acute radiation prodrome threshold, systolic blood pressure cutoffs).

### 3.4. UI/UX Design, Clinical Light Theme & SVG Blueprint
- **What AI Assisted With:**
  - Developed responsive, accessible React components matching the Swiss Clinical / Apple Health aerospace aesthetic (`bg-slate-50`, Slate-900 typography, crisp borders, WCAG 2.1 AA contrast).
  - Engineered the interactive vector anatomical silhouette (`HealthTwin.jsx`) with 8 clickable physiological regions and organ cross-sections.
  - Implemented the Patient `SelfSupport.jsx` mode featuring large typography, simplified single-action guidance, and automatic Web Speech read-aloud for incapacitated crew members.
  - Implemented `CrewAlertModal.jsx` featuring real-time multi-tab sound alarms, crew acknowledgment tracking ("On my way"), and a configurable dead-man check-in timer.
  - Designed the Approval Register & Provenance Dashboard (`SourcesScreen.jsx`) displaying all scientific citations, licenses, and medical review states.
- **Human Verification:**
  - Visually audited across desktop, tablet, and mobile viewport sizes.
  - Captured headless browser screenshots via Playwright to verify rendering fidelity, modal positioning, and typography legibility.

### 3.5. Technical Documentation & Deployment
- **What AI Assisted With:**
  - Assisted in structuring documentation files: `README.md`, `project/Storm-Shield-Concept-Note-v4.md`, `project/Storm-Shield-Implementation-Plan-v4.md`, `docs/AI-USE-LOG.md`, and this declaration.
  - Formatted git workflows and GitHub Pages static deployment scripts.
- **Human Verification:**
  - Every claim was audited against the actual functional capabilities of the codebase.
  - Strictly eliminated hyperbolic marketing claims; preserved frank disclosures of student prototype status.

---

## 4. What is AI vs. What is NOT AI in Storm Shield

To maintain the highest standard of academic honesty, the following section explicitly clarifies the boundary between AI assistance and the deterministic software algorithms running inside Storm Shield:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      STORM SHIELD SYSTEM RUNTIME                       │
├──────────────────────────────────────┬─────────────────────────────────┤
│        WHAT IS AI-POWERED            │       WHAT IS NOT AI            │
│   (Development & Voice Pipeline)     │ (Deterministic Clinical Engine) │
├──────────────────────────────────────┼─────────────────────────────────┤
│ • Code generation & test synthesis   │ • Medical Decision Trees        │
│   during development (Antigravity)   │   (100% Deterministic logic)    │
│ • Browser Web Speech API             │ • Wearable Anomaly Persistence  │
│   (Speech-to-Text & Text-to-Speech)  │   (Statistical N=3 Rule)        │
│ • Offline Voice Command Parsing      │ • Solar Storm S-Scale Mapping   │
│   (Exact token & regex grammar)      │   (NOAA Mathematical Boundary)  │
│ • Future Roadmap (Autonomy L5-L6):   │ • Grounded Assistant Answers    │
│   Small on-device SLM summarization  │   (Keyword search on vetted JSON)│
│   (Not in critical clinical path)    │ • Allergy Contraindication Lock │
│                                      │   (Strict Boolean Profile Check)│
└──────────────────────────────────────┴─────────────────────────────────┘
```

### 4.1. Clinical Decision Trees: NOT AI (100% Deterministic)
- The medical care engine (`care.js`, `scenarios/cardio.json`, `scenarios/post-storm.json`) does **NOT** use generative AI, machine learning weights, or neural probabilistic generation.
- **Why?** An astronaut experiencing acute retrosternal chest pain or radiation prodromal vomiting cannot risk an LLM hallucination, stochastic variation, or non-deterministic medication dosages.
- **How it works:** All diagnostic pathways are hard-coded finite state decision trees directly translated from published, peer-reviewed clinical guidelines (CDC Acute Radiation Syndrome guidelines, NIH MedlinePlus First Aid protocols, and NASA Human Research Program evidence books).

### 4.2. Wearable Anomaly Detection: NOT AI (Statistical Rule Engine)
- The physiological anomaly detector (`anomaly.js`) does **NOT** rely on black-box neural networks.
- **How it works:** It uses an auditable, transparent statistical baseline comparison coupled with a **Clinical Persistence Rule** ($N=3$ consecutive abnormal ticks) [Approval Tag A7]. This design choice was deliberately made to eliminate single-spike sensor motion artifacts without obscuring the underlying mathematical logic from the flight surgeon.

### 4.3. Guided Assistant: Grounded Knowledge Retrieval (Zero-Hallucination Safe)
- The Guided Assistant in the current production prototype does **NOT** query an open-ended large language model.
- **How it works:** It uses a deterministic keyword and similarity retrieval engine (`library.js`) operating strictly over `assistant-library.json`.
- **Refusal Boundary:** If a crew member asks a question outside the vetted JSON library, the assistant strictly refuses:  
  *`"I don't have a reviewed answer for that in my library. Please check Retrace or consult medical procedures."`*
- **Emergency Bypass:** Spoken emergency triggers (e.g. *"not breathing"*, *"unresponsive"*, *"heavy bleeding"*) immediately bypass conversational chat, pop the red-flag emergency modal, and trigger the crew alarm siren.

### 4.4. Autonomy Ladder Adherence: Level 2
- Storm Shield operates at **Level 2** of NASA's Medical Autonomy Framework:
  - **Level 0 (Information):** Displays vitals and raw space-weather data.
  - **Level 1 (Advice):** Explains hazard pathology and normal baseline boundaries.
  - **Level 2 (Step-by-step Guidance & Recording; Human Acts):** **Storm Shield's active operational domain.**
  - **Level 5–6 (Autonomous AI Treatment):** Explicitly categorized as future research requiring formal multi-center clinical trials, animal testing, and spaceflight qualification. **Storm Shield does NOT claim autonomous clinical treatment.**

---

## 5. Medical Review & The Approval Register

Because Storm Shield was developed for the NASA Space Apps Challenge hackathon, all clinical guidelines have been cataloged in a transparent **Approval Register** (`src/content/approvals.json`), displayed openly to users and judges in the UI:

| Approval ID | Clinical Domain | Required Reviewer | Prototype Status |
|---|---|---|---|
| **A1** | Acute Cardiovascular Scenario steps, sequencing & Aspirin decision | Physician / Flight Surgeon | Pending Medical Review |
| **A2** | Post-Storm Radiation Nausea rules, dose thresholds ($\ge 700\text{ mGy}$) | Radiation Oncologist / Flight Surgeon | Pending Medical Review |
| **A3** | Reference ranges & personal baseline boundaries (including $\text{SpO}_2$, RR) | Flight Surgeon | Pending Medical Review |
| **A4** | Retrace ABCDE red flags & loss-minimizing priority ladder wording | Emergency Physician | Pending Medical Review |
| **A5** | Assistant library Q&A cards & boundary refusal behaviors | Medical Officer / Physician | Pending Medical Review |
| **A6** | Spoken emergency trigger phrases & Self-Support screen sequencing | Emergency Medicine Specialist | Pending Medical Review |
| **A7** | Wearable anomaly persistence rule ($N=3$) & check-in timer intervals | Flight Surgeon / Biomedical Engineer | Pending Medical Review |

> **Ethical Safeguard Rule:** Any card, step, or threshold with a pending doctor approval is visibly badged in the UI with **"Pending Medical Review"** and is never falsely presented as clinically certified advice.

---

## 6. Human Oversight, Quality Assurance & Verification Matrix

| Component | AI Role | Human Engineer Role | Risk Mitigation | Verification Method |
|---|---|---|---|---|
| **Architecture** | Drafted decoupled modular structure | Reviewed, restructured, and finalized boundaries | Ensured zero external runtime dependencies | Code review & bundle inspection |
| **Space Weather Engine** | Implemented NOAA proton flux S-scale functions | Provided NOAA SWPC mathematical tables & Artemis I attenuation data | Prevents erroneous radiation warning levels | `tests/storm.test.js` (Automated) |
| **Allergy & Care Engine** | Implemented scenario state machine & allergy check | Defined clinical decision rules, contraindication conditions | Prevents accidental administration of harmful meds | `tests/care.test.js` (Automated) |
| **Wearable Simulation** | Generated mock tick stream & scripted anomalies | Defined physiological baseline deltas (tachycardia + hypoxia) | Realistic sensor simulation without ungrounded data | `tests/anomaly.test.js` (Automated) |
| **Assistant Retrieval** | Built regex word-boundary scoring and token parser | Curated 100% of answer content from official sources; red-teamed boundary queries | Prevents medical hallucination and false substring matches | `tests/assistant.test.js` (Automated) |
| **Scientific Sources** | Synthesized schema and badge formatting | Curated and cited 11 official public domain sources (NASA, NOAA, CDC, WHO) | Eliminates unanchored illustrative claims | `tests/provenance.test.js` (Automated) |
| **UI Presentation** | Generated Tailwind layout & SVG anatomical nodes | Visual design direction, high-contrast light theme, ergonomics | Guarantees legibility under mission stress | Headless browser audits & manual UI tests |

---

## 7. Data Provenance & Open Science Compliance

All datasets integrated into Storm Shield adhere to open scientific standards:
- **NOAA Space Weather Prediction Center (SWPC):** Public domain space weather scales and GOES-16 energetic proton flux telemetry.
- **NASA CCMC DONKI (Database of Notifications, Knowledge, and Information):** Solar Energetic Particle (SEP) and Coronal Mass Ejection (CME) catalog.
- **Artemis I Orion Radiation Measurements:** Published in *Nature* (2024), measuring dosimetric attenuation inside the storm shelter.
- **NASA Human Research Program (HRP):** Evidence reports on cardiovascular deconditioning, immune dysregulation, and SANS.
- **Centers for Disease Control and Prevention (CDC):** Acute Radiation Syndrome guidelines for clinical providers.
- **National Institutes of Health (NIH) MedlinePlus:** Evidence-based first-aid response guidelines.

Zero proprietary, un-cited, or copyrighted private medical data was used in the training, synthesis, or runtime execution of this software.

---

## 8. Formal Declaration & Team Sign-Off

We declare that:
1. The information contained in this document is a complete, truthful, and accurate reflection of the use of artificial intelligence in the creation of Storm Shield.
2. AI was used as an assistive software development and design acceleration tool under continuous human engineering oversight.
3. No AI system was granted autonomous authority to invent medical facts, prescribe unverified treatments, or bypass human judgment.
4. Storm Shield remains an educational, open-source prototype developed for the NASA Space Apps Challenge 2026, advancing the frontier of Earth-Independent Medical Operations for deep space exploration.

**Signed on behalf of Team Extokened:**

**Sajidul Islam Sobuj**  
*Lead Software Architect & Engineer*  
NASA Space Apps Challenge 2026 Participant  

**Yarin**  
*Clinical Research, Content Curation & Presentation Lead*  
NASA Space Apps Challenge 2026 Participant  

*Dated: 13 November 2026*  
*Dhaka, Bangladesh*
