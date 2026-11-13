# Storm Shield: Application Source Code

This directory contains the production source code for Storm Shield, built for the NASA Space Apps Challenge 2026.

## Architecture

- **`engine/`**: Pure, deterministic, zero-dependency clinical decision support and space-weather analysis engines.
  - `baseline.js`: Compares telemetry against individual astronaut baselines.
  - `assess.js`: Multi-factor nominal / watch / act assessment.
  - `storm.js`: NOAA Space Weather Radiation Storm Scale (S1-S5) and Artemis I shelter attenuation model.
  - `care.js`: Supply-aware clinical stepper for acute spaceflight scenarios.
  - `retrace.js`: Red-flag primary survey (ABCDE) and 6-tier loss-minimising priority ladder.
  - `handoff.js`: 30-second flight surgeon briefing generator.
  - `alerts.js`: Multi-tab synchronized BroadcastChannel crew broadcast and check-in timer.
  - `anomaly.js`: Statistical anomaly detector enforcing the V4 Persistence Rule ($N=3$).

- **`content/`**: Verified, scientifically cited datasets with complete provenance tracking.
  - `crew.json`: Astronaut profiles with personalized baselines and allergy contraindications.
  - `sources.json`: Master scientific citation registry (CDC, NASA, NOAA, WHO, NIH).
  - `indicators.json`: NASA-STD-3001 clinical indicators and operational boundaries.
  - `regions.json`: 8 anatomical regions mapped to spaceflight hazards.
  - `kit.json`: Exploration medical kit inventory and supply tracking.
  - `scenarios/`: Acute clinical decision trees (`cardio.json`, `post-storm.json`).

- **`device/`**: Wearable sensor stream adapter simulating the Canadian Space Agency (CSA) Bio-Monitor.
  - `adapter.js`: Sensor packet normalization and anomaly detector interface.
  - `mockBioMonitor.js`: 1.5-second live physiological telemetry stream with judge-triggerable drift.

- **`assistant/`**: Flight-guided procedural assistant.
  - `commands.js`: Voice command parser (hands-free procedure advancement).
  - `answer.js`: Grounded procedural Q&A and emergency phrase interception.
  - `speak.js` & `listen.js`: Web Speech API voice interface.

- **`ui/`**: Modular, accessible React HUD components and interactive visualizations.
  - `Overview.jsx`: Mission status, smart vest telemetry ribbon, and clinical indicators.
  - `HealthTwin.jsx`: Interactive vector silhouette with clickable anatomical zones.
  - `StormMonitor.jsx`: 5-phase mission storyline, Artemis I 4.0x attenuation infographic, and SPE replay.
  - `LiveTelemetryDeck.jsx`: Interactive physiological sliders, clinical presets, and Lead II ECG sweep canvas.
  - `CareMode.jsx`: Supply-aware step-by-step clinical protocol stepper.
  - `RetraceMode.jsx`: Off-script emergency solver with allergy conflict detection.
  - `CrewAlertModal.jsx`: Multi-crew emergency broadcast modal.
  - `HandoffScreen.jsx`: 30-second flight surgeon medical handoff briefing.
  - `MedicalKit.jsx`: Onboard medical inventory viewer.
  - `SourcesScreen.jsx`: Provenance audit portal.

- **`tests/`**: Automated Vitest test suites verifying clinical rules, triage boundaries, and data integrity (44/44 passing).
