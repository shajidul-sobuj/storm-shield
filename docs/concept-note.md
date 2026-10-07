# Concept Note: Storm Shield

**Project:** Storm Shield, an early-warning system and health copilot for astronauts.

**The problem.** Long missions to the Moon and Mars expose astronauts to radiation, isolation, altered gravity, and a closed environment. Far from Earth, with communication delays of minutes, crews carry much of the responsibility for noticing changes in their own health.

**Our concept.** Storm Shield has two linked parts:
1. **Storm Alert (our focus).** It reads space weather events (flares, coronal mass ejections, solar particle events, geomagnetic storms), rates their severity on three levels (Watch, Warning, Shelter now) adapted from NOAA's Solar Radiation Storm Scale, and gives the crew a clear alert with shelter and activity guidance.
2. **Crew Health Copilot (the challenge's core).** It gathers health indicators (sleep, heart rate, exercise, mood check-ins, radiation exposure), compares each astronaut with their own baseline, and shows Normal / Watch / Act status with next steps.

**How it answers the challenge.** It follows gather, evaluate, act. The storm alert adds context: after a storm, the copilot reads the crew's indicators together, for example "exposure up, sleep down, schedule a check-in."

**Data and references.** NASA DONKI (planned space weather source), NOAA SWPC Space Weather Scales, NASA Human Research Program, and NASA-STD-3001 Vol. 1 (career limit 600 mSv, solar particle event short-term limit 250 mSv).

**What is simulated.** Astronaut health readings and exposure values are simulated. The app supports decisions and does not diagnose.

**Who benefits.** Moon and Mars crews, mission planners, ground medical teams, and possibly remote clinics on Earth.
