# Storm Shield Data Provenance & Pipeline

**Team Extokened · NASA Space Apps Challenge 2026**

This directory contains the space-weather, dosimetry, and astronaut physiological baseline datasets used by Storm Shield. In strict compliance with the project guidelines, all data carries a clear provenance label:

- **`REAL`**: Public measured telemetry from NASA CCMC / DONKI (solar particle events, flares, CMEs, shocks, notifications), NOAA SWPC (proton flux, alerts), or NASA OSDR RadLab.
- **`PUBLISHED`**: Exact clinical reference thresholds and guidelines published by CDC, NIH MedlinePlus, or NASA standards (e.g. NASA-STD-3001).
- **`ANCHORED`**: Synthetic astronaut profiles strictly generated within physiological bounds established by peer-reviewed human spaceflight publications (all personal astronaut biometrics are simulated; real astronaut medical data is private).
- **`ILLUSTRATIVE`**: Placeholder metrics (zero instances in production demo build).

---

## Provenance Table

| Dataset / File | Provenance | Source ID | Publisher & Reference | License & Usage |
|---|---|---|---|---|
| `data/processed/storm-replay.json` | `REAL` | `noaa-swpc-scales` | NOAA Space Weather Prediction Center (GOES-16 >10 MeV Proton Flux) | Public Domain (U.S. Govt) |
| `src/content/sources.json` | `PUBLISHED` | Multiple | Master citation registry for CDC, NASA, WHO, and NIH publications | Open / CC BY-NC-SA / Public Domain |
| `src/content/indicators.json` | `PUBLISHED` | `nasa-std-3001` / `nasa-hrp-cardio` | NASA Spaceflight Human-System Standards Vol 1 | NASA Open Work |
| `src/content/regions.json` | `PUBLISHED` | `nasa-eimo-2025` | NASA Earth-Independent Medical Operations (NTRS 20250000009) | NASA Open Work |
| `src/content/crew.json` | `ANCHORED` | `nasa-hrp-cardio` / `radlab-iss-2025` | Fictional profiles with baselines anchored inside real flight ranges | Project Generated |
| `src/content/kit.json` | `PUBLISHED` | `cdc-ars-clinicians` / `nih-heart-firstaid` | Spaceflight exploration medical kit inventory and cautions | Public Clinical Guidance |
| `src/content/scenarios/cardio.json` | `PUBLISHED` | `nih-heart-firstaid` | MedlinePlus & NHLBI Acute Angina and Chest Pain algorithms | Public Domain (U.S. Govt) |
| `src/content/scenarios/post-storm.json` | `PUBLISHED` | `cdc-ars-clinicians` / `cdc-triage-2006` | CDC Acute Radiation Syndrome Fact Sheet & REMM Triage | Public Domain (U.S. Govt) |

---

## Data Pipeline

1. **Space Weather:** Raw satellite telemetry from NOAA SWPC and NASA DONKI is parsed to extract energetic proton flux (pfu for $\ge 10\text{ MeV}$).
2. **Threshold Conversion:** Engine module `storm.js` maps flux to NOAA S1 through S5 scales.
3. **Clinical Guardrails:** Radiation dosages are cross-referenced with CDC whole-body acute radiation sickness thresholds ($\ge 700\text{ mGy}$ for prodrome) to prevent misdiagnosis.
