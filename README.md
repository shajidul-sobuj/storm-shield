# STORM SHIELD 🛡️
### Autonomous Health Monitoring & Solar Radiation Decision Support for Deep Space Exploration
**NASA Space Apps Challenge 2026 · Bangladesh**  
*Challenge: Create Health Monitoring Software for Astronauts on Space Missions*  
**Team Extokened:** Sajidul Islam Sobuj & Yarin  
**Live Demo:** *Zero-backend, static client-side web application*

[![Tests](https://img.shields.io/badge/Vitest-25%20Passed-emerald)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Illustrative Data](https://img.shields.io/badge/Illustrative%20Data-0%20(100%25%20Cited)-cyan)](src/content/sources.json)
[![Standard](https://img.shields.io/badge/NASA--STD--3001-Compliant-orange)](https://www.nasa.gov)

---

## 1. Executive Summary

During long-duration crewed missions to the Moon and Mars, astronauts face the five foundational hazards defined by NASA's Human Research Program: **Space Radiation, Isolation and Confinement, Distance from Earth, Gravity Fields (Microgravity), and Hostile Closed Environments**. Communication latencies reaching up to 20-22 minutes one-way (or complete blackouts during solar conjunctions) make real-time guidance from Earth flight surgeons physically impossible.

**Storm Shield** is an **Earth-Independent Medical Operations (EIMO)** clinical decision support prototype designed to bridge this critical gap. When communication with Earth is delayed or lost, Storm Shield:
1. Detects and tracks solar radiation storms using energetic proton flux telemetry mapped to the NOAA S-scale.
2. Evaluates astronaut health against **their individual personal baselines first**, then general clinical standards.
3. Guides crew members through acute emergencies step-by-step using **only the supplies actually verified in the onboard medical kit**.
4. Provides **Retrace mode**—a loss-minimising emergency ladder when unexpected off-script medical events occur.
5. Builds a structured **30-second flight surgeon medical handoff** ready for instant transmission once ground links re-open.

---

## 2. Core Capabilities

### ⚡ 1. Storm Alert & Replay (Solar Particle Events)
- Ingests satellite energetic proton flux ($\ge 10\text{ MeV}$) telemetry.
- Classifies space-weather severity across NOAA Radiation Storm Scales: **S0 (Quiet), S1 (Minor Watch), S2 (Moderate Warning), S3-S5 (Strong to Extreme Shelter Order)**.
- Models physical radiation attenuation inside the spacecraft: includes Artemis I Orion measurements demonstrating **~4.0x dose reduction** inside the central storm shelter (water walls / logistics cargo).
- Automates the **Post-Storm Mandatory Crew Body Check** upon egress.

### 👤 2. Interactive Anatomical Health Twin
- Interactive vector silhouette featuring **8 clickable physiological regions**:
  - Head & Neurological (intracranial pressure, cephalad fluid shift)
  - Eyes & Vision (SANS: Spaceflight-Associated Neuro-ocular Syndrome)
  - Heart & Circulation (cardiovascular remodeling, baroreflex deconditioning)
  - Lungs & Respiratory (closed-environment particulate monitoring)
  - GI & Abdomen (radiation prodrome, space motion sickness)
  - Spine & Musculoskeletal (bone mineral density loss, spinal elongation)
  - Immune & Skin (ionizing radiation absorbed dose accumulation)
  - Behavioral & Cognitive (circadian rhythm desynchrony)
- Each region pairs individual astronaut baseline metrics against current values, explains space hazard pathology, and provides one-click entry into targeted care.

### 🩺 3. Autonomous Care Mode (Supply-Aware Clinical Stepper)
- **Scenario A (Acute Cardiovascular Discomfort):**
  - First-response positioning to reduce venous congestion.
  - Triage decision tree checking blood pressure and dyspnea.
  - **Allergy-enforced medication validation:** strictly verifies crew profiles. If an astronaut has a documented Aspirin/NSAID allergy (e.g. Pilot Alex Vance), administration is **automatically blocked with a clear contraindication alert**.
  - Verifies systolic blood pressure $\ge 90\text{ mmHg}$ before allowing sublingual nitroglycerin.
- **Scenario B (Post-Storm Nausea & Acute Radiation Evaluation):**
  - **Mandatory CDC Dose Check:** verifies whether personal electronic dosimeter absorbed dose exceeds the clinical threshold for acute radiation sickness ($\ge 700\text{ mGy}$).
  - Differential checklist ruling out non-radiation causes (Space Motion Sickness, habitat $\text{CO}_2$ buildup, gastroenteritis).
  - Triage latency rule: early vomiting within 2 hours of high exposure triggers acute prodrome protocols (CDC REMM guidelines).
  - Ondansetron and Oral Electrolyte Rehydration supply verification.
- **Integrated Recheck Timers:** 10-15 minute serial countdown alarms with hold plans and worsening signs checklist.

### 🧭 4. Retrace Engine (For the Unexpected)
When unexpected emergencies occur outside pre-computed scenarios:
1. **Red-Flag Primary Survey (ABCDE):** rapid automated screen for Airway, Breathing, Circulation, Disability, and Exposure emergencies.
2. **Prior Action Review:** screens any off-script actions taken by crew against the patient's allergy profile and kit cautions.
3. **Loss-Minimising Priority Ladder:**
   - **Tier 1:** Stop ongoing harm (halt exertion, isolate hazard).
   - **Tier 2:** Protect life functions (clear airway, oxygen, seated posture).
   - **Tier 3:** Conservative, reversible actions (oral hydration; avoid unverified drugs).
   - **Tier 4:** Preserve time (shorten serial recheck to 10 minutes).
   - **Tier 5:** Preserve information (log all observations for flight surgeon).
   - **Tier 6:** Conserve scarce consumables.
4. **Honest Disclosure:** Always labels output: *"Outside planned scenarios: low confidence"*.

### 📋 5. Flight Surgeon Medical Handoff
- Formatted according to NASA EIMO specifications.
- Consenses complex events into a 1-page briefing readable by an Earth flight surgeon in 30 seconds.
- Includes baseline vs current telemetry table, cumulative absorbed dose, active space-weather status, timestamped interventions log, and copy/print exports.

---

## 3. Scientific Provenance & Zero-Unanchored-Data Rule

Every number and clinical recommendation carries an explicit provenance tag linking to verified public scientific sources in [`src/content/sources.json`](src/content/sources.json):

| Provenance Tag | Meaning | Primary Cited Sources |
|---|---|---|
| **`REAL`** | Public measured scientific telemetry | NOAA SWPC GOES-16, Artemis I Orion (Nature 2024), NASA OSDR RadLab |
| **`PUBLISHED`** | Documented clinical thresholds & standards | CDC Acute Radiation Syndrome Fact Sheet, NASA-STD-3001, WHO ABCDE, NIH MedlinePlus |
| **`ANCHORED`** | Fictional astronaut baselines bounded inside published ranges | NASA Human Research Program Cardiovascular Evidence Reports |
| **`ILLUSTRATIVE`** | Unanchored placeholders | **0 in production demo (Enforced by automated build test)** |

---

## 4. Architecture & Technical Design

Storm Shield is engineered as a **pure frontend, zero-backend, offline-first** web application. It requires no server, no cloud database, and no login, guaranteeing that it operates flawlessly during deep-space communication blackouts or internet outages.

```
storm-shield/
├── LICENSE                         # MIT License
├── README.md                       # Documentation & Project Guide
├── docs/
│   ├── AI-USE-LOG.md               # Continuous audit log of AI assistance
│   ├── Storm-Shield-Concept-Note.md
│   ├── Storm-Shield-Implementation-Idea.md
│   └── Storm-Shield-Roadmap-v3.md
├── data/
│   ├── processed/storm-replay.json # Real NOAA GOES-16 energetic proton flux dataset
│   └── README.md                   # Data provenance table
├── src/
│   ├── content/                    # Cited clinical & crew JSON datasets
│   │   ├── crew.json               # 3 astronaut profiles (ANCHORED baselines & allergies)
│   │   ├── regions.json            # 8 anatomical zones mapped to space hazards
│   │   ├── indicators.json         # 6 core vitals with reference boundaries
│   │   ├── kit.json                # Medical kit inventory & contraindications
│   │   ├── sources.json            # Master citation & license registry
│   │   └── scenarios/              # cardio.json & post-storm.json
│   ├── engine/                     # Decoupled, deterministic, unit-tested logic
│   │   ├── baseline.js             # Personal baseline vs general range comparator
│   │   ├── assess.js               # Multi-factor nominal / watch / act assessor
│   │   ├── storm.js                # NOAA S-scale and Artemis I shelter attenuation
│   │   ├── care.js                 # Supply-aware scenario navigator
│   │   ├── retrace.js              # ABCDE red flags & loss-minimising ladder
│   │   └── handoff.js              # 30-second flight surgeon briefing generator
│   ├── ui/                         # Mission control React components
│   └── tests/                      # Automated Vitest suites (25 tests passing)
```

---

## 5. Getting Started & Verification

### Prerequisites
- Node.js $\ge 18$ (Tested on Node v24.2)
- npm $\ge 9$

### Installation
```bash
git clone https://github.com/Sobuj1828/storm-shield.git
cd storm-shield
npm install
```

### Run Automated Unit Tests & Provenance Audit
```bash
npm test
```
*Executes all 25 unit tests across baseline comparison, triage escalation, NOAA storm mapping, kit supply checks, allergy contraindication blocking, and the zero-illustrative-data provenance gate.*

### Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build Production Bundle
```bash
npm run build
```

---

## 6. NASA Space Apps Demo Walkthrough (< 2 Minutes)

1. **Mission Header & Ground Link Switch:** Notice the MET mission clock and ground-link status (`Unavailable` by default, simulating communication blackout).
2. **Overview:** Select **Alex Vance** (Pilot). The triage engine detects an active **ACT** condition (Systolic BP 148 mmHg, tachycardia 104 bpm, chest discomfort). Every metric shows its personal baseline delta and provenance badge (`ANCHORED`).
3. **Interactive Health Twin:** Click the **Heart (Cardio)** zone or **Abdomen (GI)** zone on the SVG silhouette. The diagnostic drawer displays spaceflight hazard pathology (fluid cephalad shift) and offers direct entry to Care Mode.
4. **Care Mode (Scenario A):** Run the clinical steps. When viewing the Aspirin step, notice how the engine detects Alex Vance's allergy profile and **automatically disables administration with a red contraindication warning**.
5. **Storm Monitor & Replay:** Scrub through the historic solar superstorm timeline. Observe the flux climb into S3 Strong ($4,200\text{ pfu}$) triggering the Shelter Order and Artemis I ~4x dose reduction. Scrub to step 10 to see the storm pass and trigger the **Mandatory Post-Storm Body Check**.
6. **Retrace Mode:** Type an unplanned symptom (e.g. dizziness after airlock inspection) and prior action ("gave aspirin"). Notice the immediate **Allergy Violation Alert** and the 6-tier loss-minimising priority ladder with explicit low confidence disclosure.
7. **Flight Surgeon Handoff:** View the 1-page condensed medical briefing ready for transmission to Earth.
8. **Data & Sources:** Inspect the transparency portal detailing all 11 scientific citations and zero illustrative entries.

---

## 7. Safety, Limits & Academic Disclaimer

> [!CAUTION]
> **Storm Shield is a student prototype developed for the NASA Space Apps Challenge 2026.**  
> It has not undergone formal clinical trials or FDA/NASA certification and is **not a certified medical device**. All medical decision algorithms are strictly rule-based and deterministic, derived from publicly available guidelines published by the CDC, NIH, and NASA Human Research Program. In real-world medical situations, always consult qualified medical personnel.

---

## 8. Authors & Acknowledgments

- **Sajidul Islam Sobuj** (Software architecture, engine algorithms, frontend engineering, test suites, and data pipeline)
- **Yarin** (Clinical literature curation, scenario review, presentation, and narrative)
- **Team Extokened · NASA Space Apps Challenge 2026 (Dhaka, Bangladesh)**

*Special thanks to NASA, NOAA Space Weather Prediction Center, and the CDC for maintaining open, public-domain scientific datasets and clinical literature.*
