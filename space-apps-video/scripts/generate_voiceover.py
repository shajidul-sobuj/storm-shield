import asyncio
import os
import edge_tts
import subprocess

VOICE = "en-US-ChristopherNeural"

# Scenes with target start offsets in seconds
CUES = [
    {
        "id": "A1",
        "start": 2.0,
        "text": "Fifty million miles from Earth, in the silent void of deep space, an alarm breaks the silence. A solar storm has erupted, and an astronaut’s vital signs are dropping. There is no doctor on board, and Mission Control is twenty minutes away."
    },
    {
        "id": "A2",
        "start": 16.0,
        "text": "We are Team Extokened from Bangladesh. I am Sajidul Islam Sobuj, lead software architect, alongside clinical researcher Yarin."
    },
    {
        "id": "A3",
        "start": 28.5,
        "text": "As humanity prepares to return to the Moon and journey to Mars, we created Storm Shield — an autonomous medical guardian engineered to protect astronaut health when Earth is out of reach."
    },
    {
        "id": "B1",
        "start": 44.0,
        "text": "Addressing NASA’s official challenge, 'Create Health Monitoring Software for Astronauts on Space Missions,' we examined the five foundational hazards of human spaceflight: radiation, isolation, distance, microgravity, and hostile closed environments."
    },
    {
        "id": "B2",
        "start": 59.0,
        "text": "On a Mars transit, radio signals take up to twenty-two minutes each way, and solar conjunction causes complete blackouts. Meanwhile, satellite data shows solar particle events can surge proton flux over four-thousand-fold. Combined with microgravity fluid shifts that strain the heart, an acute medical crisis cannot wait for Earth."
    },
    {
        "id": "B3",
        "start": 79.5,
        "text": "Current space wearables stream vitals to ground scientists, but leave isolated crews without real-time decision support during blackouts. Yet using black-box generative AI risks dangerous medical hallucinations. Astronauts need immediate, transparent, and grounded clinical intelligence."
    },
    {
        "id": "C1",
        "start": 101.0,
        "text": "This is Storm Shield. Our core innovation links space weather directly to human physiology. We ingest live alerts from NASA CCMC DONKI and satellite telemetry from the NOAA Space Weather Prediction Center GOES-16 Proton Flux, benchmarked against the NASA OSDR RadLab Database."
    },
    {
        "id": "C2",
        "start": 119.0,
        "text": "Applying Artemis I Orion Radiation Measurements, our engine models four-fold shielding protection. Wearable sensor feeds are evaluated by an interactive Health Twin against the astronaut’s personal baseline and NASA Human-System Standard 3001."
    },
    {
        "id": "C3",
        "start": 137.5,
        "text": "In this live demonstration, Pilot Alex Vance develops acute distress. Our persistence engine confirms the anomaly, alerts the crew across browser tabs, and opens Care Mode. Because Alex has an aspirin allergy, administration is strictly blocked, instantly creating a thirty-second flight surgeon handoff."
    },
    {
        "id": "D1",
        "start": 158.0,
        "text": "Who benefits? Astronauts and Crew Medical Officers gain an immediate, panic-free co-pilot. Crucially, Storm Shield operates at NASA Autonomy Ladder Level 2: the human acts, while the software visualizes, calculates, alerts, and records. We guarantee zero medical hallucinations by eliminating generative black boxes from the clinical path."
    },
    {
        "id": "D2",
        "start": 176.0,
        "text": "What changes is total situational clarity. Our deterministic engine has passed forty-four automated unit tests with zero unanchored data. And this innovation extends beyond space: the same offline architecture can bring life-saving decision support to Antarctic research bases, naval vessels, and remote disaster zones on Earth."
    },
    {
        "id": "D3",
        "start": 194.5,
        "text": "Looking forward, we are advancing Storm Shield toward hardware Bluetooth integration with flight-certified biometrics and private on-device language models for ambient medical charting."
    },
    {
        "id": "D4",
        "start": 212.5,
        "text": "In deep space, autonomy is not a luxury — it is survival. We are Team Extokened. With Storm Shield, wherever humanity journeys, our astronauts will never face the storm alone."
    }
]

async def generate_clips():
    out_dir = "space-apps-video/voiceover"
    os.makedirs(out_dir, exist_ok=True)
    
    for cue in CUES:
        out_file = os.path.join(out_dir, f"{cue['id']}.mp3")
        print(f"Generating {cue['id']}...")
        communicate = edge_tts.Communicate(cue["text"], VOICE, rate="-2%")
        await communicate.save(out_file)
        
        # Check duration
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_file]
        dur = float(subprocess.check_output(cmd).decode().strip())
        print(f"  {cue['id']} duration: {dur:.2f}s (starts at {cue['start']:.1f}s, ends at {cue['start']+dur:.1f}s)")

if __name__ == "__main__":
    asyncio.run(generate_clips())
