# Implementation Plan: Storm Shield (hackathon, Nov 13-14)

**Architecture (simple, buildable in two days)**
1. **Data layer:** a space weather feed from NASA DONKI where access works, with NOAA SWPC public data as a fallback. After Oct 28, add whichever datasets the official statement lists.
2. **Severity engine:** a rule-based mapping from event data to Watch / Warning / Shelter now, based on the NOAA S-scale thresholds.
3. **Health simulator:** generates realistic crew data (sleep, heart rate, mood, exercise, exposure) for a few astronauts, with some deliberate changes to show the alerts working.
4. **Baseline engine:** a rolling average per astronaut, flagging deviations as Normal / Watch / Act.
5. **Exposure tracker:** a running cumulative estimate, shown against the NASA-STD-3001 reference limits. It is a simplified educational model, labelled as such.
6. **Interface:** a web app with a full-screen storm alert view and a crew dashboard. It should work offline, to match a spacecraft with no reliable link to Earth.
7. **Demo scenario:** replay a past major solar storm and show the alert, the exposure update, and the copilot's check-in prompt in sequence.

**Who does what**
- **Kazi Sajidul Islam Sobuj:** builds the app (using AI tools, documented on the project page).
- **Qazi Ferdowsi Jahan Yarin:** research and validation (sources for every threshold, the references list, the Validity story), plus alert wording and crew guidance text, the demo script, and the presentation.

**Timeline**
- **Oct 28:** read the full challenge statement and choose the final datasets.
- **Before Nov 13:** set up a public GitHub repo, a NASA Earthdata account, and the app skeleton; download datasets for offline use.
- **Nov 13-14:** build the demo, record the 240-second and 30-second videos, and complete the NASA project page (summary, data used, AI use, references).

**Risks and answers**
- **Data access problems:** use a fallback feed, and always state clearly which data is real and which is simulated.
- **Medical overclaiming:** present it as decision support, cite every threshold, and avoid diagnosis language.
- **Dose-model realism:** keep the model simple, label it educational, and cite NASA-STD-3001 only for the limits.

**Mapped to the judging criteria**
- **Relevance:** NASA space weather and NASA standards sit at the core.
- **Validity:** every threshold has a source.
- **Impact and Creativity:** linking solar storms to individual crew health is the distinctive idea.
- **Presentation:** one clear story, "one storm, one decision."
