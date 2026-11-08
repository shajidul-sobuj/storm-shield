# Storm Shield: Implementation Idea

**Team Extokened · Version 3 · 8 November 2026**
Goal: a working, deployable web prototype by **Friday 13 November**, built by two people.

---

## 1. Architecture

- **Frontend-only web app** (HTML/CSS/JavaScript, or React + Vite). No backend, no database, no accounts.
- **Bundled JSON data** (real storm data, scenario trees, content, sources). Works offline.
- **Static deployment** (Vercel or GitHub Pages) with a live link for judges.
- **A separate, unit-tested engine** that contains every rule, so the logic is inspectable.
- **Content in JSON**, written and reviewed by Yarin, loaded by the app, so content can change without code changes.

```
storm-shield/
├── README.md  LICENSE
├── docs/                 concept note, implementation idea, AI-use log, references
├── data/
│   ├── raw/              as downloaded (DONKI, NOAA, RadLab extracts)
│   ├── processed/        cleaned files the app loads
│   └── README.md         provenance table: file, source URL, dates, download date, terms
└── src/
    ├── engine/           baseline.js assess.js storm.js care.js retrace.js handoff.js
    ├── content/          crew.json regions.json indicators.json kit.json
    │   └── scenarios/    cardio.json post-storm.json
    │                     sources.json   (every citation + license)
    ├── ui/               overview, body twin, vitals, storm, care, retrace, kit, handoff, sources
    └── tests/            one test per rule
```

## 2. The provenance system (low simulated data, cited legally)

Every value shown anywhere carries a **provenance tag** and a **source id**:

```json
{ "value": 0.95, "unit": "mGy/day", "provenance": "REAL",
  "source": "radlab-iss-2025", "note": "ISS absorbed dose rate" }
```

- Tags: `REAL`, `PUBLISHED`, `ANCHORED`, `ILLUSTRATIVE`.
- The UI shows a small badge on each number and a **Data & Sources** screen listing every source with its license and access date.
- **A build check** (a test or script) fails if any value lacks a source id or uses `ILLUSTRATIVE` in the demo path. This enforces "as little simulated data as possible."

**`sources.json` entry:**
```json
{ "id": "cdc-ars-clinicians", "title": "Acute Radiation Syndrome: A Fact Sheet for Clinicians",
  "publisher": "CDC", "url": "https://www.cdc.gov/nceh/radiation/emergencies/arsphysicianfactsheet.htm",
  "accessed": "2026-11-09", "license": "US government work: cite", "usedFor": "ARS dose threshold and symptom stages",
  "paraphrased": true, "checkedBy": "Yarin" }
```

## 3. Data pipeline (real data first)

1. **Storm events:** download DONKI (`SEP`, `FLR`, `CME`, `IPS`, `notifications`) and NOAA SWPC proton-flux/alert samples for the replay window (use a US VPN where needed). Save raw files in `data/raw/` and log them.
2. **Radiation context:** pull ISS dose-rate extracts from **RadLab** (or use published tables) for the exposure view. Read the terms of use first.
3. **Processing script:** a small script converts raw files to the clean JSON the app uses, so the process is repeatable and documented.
4. **Anchored crew data:** a generator creates each fictional astronaut's baseline and readings **inside ranges taken from cited sources**, tagged `ANCHORED`.
5. **No live fetching at the event.** Everything the demo needs is bundled. Live fetching is an optional extra with a fallback.

## 4. Engine modules (all unit-tested)

| Module | Job |
|---|---|
| `baseline.js` | Compare a reading with the person's baseline, then with general ranges |
| `assess.js` | Return status (Normal / Watch / Act), reason, confidence, unknowns |
| `storm.js` | Map flux and events to Quiet / Watch / Warning / Shelter now |
| `care.js` | Run a scenario tree: first response, triage, vitals, steps, timers, log |
| `retrace.js` | Handle the unexpected (see section 6) |
| `handoff.js` | Build the one-page summary from the log |

## 5. Scenario format (decision trees as JSON)

```json
{
  "id": "post-storm-illness",
  "firstResponse": [{ "text": "Shelter if the storm is active", "source": "artemis1-shelter" }],
  "triage": [{ "id": "t1", "q": "Has there been repeated vomiting?", "yes": "t2", "no": "t3" }],
  "capture": ["stormStartTime", "symptomStartTime", "vomitingStartTime"],
  "rules": [{ "if": "vomitingWithinHours <= 2 && stormLevel >= 2", "status": "act",
              "why": "Early vomiting after a major storm is a recognised marker", "source": "cdc-triage-2006" }],
  "steps": [{ "text": "...", "needsKit": ["oral-rehydration"], "source": "...", "reviewedBy": "initials" }],
  "doNot": ["..."],
  "recheckMinutes": 15,
  "worseningSigns": ["..."],
  "holdPlan": ["..."]
}
```

**Rules for scenarios:**
- Every step, rule, and "do not" has a `source`.
- Steps tied to a medicine or tool list `needsKit`. If the kit lacks it, the UI greys it out and shows the next documented option.
- A step with `reviewedBy` empty **cannot appear in the demo build** (the build check fails). This makes reviewer sign-off enforceable.
- Scenario B opens with a **dose check** (the CDC dose threshold) and a list of **other causes** before treating radiation as likely.

## 6. Retrace: the "something unexpected happened" mode

**Purpose:** handle events or actions outside the planned scenarios, and keep losses as low as possible.

**Inputs (a fill-in form with structured fields plus free text):**
- Who (crew profile auto-fills baselines and allergies)
- What happened (free text) and where on the body (click the twin)
- When it started, and key times since
- Symptoms (checklist plus other)
- Vitals taken (any of the six)
- **Actions already taken**, including anything off-script, with time, and **supplies used**
- Current state and any change since

**Processing (rule-based, transparent):**
1. **Red-flag check** using a generic primary-survey order (airway, breathing, circulation, level of consciousness, exposure/injury), taken from a published emergency framework and reviewed. Any red flag puts a "treat as an emergency now" panel at the top.
2. **Closest-scenario match:** compare symptoms and vitals with Scenario A and B triggers. If it matches, offer to switch into that scenario carrying over what's been recorded.
3. **Action review:** compare the actions taken with the kit item cards (documented cautions, allergies from the profile). Flag possible conflicts ("this person's profile lists an aspirin allergy").
4. **Next safest steps** chosen by a **loss-minimising priority ladder**:
   1. Stop ongoing harm.
   2. Protect life functions (airway, breathing, circulation).
   3. Prefer reversible, low-risk actions; avoid irreversible ones.
   4. Preserve time (set recheck timers; shorten the time to reassess).
   5. Preserve information (log everything for the handoff).
   6. Preserve scarce supplies (suggest using the least resource that works).
5. **Confidence display:** always label Retrace output *"Outside planned scenarios: low confidence"* and list unknowns and the measurement that would reduce uncertainty.
6. **Output:** a rebuilt timeline, the suggested next steps (each with a source), recheck timers, and the handoff log.

**Pseudocode:**
```
retrace(report):
  timeline = sort(report.events)
  flags = redFlagCheck(report)              // generic, sourced
  match = closestScenario(report)           // optional hand-off to Care Mode
  warnings = reviewActions(report.actions, report.profile, kit)
  steps = []
  for tier in LOSS_LADDER:                  // stop harm → life → reversible → time → info → supplies
      steps += applicableSteps(tier, report, kit)
  return { timeline, flags, match, warnings, steps: dedupe(steps), confidence: "low", unknowns }
```

**Scope for the hackathon:** build Retrace with the generic ladder, the red-flag panel, the action review, and the timeline. Do **not** try to cover every possible medical event. The honesty and the structure are what matter.

## 7. UI map

1. **Overview:** crew tabs, six indicator tiles, storm badge, ground-link switch.
2. **Health Twin:** SVG body with 8 clickable regions; region panel (function, baseline vs now, hazard effects, status, guidance, "Something's wrong here").
3. **Vitals entry:** blood pressure, heart rate, blood sugar, temperature, sleep, mood, symptoms.
4. **Storm Monitor and Alert:** flux chart with S-level lines, alert screen, Body Check prompt.
5. **Care Mode:** first response → triage → vitals → assessment → steps → timer → hold plan → handoff.
6. **Retrace:** the fill-in form and output.
7. **Medical Kit:** item list with source and quantity.
8. **Handoff:** one-page summary.
9. **Data & Sources:** provenance badges and licenses.

## 8. Testing and quality

- A unit test for **every rule** (given these readings, expect this status).
- A **provenance test** (no value without a source; no ILLUSTRATIVE in the demo).
- A **sign-off test** (no unreviewed step in the demo build).
- Manual tests of the full demo path on the deployed link, on a phone-size screen, and on mobile data.
- A **backup screen recording** of the full demo.

## 9. Build order (so something always works)

1. App shell, crew tabs, deployed empty page.
2. Body twin with panels (static content first).
3. Vitals entry and the baseline/assessment engine.
4. Storm replay and alert.
5. Care Mode with Scenario A, then B.
6. Kit and handoff.
7. Retrace.
8. Data & Sources screen and polish.

If time runs short, cut from the bottom of this list, never from the top.

## 10. Risks

| Risk | Plan |
|---|---|
| Medical content judged unsafe | Public sources, reviewer sign-off enforced by the build, conservative steps, clear labels |
| Too much for two people | Fixed P0 list, build order above, cut rule at Thursday noon |
| Data sites blocked | Bundle files, no live fetch at the event |
| Retrace over-reaches | Generic ladder only; low-confidence label; no new medical claims |
| Licensing mistake | `sources.json` records a license for each source; paraphrase, don't copy |
