# Storm Shield: Roadmap v3

**Team Extokened (Yarin + Sobuj) · Written Sunday 8 November 2026**
This file **replaces** the earlier roadmap files. Personal task lists are in **Yarin-Work-Plan.md** and **Sobuj-Work-Plan.md**. The resource list is in **Storm-Shield-Resource-Guide.md**.

> **[VERIFY]** = could not confirm. Dates come from the Bangladesh Participants Guide and may shift: confirm with your Local Lead.

---

## 1. What changed since the last version

1. **Retrace mode** added (the fill-in "something unexpected happened" form).
2. **Real data first.** Every number is tagged REAL, PUBLISHED, ANCHORED, or ILLUSTRATIVE, with a goal of **zero ILLUSTRATIVE** in the demo.
3. **Legal citing.** Every source is recorded with its license; we paraphrase instead of copying.
4. **Scenario B corrected.** Radiation sickness needs a large dose, so the scenario first checks dose evidence and other causes. This came from CDC material.
5. **Reviewer sign-off enforced** by the build, not just promised.
6. **Roles separated** into two work plans.

## 2. Key dates

| When | What |
|---|---|
| Sun 8 Nov | Today: decisions, admin, research starts |
| Thu 12 Nov, noon | **Feature freeze** |
| Fri 13 Nov, 7:00 AM | Hackathon day 1 (Bangladesh) |
| Fri 13 Nov, 6:30 PM | **Video 2** (240 s, with working demo) [VERIFY] |
| Sat 14 Nov | Day 2: NASA page submitted; 30 s video (9:00 AM or 12:00 PM [VERIFY]); local judging from 11:00 AM |
| Sun 15 Nov | Buffer; global window closes (US Eastern) |
| Mon 16 Nov | Local winners announced |

## 3. Scope (fixed)

**P0, must ship by Friday evening**
1. Storm Alert with a real saved event replay, "Why this alert?", and the Body Check prompt
2. Crew profiles (3 fictional, ANCHORED baselines)
3. Clickable Health Twin with region panels
4. Vitals entry (blood pressure, heart rate, blood sugar, temperature, sleep, mood, symptoms)
5. Assessment engine (baseline first)
6. Care Mode: Scenario A and Scenario B
7. Retrace (generic ladder, red-flag panel, action review, timeline)
8. Ground-link switch and handoff log
9. Medical kit screen with kit-aware steps
10. Charts, colour + icon + words, provenance badges, Data & Sources screen
11. Public repo, README, live link

**P1, only after P0 is solid (Thursday noon check):** drill mode, measurement guides, environment selector, routine prompts, exposure view, accessibility.
**P2:** more scenarios, camera logging, gamification extras, Bangla toggle, live fetch.

**Cut rule:** anything unfinished at Thursday noon is cut.

## 4. Shared timeline (who does what is in the personal plans)

### Sunday 8 Nov (today)
- **Both:** agree the scope; confirm roles; message the mentor (Nishat Mushfiqua) and the Local Lead; ask the mentor about a **medical reviewer**; confirm the written permission for pre-event work.
- **Yarin:** open the Resources tab and the video; start the source pack; start `sources.json`.
- **Sobuj:** fix registration and name spelling; scaffold the repo and deploy an empty page; start the body twin shell.
- **End of day check:** repo live, sources list started, reviewer asked.

### Monday 9 Nov
- **Yarin:** finish the source pack; write `indicators.json`, `regions.json`; draft Scenario A.
- **Sobuj:** vitals entry; baseline and assessment engine with tests; crew generator (ANCHORED).
- **Evening:** mentor call 1.
- **End of day check:** engine tests pass; Scenario A draft exists with sources.

### Tuesday 10 Nov
- **Yarin:** draft Scenario B (with the dose check); write the kit list; write Retrace content (red-flag list, ladder text, kit cautions); process the storm data.
- **Sobuj:** storm replay and alert screen; Care Mode engine with Scenario A; kit screen.
- **End of day check:** storm replay works end to end; Care Mode runs Scenario A.

### Wednesday 11 Nov
- **Yarin:** **medical reviewer session**; fix all feedback; finalise `sources.json`; draft README, NASA page text, references.
- **Sobuj:** Scenario B; timers; handoff log; ground-link switch; Retrace; provenance checks.
- **Both:** first full timed demo.
- **Evening:** mentor review 2.
- **End of day check:** all P0 features present (even if rough); reviewer sign-offs in.

### Thursday 12 Nov
- **Noon: feature freeze.**
- **Both:** test every path on the deployed link (private window, phone, mobile data); record a backup demo; rehearse Video 2; prepare subtitles.
- **Yarin:** final script; updated pitch deck; credits and AI-use log.
- **Sobuj:** bug fixes only; final deployment; repo clean-up.
- **Pack and sleep.**

### Friday 13 Nov (hackathon day 1)
- Follow the Local Lead's agenda. Confirm NASA team page and roles. Record and upload **Video 2 before 6:30 PM**. Start the NASA project page.

### Saturday 14 Nov (hackathon day 2)
- Finish and **submit** the NASA project page. Upload the 30 s video. Present at local judging (11:00 AM). Closing ceremony.

### Sunday 15 Nov
- Re-check every link in a private window. Back up the repo.

## 5. Quality gates (do not skip)

| Gate | When | Check |
|---|---|---|
| Provenance | Wednesday | No value without a source id; no ILLUSTRATIVE in the demo path |
| Sign-off | Wednesday | Every demo scenario step has a reviewer |
| Licensing | Wednesday | Every source has a license row and was paraphrased, not copied |
| Demo | Wednesday and Thursday | Full demo runs in under 2 minutes with no errors |
| Links | Thursday and Saturday | Repo, video, and live app open in a private window |

## 6. Admin checklist

- [ ] Sobuj's NASA registration confirmed for Dhaka (no "Award Ineligible" warning)
- [ ] One NASA team page named Extokened with exactly two members; names spelled consistently
- [ ] Bangladesh form links to the correct public repo
- [ ] Space Apps Connect account; Global Offers available from 13 Nov
- [ ] NASA Earthdata account
- [ ] Written permission for pre-event work saved
- [ ] Mentor sessions booked (Monday, Wednesday, Thursday rehearsal)
- [ ] Medical reviewer booked for Wednesday
- [ ] Devices, chargers, mobile data, VPN tested

## 7. Videos

**Video 2 (240 s):** team and members → problem + the challenge statement → solution → **live demo** → NASA data named aloud (and the sources behind the guidance) → safety design and limits → AI use and credits. English subtitles; credit all assets; no under-18s.
**Video 3 (30 s):** problem and team → solution → fast demo → data and impact.

**Demo path (about 2 minutes):**
1. Overview, crew tabs, ground link = Unavailable.
2. Click a body region: baseline vs now.
3. Storm replay: alert, Body Check prompt.
4. Scenario B: dose check, steps from the kit, timer.
5. Scenario A: first response, monitoring.
6. **Retrace:** enter an unplanned event, show the timeline, red-flag panel, and next safest steps.
7. Handoff screen; flip ground link to Available.
8. Data & Sources: provenance badges.

## 8. NASA project page checklist

Members tab with photos and roles · team photo · challenge category · high-level summary (with video and GitHub links) · 30 s demo video · final project link · three project-detail blocks · **Use of AI** (every tool, prompts, what you changed) · **NASA data sources** (each dataset, what for, how) · references · public repo · **click Submit.**

## 9. Judge questions (updated)

1. **"Is this safe without a doctor?"** It is for when no doctor can be reached. Steps come from published sources, are reviewed, are low-risk first, show uncertainty, and are logged for the doctor. It is a prototype, not clinically validated.
2. **"NASA is already researching this."** Yes, which shows the need. We built a student prototype with a personalised body twin, a storm alert, supply-aware care, and Retrace.
3. **"What is real and what is simulated?"** Storm and radiation data are real; medical facts are published; crew values are anchored to cited ranges. Every number is labelled.
4. **"What is Retrace?"** A fill-in mode for the unexpected that rebuilds the timeline and suggests the lowest-loss next steps, always labelled low confidence.
5. **"How did you check the medical content?"** Public sources, a medical reviewer, and a build that blocks unreviewed steps.

## 10. Risks

| Risk | Response |
|---|---|
| No medical reviewer | Ask the mentor today; if none, say so clearly and keep steps to widely published first-aid guidance |
| Too much for two | Fixed scope, build order, Thursday cut |
| Data sites blocked | Bundled files, no live fetch |
| Over-claiming | Use the wording rules: assessment, guidance, decision support, prototype |
| Live demo fails | Backup recording |
