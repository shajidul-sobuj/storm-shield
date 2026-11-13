# Storm Shield: Product Specification

**What we are really building, screen by screen, feature by feature**
Team Extokened · NASA Space Apps Challenge 2026

> Items marked **[CHECK]** need verifying before you rely on them. Items marked **(design choice)** are our own decisions, not NASA facts, so say so if asked. Everything about astronaut health values is **simulated**.

---

## Part A. Product overview

### A.1 One sentence
Storm Shield is a crew-facing app that watches space weather, warns the crew of dangerous solar storms in plain language, and connects each storm to every astronaut's personal health picture.

### A.2 Who uses it
- **Astronaut / crew member (primary user).** Sees alerts, their own health status, and guidance.
- **Commander or Crew Medical Officer (CMO).** Sees all crew members' status and acknowledges alerts.
- **Ground mission planner or flight surgeon (optional, read-only view).** Sees the same summary when communication is available.
- **Judges (for the hackathon).** They see a demo of the above with replayed real data.

### A.3 Where it is used
- **On board a spacecraft or habitat** (a tablet, a habitat display, a laptop). This is the main scenario: Mars transit, the Mars surface, or a lunar habitat.
- **Near EVA preparation:** the alert state is shown before a spacewalk or surface walk. A future wearable or suit display is possible, but out of scope for now.
- **On the ground,** as a mirror view for planners.
- **In our hackathon demo:** a web app running in a browser on a laptop, working offline from saved real data, with a replay mode.

### A.4 Design principles
1. **Calm in a crisis.** One clear message, one clear action, no clutter during a storm.
2. **Never rely on colour alone.** Every status has a colour, an icon, and words.
3. **Explain everything.** Every alert has a "Why am I seeing this?" panel.
4. **Offline-first.** The app must work with no connection to Earth. Live data is a bonus.
5. **Decision support, not diagnosis.** The app never says a person has a medical condition.
6. **Honest about uncertainty.** Show data age, source, and whether a value is real or simulated.
7. **Low false alarms.** NASA's own alert work stresses limiting false alarms without missing real hazards [S9].

---

## Part B. The surface: every screen

### B.1 Global top bar (always visible)
- **Storm level badge:** Quiet / Level 1 Watch / Level 2 Warning / Level 3 Shelter now.
- **Crew status summary:** how many crew members are Normal, Watch, or Act.
- **Data freshness:** "Space weather data updated 4 min ago" or "Offline: last data 2 h ago."
- **Source indicator:** Live, Saved, or Simulated.
- **Mute / acknowledge button** for sounds.
- Tapping the storm badge opens the Storm Monitor. Tapping crew status opens the Crew Dashboard.

### B.2 Screen 1: Home / Mission Status
A single overview.
- **Storm card:** current level, one-line meaning, "next update" time.
- **Crew card row:** one small card per astronaut with name, status, and the one reading that needs attention.
- **Exposure strip:** a thin bar showing cumulative exposure against the reference limit (simulated).
- **Latest events list:** the last three notable events (flare, CME, particle event).
- **Quick actions:** "Daily check-in," "Open action guide," "View timeline."

### B.3 Screen 2: Storm Alert (full-screen takeover)
Appears when the level reaches Warning or Shelter now. It must be readable from across a room.
- **Header:** level name and colour, with an icon and plain words ("SHELTER NOW").
- **What happened:** one sentence ("A solar particle event has been detected.").
- **What to do now:** 3-4 numbered steps (for example, move to the shielded area, pause outside activity, confirm crew accounted for).
- **Onset, intensity, duration:** three boxes. When it started, how strong (the matching NOAA S-level), and the estimated duration or "unknown." This follows NASA's list of what a crew needs [S9].
- **Confidence note:** how sure the system is (for example, "confirmed by two readings").
- **Acknowledge button:** each crew member confirms. The screen shows who has acknowledged.
- **"Why am I seeing this?"** opens the explanation panel (see C.9).
- **Sound and visual signal** with a mute option after acknowledgment.

### B.4 Screen 3: Space Weather Monitor
The live picture behind the alerts.
- **Proton flux chart (≥10 MeV):** with horizontal lines at the S1-S5 thresholds.
- **X-ray flux (flares) chart:** with flare class bands (C, M, X).
- **Planetary Kp index:** geomagnetic storm context.
- **Event timeline:** flares, CMEs, particle events, and shocks from DONKI, with links between related events (for example, "flare → CME → shock").
- **Level gauge:** where the current reading sits on the Quiet-to-Extreme scale.
- **Data panel:** source names and last update times.

### B.4b Mars awareness panel (optional)
- Shows interplanetary shock events logged at Mars (DONKI supports a Mars location filter [S16]).
- Label clearly that the main level is based on Earth-region data, which is a proxy.

### B.5 Screen 4: Crew Health Dashboard
- **One card per astronaut:** name, overall status (Normal / Watch / Act), and the indicators: sleep, heart rate, exercise, mood, radiation exposure.
- **Each indicator** shows the current value, a small trend line, and a status icon.
- **Sort and filter:** show only Watch/Act.
- **Tap a card** to open the astronaut detail.

### B.6 Screen 5: Astronaut Detail
- **Baseline band** behind each trend line, showing that person's normal range.
- **Time ranges:** 24 hours, 7 days, 30 days.
- **Flags:** what triggered Watch or Act and since when.
- **Notes:** the astronaut's own check-in comments.
- **Suggested next steps** (from the action guide) with a "Mark as done" option.
- **Storm overlay:** a toggle that marks storm periods on the trend lines, so you can see "sleep dropped after the storm."

### B.7 Screen 6: Daily Check-in
A short form (under one minute).
- **Mood:** a simple 1-5 scale with icons.
- **Sleep quality:** a 1-5 scale plus hours.
- **Energy and stress:** simple scales.
- **Quick symptom tags** (for example, headache, nausea, tiredness). Tags are for logging, not diagnosing.
- **Free-text note.**
- **After submitting,** the app shows a summary and any suggested next step.

### B.8 Screen 7: Radiation Exposure
All values here are simulated and educational.
- **Cumulative exposure** with reference lines for the NASA-STD-3001 career limit (600 mSv) and the short-term solar-particle-event limit (250 mSv) [S4][S5] **[CHECK]**.
- **Storm contribution:** how much of the total came from the current or past events.
- **EVA flag:** time spent outside, shown as a separate segment.
- **Projection:** a simple "if this continues" estimate.
- **Disclaimer box:** "Simulated values. Not a medical dosimeter."

### B.9 Screen 8: Action Guide
A searchable library of checklists.
- **Storm Level 1, 2, and 3 checklists** (shelter, pause EVA, account for crew, reporting).
- **Post-storm health check-in checklist.**
- **Sleep and routine support tips** (kept general).
- **Each checklist cites its source.** Where we lack an official NASA protocol, label the text "draft guidance for the prototype."
- **Large-text mode** for use during an alert.

### B.10 Screen 9: Event Log / Timeline
- A chronological list of storm alerts, level changes, acknowledgments, check-ins, and health flags.
- **Filters** by type, person, and date.
- **Export** to a file (useful for the ground team when the link returns).

### B.11 Screen 10: Replay / Demo Mode
Built for the hackathon and for training.
- **Choose a past event** (the main one: the January 18, 2026 particle event, with its linked flare, CME, and shock).
- **Play, pause, and speed controls** (1x, 10x, 60x).
- **The whole app reacts** as if the event were live: the storm level changes, the alert appears, and the copilot prompts a check-in.
- **A "Demo" watermark** so it's never mistaken for live data.

### B.12 Screen 11: Settings and Data Sources
- **Data sources list** with status, last update time, and a manual "Refresh" button.
- **Offline mode switch.**
- **Units** (mSv/µSv, UTC/local mission time).
- **Alert sound and volume.**
- **Text size and high-contrast mode.**
- **Threshold view** (read-only for the demo): how each level is defined.
- **Reset demo data.**

### B.13 Screen 12: About, Sources and Disclaimers
- What the app is and is not.
- Every data source and reference, with credits (including NASA CCMC DONKI and NOAA SWPC).
- AI use statement.
- Simulated-data disclosure.

---

## Part C. Features in detail

### C.1 Space weather ingestion
- Pulls events and measurements from NOAA SWPC and NASA DONKI (see Part D).
- **Fetch with a fallback:** try live first, then use the most recent saved copy, and tell the user which one is being shown.
- **Validation:** discard impossible values, handle missing data, and never crash on bad input.
- **Time handling:** store everything in UTC and show mission time.

### C.2 Storm severity engine
- Converts raw measurements and events into the four levels (see Part E).
- **Hysteresis (design choice):** the level doesn't drop immediately when a value dips. It waits for a sustained period below the threshold.
- **Confirmation (design choice):** a Shelter-now alert needs confirmation from consecutive readings or an official alert.
- **Escalation and de-escalation messages** are logged.

### C.3 Early "Watch" signals
- Even before particles arrive, a large flare or a fast CME can raise a Watch. NOAA notes that solar particle events result from fast coronal mass ejections [S3b].
- The Watch message says what is being monitored and what could happen next.

### C.4 Onset, intensity, duration
- **Onset:** the first time the threshold was crossed.
- **Intensity:** the current and peak NOAA S-level.
- **Duration:** time since onset, and an "unknown" or estimated end if a model provides one (DONKI WSA-Enlil runs provide estimated shock arrival and duration [S16]).

### C.5 Alert delivery
- Full-screen takeover, sound, and a persistent banner.
- **Acknowledgment tracking** for each crew member, with reminders for those who haven't.
- **Do-not-disturb protection:** Level 3 can't be fully silenced until acknowledged.

### C.6 Crew Health Copilot: gather
- **Inputs:** sleep (hours and quality), heart rate, exercise (minutes and type), mood, stress, symptom tags, and simulated exposure.
- **Sources for the demo:** a built-in simulator that generates realistic daily data for 3-4 astronauts, with a few deliberate changes to show the system working.
- **Future inputs (not built):** wearable or dosimeter feeds, shown as a labelled placeholder.

### C.7 Crew Health Copilot: evaluate
- **Personal baseline:** a rolling window (design choice: the last 14 days) of each person's own readings.
- **Status rules (design choice, tunable):**
  - Normal: within the person's usual range.
  - Watch: moderately outside it, or a steady trend in one direction.
  - Act: far outside it, or several indicators drifting together.
- **No population "normal":** everything is relative to the individual, because people differ.
- **Rules are transparent** and shown in the "Why" panel.

### C.8 Crew Health Copilot: act
- Each Watch or Act status shows 1-3 suggested next steps from the Action Guide.
- **Escalation path:** "Contact the Crew Medical Officer" and "Contact ground when the link is available."
- **No treatment advice** beyond general, sourced guidance.

### C.9 Explainability ("Why am I seeing this?")
- Shows the exact reading, the rule that fired, the data source, and the time.
- **Example:** "Level 2 Warning because ≥10 MeV proton flux reached 1,000 pfu at 22:55 UTC, matching NOAA S3."
- Judges and crews can inspect the logic, which supports your Validity score.

### C.10 Storm-health linkage
- **After a storm reaches Level 2 or higher,** the copilot prompts an extra check-in within a set time.
- **Overlay:** storm periods appear on health trend charts.
- **Combined message (example):** "Exposure rising and sleep below baseline for 2 nights. Schedule a check-in."
- The linkage is correlation for attention, not a claim of cause.

### C.11 Radiation exposure tracker (simulated)
- A simple educational model: dose accumulates faster at higher levels, and faster during EVA.
- **Reference lines** from NASA-STD-3001 **[CHECK]**.
- **Clearly labelled** as a simplified simulation. Real systems use onboard dosimeters and detailed organ-dose models [S7].

### C.12 Offline-first behaviour
- The app and all saved data are bundled and load without a network.
- **Check-ins and logs** are stored locally.
- **A sync queue (future)** would send logs to the ground when a link returns.

### C.13 Event log and export
- Every alert, level change, acknowledgment, check-in, and flag is time-stamped.
- Export as a file for ground teams.

### C.14 Replay and training mode
- Plays back a real past event with controls.
- Also works as a **crew training** tool and as your **validation test**.

### C.15 Accessibility
- High contrast, large text, icons plus words, screen-reader labels, and a keyboard-friendly layout.
- **Sound options** and a visual-only mode.
- English interface (the guide requires English for judging). A Bangla toggle is an optional extra.

### C.16 Privacy and security
- **Crew health data stays on the device.** There is no cloud storage in the prototype.
- **The demo uses only synthetic data.** No real health data is used.
- **No tracking, accounts, or ads.**

### C.17 Transparency features
- **Data provenance** on every screen: Live, Saved, or Simulated.
- **Credits** for CCMC DONKI, NOAA SWPC, NASA, and NOAA references.
- **Version and date** of the data snapshot.

---

## Part D. Data sources: where we collect from

| Source | What we take | How | Frequency | Notes |
|---|---|---|---|---|
| **NOAA SWPC GOES proton flux** | ≥10, ≥50, ≥100 MeV integral flux (5-minute averages) | JSON from `services.swpc.noaa.gov/json/goes/` (primary satellite files) [S3b] | Every 5 min | Basis for S-level. Use current files, since NOAA removed some older JSON files in 2020. **[CHECK]** the directory for exact file names. |
| **NOAA SWPC alerts and warnings** | Proton event alerts and the ≥10 MeV warning with predicted S-scale level | `services.swpc.noaa.gov/products/alerts.json` **[CHECK]** | Within minutes of issue | NOAA issues alerts at 10, 100, 1,000, 10,000, and 100,000 pfu [S3b], matching the S-scale. |
| **NOAA SWPC X-ray flux** | Flare class and timing | SWPC JSON data service **[CHECK]** | Near real time | Used for Watch signals. |
| **NOAA SWPC Kp index** | Geomagnetic activity | `services.swpc.noaa.gov/products/noaa-planetary-k-index.json` [S20] | About every 3 hours | Context only. |
| **NASA CCMC DONKI** | `SEP`, `FLR`, `CME`, `CMEAnalysis`, `IPS` (including Mars), `WSAEnlilSimulations`, `notifications` | `ccmc.gsfc.nasa.gov/DONKI-API/get/...` [S17] | Event-based | Linking events, analysis, duration estimates. Described as prototyping quality [S16]. Credit CCMC. May need a US VPN to collect. |
| **NOAA S-scale table** | S1-S5 definitions | Static reference in the app [S3] | Fixed | Source of the level mapping. |
| **NASA-STD-3001 reference limits** | 600 mSv career, 250 mSv short-term | Static reference [S4][S5] | Fixed | **[CHECK]** the numbers in the Technical Brief. |
| **Health data** | Sleep, heart rate, exercise, mood, exposure | Built-in simulator | Daily plus on demand | All synthetic. |
| **Action guide text** | Checklists | Written by the team with cited sources | Fixed | Mark unsourced text as "draft guidance." |

**Offline strategy:** download DONKI and NOAA samples for the demo windows now and bundle them. Live fetching is an optional extra, wrapped in error handling.

---

## Part E. Logic specification

### E.1 Levels and mapping (design choice, adapted from NOAA [S3])
| Our level | Meaning | Trigger |
|---|---|---|
| **Quiet** | No notable event | ≥10 MeV flux below 10 pfu and no active watch conditions |
| **Level 1: Watch** | Be aware | NOAA S1-S2 (10 to under 1,000 pfu), or a major flare or fast CME that may lead to a particle event |
| **Level 2: Warning** | Prepare to protect | NOAA S3 (1,000 pfu or above, up to 10,000) |
| **Level 3: Shelter now** | Take protective action | NOAA S4-S5 (10,000 pfu or above) |

NOAA's table lists no astronaut hazard at S1-S2, a recommendation to avoid radiation for astronauts on EVA at S3, and an unavoidable hazard on EVA at S4-S5. **Note:** the NOAA scale is based on near-Earth measurements. State this on camera. For a Mars crew, local conditions will differ.

### E.2 Anti-flapping and false-alarm controls (design choice)
- Require two consecutive readings above a threshold before raising Level 2 or 3, unless NOAA has issued an official alert.
- Hold a level until readings stay below the threshold for a set period (for example, 30 minutes) before lowering it.
- Show confidence next to every alert.

### E.3 Health status rules (design choice, simulated, not clinical)
- Baseline: rolling 14-day mean and spread for each indicator, per person.
- **Watch:** a reading beyond about 1.5 spreads from the baseline, or three days of steady drift.
- **Act:** beyond about 2.5 spreads, or three or more indicators in Watch at once.
- All numbers are tunable settings. Describe them as prototype defaults.

### E.4 Linkage rules (design choice)
- If the storm level is 2 or higher and any indicator is Watch or Act in the following 48 hours, show the combined message and prompt a check-in.

### E.5 Exposure model (simulated, educational)
- Dose per hour = baseline rate × a multiplier for the current level × an EVA multiplier.
- Values are illustrative. Do not present them as measurements.

---

## Part F. Usage scenarios (how it is used, step by step)

1. **A quiet day.** The crew opens Home, sees Quiet, completes the daily check-in, and reviews their dashboard.
2. **A watch signal.** A large flare occurs. The badge turns to Watch. A message explains what is being monitored. Nothing else changes.
3. **A storm warning (Level 2).** The full-screen alert appears with onset, intensity, and duration. The crew acknowledges and reviews the Level 2 checklist. Planned EVA is paused.
4. **Shelter now (Level 3).** The alert takes over the screen. The crew follows the shelter steps and acknowledges. The exposure view updates.
5. **Recovery.** The level drops after the hold period. The copilot prompts a post-storm check-in. Trend lines show the storm period.
6. **A health flag.** Sleep drifts below baseline after a storm. The copilot shows Watch with a suggested next step and an option to contact the CMO.
7. **Communication delayed.** The ground link is unavailable. The app keeps working, logs everything, and offers an export for later.
8. **Training.** A crew member runs the January 2026 replay to practice the response.
9. **The judge demo (about 2 minutes).** Start at Home (Quiet) → run the replay → Watch → Warning → Shelter now alert → acknowledge → exposure update → copilot check-in prompt → health trend with storm overlay → show "Why this alert?" and the data sources screen.

---

## Part G. Build plan

### G.1 Priorities
**Must have (minimum demo):**
- Home, Storm Alert, Space Weather Monitor (basic charts), Crew Health Dashboard, Daily Check-in.
- Severity engine with the four levels and the "Why" panel.
- Saved real data from NOAA SWPC and DONKI for the January 2026 window, plus a replay mode.
- Baseline health logic with simulated data.
- Offline operation, data-source labelling, and disclaimers.
- Public GitHub repository and complete NASA project page.

**Should have:**
- Radiation Exposure screen, Action Guide, Event Log, Settings and Sources screens, linkage message and storm overlay, acknowledgment tracking.

**Could have:**
- Mars awareness panel, export, accessibility extras, Bangla toggle, live fetching with fallback.

**Not now:**
- Real wearables or dosimeter integration, cloud sync, accounts, mobile apps, or a clinical claim of any kind.

### G.2 Suggested technical approach (Sobuj decides)
- A web app that runs in a browser, using saved JSON files as the data source.
- Charts library for flux and trend lines; local storage for check-ins; a service worker for offline use.
- A small, separate "severity engine" module with tests, so the logic is inspectable.
- A data folder with a README listing each file's source, date range, and download time.

### G.3 Testing and validation (lifts your Validity score)
- Run 3-5 historical events through the engine and compare the result with the NOAA S-level recorded for each. Put the table in the repository.
- Test with missing and bad data.
- Test on a phone-sized screen and in high-contrast mode.

### G.4 What the NASA project page needs
- High-level summary, demo video, final project link, and project details covering why/what/how, community involvement, and tools.
- **Use of AI:** every tool named, with prompts and reasoning.
- **NASA data sources used:** every dataset, what you used it for, and how. Judges check this against your claims.
- References, a public repository, and every team member listed with roles.

### G.5 How features map to the judging criteria
- **Relevance:** real NOAA and DONKI data at the core, gather/evaluate/act clearly visible.
- **Validity:** the "Why" panel, cited thresholds, the historical-event table.
- **Creativity:** storm-to-health linkage, replay mode.
- **Impact:** autonomy for delayed-communication missions.
- **Presentation:** the 2-minute demo flow in Part F.
- **User experience:** calm alert screen, icons plus words, large text.
- **NASA data usage:** multiple sources, clearly shown.

---

## Part H. Boundaries, ethics and wording

**The app is not:**
- A medical device or diagnostic tool.
- A real astronaut data system.
- An official NASA or NOAA alert system.

**Suggested disclaimer text for the app:**
> "Storm Shield is a student prototype for the NASA Space Apps Challenge. Health and exposure values are simulated. Space weather data comes from NOAA SWPC and NASA CCMC DONKI and is for research and demonstration only. This app does not diagnose or replace official alerts or medical advice."

**Credits to display:** NASA CCMC DONKI, NOAA Space Weather Prediction Center, NASA Human Research Program, NASA-STD-3001, and an AI-use statement.

---

## Sources

- [S3] NOAA SWPC, NOAA Space Weather Scales (spaceweather.gov)
- [S3b] NOAA SWPC GOES proton flux product page (spaceweather.gov/products/goes-proton-flux): 5-minute proton flux, alert thresholds at 10 / 100 / 1,000 / 10,000 / 100,000 pfu matching the S-scale, JSON data at services.swpc.noaa.gov/json/goes/, and the note that solar particle events result from fast CMEs.
- [S4] NASA-STD-3001 Technical Brief on radiation protection (NASA OCHMO)
- [S5] NASA NTRS paper on solar particle event mitigation (short-term 250 mSv)
- [S7] Acute Radiation Risks Tool paper, doi 10.1002/essoar.10503672.1
- [S9] NASA NTRS 20190025247, "Crew Health in the Exo-LEO Era"
- [S16] NASA CCMC DONKI system page: ccmc.gsfc.nasa.gov/tools/DONKI
- [S17] CCMC announcements: ccmc.gsfc.nasa.gov/news/major-updates/
- [S20] NOAA planetary K-index feed address (services.swpc.noaa.gov/products/noaa-planetary-k-index.json), as listed by a third-party tool documenting NOAA's public endpoints. **[CHECK]** directly with NOAA.
