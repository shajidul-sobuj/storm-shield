# Storm Shield — Video Production Plan & Technical Execution Guide
**NASA Space Apps Challenge 2026 · Video 2 (Strict 228-Second Production)**

---

## 1. Production Architecture & Toolchain

```
                               ┌────────────────────────────────┐
                               │  STORM SHIELD VIDEO PIPELINE   │
                               └────────────────┬───────────────┘
                                                │
         ┌────────────────────────┬─────────────┴─────────────┬────────────────────────┐
         ▼                        ▼                           ▼                        ▼
 ┌───────────────┐        ┌───────────────┐           ┌───────────────┐        ┌───────────────┐
 │ UI & DATA CAP │        │ CINEMATICS    │           │ VOICEOVER     │        │ AUDIO & SFX   │
 ├───────────────┤        ├───────────────┤           ├───────────────┤        ├───────────────┤
 │ • Playwright  │        │ • NASA SDO &  │           │ • Professional│        │ • Web Audio   │
 │   1080p video │          Artemis Media │             voice engine  │          siren audio   │
 │ • Real React  │        │ • High-res 3D │           │ • 124 wpm pace│        │ • Orchestral/ │
 │   Screencasts │          CGI renders   │           │ • 471 words   │          hybrid score  │
 └───────┬───────┘        └───────┬───────┘           └───────┬───────┘        └───────┬───────┘
         │                        │                           │                        │
         └────────────────────────┼───────────────────────────┴────────────────────────┘
                                  ▼
                   ┌─────────────────────────────┐
                   │ REMOTION COMPOSITION ENGINE │
                   │  (1920x1080 @ 30 FPS, 228s) │
                   └──────────────┬──────────────┘
                                  ▼
                   ┌─────────────────────────────┐
                   │   FFMPEG ENCODING ENGINE    │
                   │ (H.264 / AAC / FFprobe QA)  │
                   └──────────────┬──────────────┘
                                  ▼
                   ┌─────────────────────────────┐
                   │    FINAL VERIFIED MP4       │
                   │    (Duration <= 230.0s)     │
                   └─────────────────────────────┘
```

---

## 2. Authentic Website Recording Plan (Screen Captures)

All product demonstrations must use the actual Storm Shield application running locally on `http://127.0.0.1:5173/`:

| Scene | Target Component / UI Screen | Action / Interaction to Record | Capture Duration |
|---|---|---|---|
| **S09** | `StormTab.jsx` / Overview Header | Click NASA DONKI live API status badge; scrub May 2024 GOES-16 solar storm timeline slider from S0 Quiet to S3 Strong ($4,200\text{ pfu}$) | 18.0s |
| **S10** | Storm Shelter Calculator Card | Highlight the Artemis I Orion dose attenuation formula ($\sim 4.0\times$ dose reduction, $140\text{ mGy} \to 35\text{ mGy}$) | 10.0s |
| **S11** | `HealthTwin.jsx` / Region Drawer | Click the Cardiovascular (Heart) anatomical zone on the SVG silhouette; open diagnostic drawer comparing Alex Vance's baseline against current readings | 8.0s |
| **S12** | `mockBioMonitor.js` + `CrewAlertModal.jsx` | Trigger simulated wearable anomaly tick stream; demonstrate persistence rule ($N=3$) firing; show dual-tab `BroadcastChannel` alert with "On my way" acknowledgment | 10.0s |
| **S13** | `CareMode.jsx` + `HandoffTab.jsx` | Advance through Scenario A to the Aspirin step; demonstrate the automatic red allergy block; click through to view the 30-second flight surgeon handoff brief | 11.0s |

---

## 3. NASA Dataset Visualization Plan

The 5 official datasets spoken aloud will be visually anchored with authentic scientific telemetry:
1. **NASA CCMC DONKI:** Live JSON response visual, showing Solar Energetic Particle (SEP) alerts and the official `api.nasa.gov/DONKI` URL badge.
2. **NOAA SWPC GOES-16 Proton Flux:** High-resolution energetic proton flux curve showing the dramatic flux jump past $10\text{ MeV}$ during the solar particle event.
3. **NASA OSDR RadLab Database:** Visual reference to ionizing radiation background absorbed dose baseline tables.
4. **Artemis I Orion Radiation Measurements (*Nature* 2024):** Visual schematic of the Orion crew module showing the water wall storm shelter and measured dosimetric attenuation.
5. **NASA Space Flight Human-System Standard 3001:** Reference boundary indicators on blood pressure, heart rate, and acute radiation dose thresholds ($\ge 700\text{ mGy}$).

---

## 4. Voiceover & Audio Production

### Voiceover Direction
- **Script Length:** Exactly 471 words.
- **Duration:** 228.0 seconds total.
- **Cadence:** 124 words per minute with deliberate dramatic pauses at 00:15, 01:18, and 03:32.
- **Voice Options:**
  - *Option A (Local / Zero-Cost):* High-quality neural TTS engines (e.g. Edge TTS / Kokoro / ElevenLabs API where key is provided).
  - *Option B (Human Team Voice):* Team member audio recording following the exact phonetics and timestamps.
- **Audio Mixing Specifications:**
  - Dialogue Master: -14 LUFS integrated loudness.
  - Narration EQ: Low cut at 80Hz, presence boost around 3.5kHz.
  - Background Music: Ducked to -24 dB during speech; rises to -12 dB during visual transitions and the final outro.
  - Sound Effects: Sub-bass impacts limited to -6 dB, crisp interface clicks at -16 dB.

---

## 5. Feasibility, Dependencies & Limitations

### 5.1. Tool Dependencies & Disclosures
- **Remotion:** Pure React-based video editing framework. Runs locally on Node.js. Zero cost, no external subscription required.
- **FFmpeg & FFprobe:** Installed locally on Linux. Zero cost, standard open-source multimedia processor used for clip concatenation, audio mixing, and exact duration verification.
- **Playwright:** Installed in project environment. Used to automate 1920x1080 60fps screen recordings of the React development server (`http://127.0.0.1:5173/`).
- **External Paid Video AI Platforms (Google Veo, Runway, Kling):**
  - *Disclosure:* These platforms require paid subscriptions or external API credits.
  - *Practical High-Fidelity Alternative:* We utilize authentic NASA and NOAA public domain footage (NASA Scientific Visualization Studio, SDO solar flare captures, Artemis I Orion onboard cameras, CSA Bio-Monitor documentation) combined with Remotion-rendered motion graphics and Playwright screencasts. This produces a 100% authentic, scientifically verified presentation without subscription dependencies.

---

## 6. Pre-Production Quality Checklist

- [x] Exact project name confirmed: **Storm Shield**
- [x] Official challenge name confirmed: **Create Health Monitoring Software for Astronauts on Space Missions**
- [x] Team name confirmed: **Team Extokened**
- [x] Full team names included: **Sajidul Islam Sobuj & Yarin**
- [x] Strong opening hook within first 15 seconds (00:00–00:15)
- [x] Target duration: **228.0 seconds** (Strictly within 230.0s maximum limit)
- [x] Official NASA datasets spoken aloud in voiceover (5 datasets)
- [x] Verified data points included (4,000x proton flux surge, 22-min radio delay, 4x Orion shelter attenuation, 44 unit tests)
- [x] 100% real prototype features demonstrated (Health Twin, Bio-Monitor persistence, allergy lock, multi-tab alerts, 30s handoff)
- [x] Complete timestamped storyboard and shot list drafted
