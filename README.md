# Storm Shield

**Solar storm warnings and health monitoring for astronauts beyond low Earth orbit**

Team Extokened · NASA Space Apps Challenge 2026 (Bangladesh) · Theme: The Next Frontier
Challenge: **Create Health Monitoring Software for Astronauts on Space Missions**

> **Status: concept stage.** This repository currently holds our concept materials. The working prototype will be built at the hackathon (13-14 November 2026) and committed here as open source.

## The idea

On long missions to the Moon and Mars, communication delays mean astronauts cannot always rely on real-time help from Earth. Storm Shield is a crew-facing app with two linked parts:

1. **Storm Alert (our main focus).** Reads space weather data, rates the severity of an incoming solar storm on three crew levels (Watch, Warning, Shelter now), and tells the crew exactly what to do, with onset, intensity and duration.
2. **Crew Health Copilot (the challenge's core).** Gathers health indicators (sleep, heart rate, exercise, mood, radiation exposure), compares each astronaut with their own baseline, and shows Normal / Watch / Act with next steps.

After a storm, the copilot reads the crew's indicators in context and prompts a check-in. The app supports decisions and does **not** diagnose.

## Data (planned)

- **NASA CCMC DONKI:** solar particle events, flares, CMEs, interplanetary shocks, notifications.
- **NOAA Space Weather Prediction Center:** proton flux, alerts, and the NOAA Solar Radiation Storm Scale (S1-S5), adapted into our three crew levels.
- **References:** NASA Human Research Program and NASA-STD-3001 (crew radiation exposure limits).
- **Simulated:** all astronaut health readings and exposure values. Real astronaut data is not public.

## Planned build (hackathon)

- Saved real space weather data bundled with the app, so it works offline
- Severity engine with a "Why this alert?" explanation
- Alert screen, crew dashboard with personal baselines, daily check-in, exposure view
- Replay of a real past solar particle event

## What is in this repository

- `docs/concept-note.md`: the concept in one page
- `docs/implementation-plan.md`: how we will build it at the hackathon
- `docs/product-spec.md`: screens, features, data sources and logic
- `docs/Storm-Shield-Pitch-Deck.pptx` and `.pdf`: the pitch deck
- `data/`: saved space weather samples (to be added)
- `src/`: application code (to be added at the hackathon)

## Team

- Qazi Ferdowsi Jahan Yarin: research and presentation
- Kazi Sajidul Islam Sobuj: software development

Both of us are 2nd-year students at Daffodil International University, Bangladesh.

## Use of AI

We used Claude (Anthropic) for brainstorming, research support, and drafting our slides and documents. We reviewed, edited and chose everything ourselves. We will list every AI tool and prompt used in the build on our NASA project page.

## Credits and disclaimer

Data and references: NASA CCMC DONKI, NOAA Space Weather Prediction Center, NASA Human Research Program, NASA-STD-3001.

Storm Shield is a student prototype. Health and exposure values are simulated. It does not diagnose or replace official space weather alerts or medical advice.

## License

MIT. See [LICENSE](LICENSE).
