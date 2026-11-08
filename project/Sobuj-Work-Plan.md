# Sobuj's Work Plan

**Role: software development (using AI tools, documented), data pipeline, testing, and deployment**
Team Extokened · 8-15 November 2026
Companion files: **Storm-Shield-Implementation-Idea.md** (architecture and formats), **Storm-Shield-Roadmap-v3.md** (shared timeline), **Yarin-Work-Plan.md** (the content you load).

> You own **the code, the data pipeline, the tests, and the live link.** Yarin owns the content files in `src/content/`. Don't write medical content yourself. Load it from the JSON.

---

## Your deliverables (the full list)

1. **Repo and deployment:** public repo (`storm-shield`), MIT license, folder layout, a live link that stays up
2. **App shell:** crew tabs, ground-link switch, storm badge, provenance badges
3. **Health Twin:** clickable SVG body with 8 regions and region panels
4. **Vitals entry** for the six indicators plus symptoms
5. **Engine:** `baseline.js`, `assess.js`, `storm.js`, `care.js`, `retrace.js`, `handoff.js`, all unit-tested
6. **Storm Monitor, replay, and Alert screen** with the Body Check prompt
7. **Care Mode** for Scenario A and Scenario B (decision-tree runner, timers, log)
8. **Retrace** (form, red-flag panel, action review, timeline, loss-ladder steps)
9. **Medical kit screen** and kit-aware steps
10. **Handoff screen**
11. **Charts** with baseline bands and storm markers
12. **Data & Sources screen** and **provenance/sign-off/license checks**
13. **Data pipeline** scripts (raw → processed), crew generator (ANCHORED)
14. **Tests, backup demo recording, mobile and accessibility checks**
15. **AI-use log for code**

---

## Day by day

### Sunday 8 Nov
- [ ] **Fix registration:** confirm you're registered for the **Dhaka** event; clear the "waitlisted" status; ask the Local Lead if needed. Make your **name spelling** match across the NASA profile, local form, repo, and slides (Sajidul vs Shajidul).
- [ ] Confirm you are on the **NASA team page** (one team, Extokened, two members).
- [ ] Scaffold the repo with the layout in the Implementation Idea; add LICENSE (MIT) and README placeholder.
- [ ] **Deploy an empty page** to the live link so the pipeline works.
- [ ] Build the **app shell**: crew tabs (3 placeholders), top bar with storm badge, ground-link switch (Available / Delayed / Unavailable).
- [ ] Start the **body figure shell**: an SVG with 8 clickable regions and an empty panel.
- [ ] Start your **AI-use log** (tool, what you asked, what you changed).

### Monday 9 Nov
- [ ] Build **vitals entry** (blood pressure systolic/diastolic, heart rate, blood sugar mg/dL, temperature, sleep hours, mood 1-5, symptoms).
- [ ] Write `baseline.js` and `assess.js`: compare with the person's baseline, then general ranges; return status, reason, confidence, unknowns. **Write a test for each rule.**
- [ ] Write the **crew generator**: reads `crew.json`, produces a 14-day history inside the given ranges, tags every value `ANCHORED` with its source id.
- [ ] Build the **region panel** (baseline vs now, status, why, guidance, "Something's wrong here").
- [ ] Add **colour + icon + words** for statuses.
- [ ] **Evening:** attend the mentor call if you can.
- [ ] End of day: tests pass; the twin shows personalised status for 3 crew.

### Tuesday 10 Nov
- [ ] Download or receive the **storm data** (DONKI, NOAA; use a US VPN if needed). Write the **processing script** (raw → processed). Log files in `data/README.md`.
- [ ] Write `storm.js` (map flux and events to Quiet / Watch / Warning / Shelter now).
- [ ] Build the **Storm Monitor** (flux chart with S-level lines), **replay controls**, and the **Alert screen** (level, steps, onset, intensity, duration, "Why this alert?", acknowledgments).
- [ ] Build the **Body Check prompt** that opens after Warning or Shelter now and links to vitals entry and Care Mode.
- [ ] Write `care.js`: a decision-tree runner (First Response card, triage questions, vitals capture, rules, steps, `needsKit` greying, timers, log).
- [ ] Load **Scenario A** from Yarin's JSON and run it end to end.
- [ ] Build the **Medical Kit** screen from `kit.json`.
- [ ] End of day: storm replay works; Care Mode runs Scenario A.

### Wednesday 11 Nov
- [ ] Load **Scenario B** (it opens with the dose check and other causes); add the **time capture** (storm start, symptom start, vomiting start).
- [ ] Add **recheck timers** and the **handoff log** (`handoff.js`) and the **Handoff screen**.
- [ ] Build **Retrace** (`retrace.js`): the form, the red-flag panel, closest-scenario match, action review against kit cautions and crew allergies, the loss-minimising step ladder, the rebuilt timeline, and the low-confidence label.
- [ ] Build the **trend charts** with baseline bands and storm markers.
- [ ] Add the **checks** (scripts or tests):
  - [ ] No value without a `source` id.
  - [ ] No `ILLUSTRATIVE` value in the demo path.
  - [ ] No scenario step without `reviewedBy` in the demo build.
  - [ ] Every source has a license row.
- [ ] Build the **Data & Sources** screen with provenance badges.
- [ ] Join Yarin for the **first timed demo run** (target under 2 minutes).
- [ ] **Evening:** mentor review 2.
- [ ] End of day: every P0 feature exists, even if rough.

### Thursday 12 Nov
- [ ] **Noon: feature freeze.** Only bug fixes after this.
- [ ] Test the full demo path on the **deployed link**: in a private window, on a phone-size screen, on mobile data.
- [ ] Fix layout and contrast problems; add large-text and high-contrast mode if time allows.
- [ ] **Record a backup screen recording** of the full demo.
- [ ] Clean the repo: remove secrets and unused files; make the README accurate; verify the LICENSE; keep commit history honest.
- [ ] Final deployment. Save the live link.
- [ ] Pack: laptop, chargers, power bank, mobile data, VPN, a second device with the data files.

### Friday 13 Nov
- [ ] Confirm your NASA registration and team page.
- [ ] Be ready to **screen-record the live demo** for Video 2 (Yarin narrates, or you record while Yarin presents).
- [ ] Fix only critical bugs.
- [ ] Help with the NASA project page: tools and technologies, AI use for code, data sources, GitHub link.

### Saturday 14 Nov
- [ ] Support the 30 s video recording.
- [ ] Keep the live link and repo public and working.
- [ ] Be available during local judging for technical questions.

### Sunday 15 Nov
- [ ] Re-check the live link and repo in a private window; back up the repo.

---

## Engineering rules you follow
- **Engine separate from UI.** Every rule has a unit test.
- **Content comes from JSON.** Don't write medical text in code.
- **No live fetching at the event.** Bundle everything; live fetch is optional with a fallback.
- **Show provenance badges** on every number.
- **Mark simulated/anchored data clearly** in the UI.
- **Commit often** with clear messages. Note in the README what existed before 13 Nov.
- **Log AI tool use** (tool, prompt purpose, what you changed or checked).
- **Credit libraries, fonts, and icons** with their licenses.
- **Accessibility basics:** colour plus icon plus words, large text, keyboard use, labels.

## If you fall behind (cut order, from the bottom)
1. Charts extras and polish
2. Medical kit greying (keep the list)
3. Retrace's closest-scenario match (keep the red-flag panel, timeline, and ladder)
4. Handoff export (keep the on-screen summary)
5. Scenario B (keep Scenario A and the storm alert)

**Never cut:** the Storm Alert, the Health Twin, Scenario A, the provenance badges, the disclaimers, or the live link.
