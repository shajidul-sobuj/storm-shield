# Storm Shield: Concept Note

**Team Extokened · NASA Space Apps Challenge 2026 · Bangladesh**
Challenge: **Create Health Monitoring Software for Astronauts on Space Missions**
Version 3 · 8 November 2026

---

## 1. The problem

Long missions to the Moon and Mars expose astronauts to the five hazards NASA's Human Research Program has mapped: radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments. These contribute to health problems such as immune changes, bone loss, cardiovascular events, poor nutrition, and behavioural health conditions.

The challenge adds the hardest part: astronauts must be able to assess their own health during a mission. With communication delays of many minutes, possible blackouts, and no guarantee that a doctor is aboard, the crew may have to act first and alone.

NASA is working on this gap itself. Its Earth-Independent Medical Operations concept describes tools that help the Crew Medical Officer when ground support is unavailable or communication-delayed, and a NASA paper says an exploration crew will need to detect, diagnose, treat, and prevent medical events autonomously. Storm Shield is a student prototype in that direction.

## 2. The idea in one sentence

*Storm Shield warns astronauts of solar storms and, when Earth cannot answer in time, guides the crew through a medical emergency one safe step at a time, based on each person's own health baseline and the supplies actually on board.*

## 3. The four parts

1. **Storm Alert (our own focus).** Real space-weather data is converted into three crew levels (Watch, Warning, Shelter now) based on NOAA's radiation storm scale. The alert tells the crew exactly what to do, shows onset, intensity, and duration, and explains itself ("Why this alert?"). After a storm, it prompts a body check of every crew member.
2. **Health Twin (the Crew Health Copilot).** A clickable body figure for each astronaut. Each region shows what it does, how this person's baseline compares with now, how spaceflight hazards affect it, the status, and what to do. Readings are judged against **the individual's own baseline first**, then general reference ranges.
3. **Autonomous Care Mode.** When something goes wrong, the app gives an immediate first-response card, asks triage questions, collects the right vitals, assesses with a stated confidence and a list of unknowns, and guides stabilising and monitoring steps using only the supplies in the onboard kit. It runs recheck timers and builds a **handoff log** a doctor can read in 30 seconds. It runs fully on its own when the ground link is unavailable, and prepares the handoff when a doctor is reachable.
4. **Retrace (for the unexpected).** A fill-in form for anything that happens outside our planned scenarios, or for actions the crew has already taken. The crew records what happened, when, to whom, what they measured, and what they have done. Retrace rebuilds the timeline, checks for red flags, and suggests the next safest steps with a single aim: **keep losses as low as possible**. It is explicit about its low confidence and always offers the safest generic actions.

## 4. How it answers the updated challenge

| The statement asks for | Storm Shield provides |
|---|---|
| A visual tool for self-assessment | Clickable body twin, charts, colour-coded status |
| Guidance on treatments and health improvement | Care Mode steps, guidance cards, Retrace suggestions |
| Indicators: blood pressure, heart rate, blood sugar, temperature, sleep hours, mood | All six, plus symptoms |
| Any kind of input | Typed entries, clicks, forms; camera logging as a later extension |
| When to involve the crew or flight surgeons | Status levels, ground-link modes, handoff log |
| Instructions and explanations | "Why this?" panels and measurement guides |
| Prompts, charts, colour coding, optional gamification | Measurement prompts, trend charts with baselines, status colours, drill mode |
| Different environments | Environment selector (spacecraft, station, rover, base) |

## 5. Data: real as much as possible

Every number carries one of four labels: **REAL** (measured public data), **PUBLISHED** (value from a cited source), **ANCHORED** (synthetic but generated inside cited ranges), **ILLUSTRATIVE** (placeholder; we aim for none).

- **Real:** storm events and proton flux (NASA CCMC DONKI, NOAA SWPC); radiation dose-rate data (NASA OSDR RadLab); real shelter measurements from the Artemis I Orion mission.
- **Published:** radiation-illness facts and thresholds (CDC); first-aid steps (NIH MedlinePlus, NHLBI); spaceflight cardiovascular effects (NASA HRP and NTRS papers); exposure limits (NASA-STD-3001, to be verified).
- **Anchored:** the fictional crew's baselines and live readings. Real astronaut medical data is private.

## 6. Two flagship scenarios

- **A. Cardiovascular scare:** chest discomfort, abnormal blood pressure or heart rate. NASA identifies cardiovascular risk as a concern for long missions.
- **B. Illness after a solar storm:** nausea or vomiting after a storm. The app teaches the key fact that radiation sickness needs a large dose, so it checks the dose evidence and other causes first, and it uses time of vomiting onset as CDC materials do.

Both are built from cited, public sources and **reviewed by a medical professional**.

## 7. Safety design

1. Always show one safe next action.
2. Buy time first: stabilise and monitor before anything invasive.
3. Prefer low-risk, reversible steps; always show "what not to do."
4. Show uncertainty and what is unknown.
5. A source on every step; a reviewer on every scenario.
6. The crew confirms each step; the app logs it.
7. Rules are transparent decision trees, not live AI-generated medical advice.
8. Supply-aware: it only suggests what the kit contains.
9. Clear labels: *student prototype, not clinically validated, not a medical device.*

## 8. What makes it different

NASA is researching onboard medical decision support, and other student teams have built baseline dashboards. Our contribution is the combination: a **storm-to-body chain** (real storm → alert → targeted check → care), a **personalised body twin**, **supply-aware** step-by-step care, a **Retrace** mode for the unexpected, and radical **transparency** about every source and every data label.

## 9. Benefits

- **Crews:** never left without a next action; faster, more organised response; a clean record for the doctor.
- **Mission planners and ground teams:** a structured handoff and a clear picture of what was done.
- **Earth:** the same approach could support remote clinics and disaster settings with few doctors.

## 10. Honest limits

This is a student prototype. It has not been clinically validated, uses fictional crew data, and cannot replace a doctor. Its purpose is to show how a safe, transparent, source-backed assistant could help a crew when help is delayed.

## 11. Key sources

NASA EIMO Concept of Operations (NTRS 20250000009) · NASA paper on spaceflight clinical decision support (NTRS 20220007443) · NASA HRP cardiovascular risk page · CDC acute radiation syndrome fact sheet for clinicians · NIH MedlinePlus heart attack first aid · NOAA Space Weather Scales · NASA CCMC DONKI · NASA OSDR RadLab · Artemis I Orion radiation measurements (Nature, 2024). Full list and links are in the Resource Guide.
