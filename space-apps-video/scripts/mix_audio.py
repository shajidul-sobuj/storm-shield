import os
import subprocess

def create_master_audio():
    out_dir = "space-apps-video/output"
    os.makedirs(out_dir, exist_ok=True)
    vo_dir = "space-apps-video/voiceover"
    
    # Exact start times in milliseconds
    tracks = [
        ("A1.mp3", 2000),
        ("A2.mp3", 19500),
        ("A3.mp3", 30500),
        ("B1.mp3", 44500),
        ("B2.mp3", 60800),
        ("B3.mp3", 81000),
        ("C1.mp3", 101000),
        ("C2.mp3", 120800),
        ("C3.mp3", 136800),
        ("D1.mp3", 158500),
        ("D2.mp3", 178500),
        ("D3.mp3", 201500),
        ("D4.mp3", 211000)
    ]
    
    # First, let's assemble all voice clips into a single timed voice stream
    # using FFmpeg adelay and amix
    inputs = []
    filter_delays = []
    
    for i, (fname, delay_ms) in enumerate(tracks):
        fpath = os.path.join(vo_dir, fname)
        inputs.extend(["-i", fpath])
        filter_delays.append(f"[{i}]adelay={delay_ms}|{delay_ms}[v{i}]")
    
    mix_inputs = "".join(f"[v{i}]" for i in range(len(tracks)))
    filter_complex = f"{';'.join(filter_delays)};{mix_inputs}amix=inputs={len(tracks)}:dropout_transition=0:normalize=0[vo]"
    
    # Also generate procedural atmospheric background music & SFX:
    # 1. Low drone (40-60Hz) throughout 0-228s
    # 2. Tech rhythmic pulse in B and C (43-157s)
    # 3. Alarm chime at 136-140s
    # 4. Uplifting chords in D (157-228s)
    bg_filter = (
        "sine=f=55:d=228[sub];"
        "sine=f=110:d=228[drone];"
        "[sub][drone]amix=inputs=2[dronemix];"
        "[dronemix]volume=0.08[ambiance];"
        # Dual-tone emergency siren at 137s to 142s
        "sine=f=880:d=4[siren1];sine=f=660:d=4[siren2];"
        "[siren1][siren2]amix=inputs=2,adelay=137000|137000,volume=0.15[siren];"
        # Final mix of voiceover + ambiance + siren
        "[vo][ambiance][siren]amix=inputs=3:duration=first:dropout_transition=2[outa]"
    )
    
    full_filter = f"{filter_complex};{bg_filter}"
    
    # Generate 228.0s master audio
    out_audio = os.path.join(out_dir, "master_audio.wav")
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-f", "lavfi", "-t", "228", "-i", "anullsrc=r=44100:cl=stereo",
        "-filter_complex",
        f"{';'.join(filter_delays)};{mix_inputs}amix=inputs={len(tracks)}:dropout_transition=0:normalize=0[vo];"
        f"sine=f=55:d=228,volume=0.07[b1];sine=f=110:d=228,volume=0.05[b2];[b1][b2]amix=inputs=2[amb];"
        f"sine=f=880:d=3,volume=0.12,adelay=137000|137000[siren];"
        f"[{len(tracks)}][vo][amb][siren]amix=inputs=4:duration=first:dropout_transition=0[outa]",
        "-map", "[outa]",
        "-t", "228.0",
        out_audio
    ]
    
    print("Assembling master 228.0s audio track...")
    subprocess.check_call(cmd)
    
    # Check duration
    dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_audio]
    dur = float(subprocess.check_output(dur_cmd).decode().strip())
    print(f"Master audio generated: {out_audio}")
    print(f"Exact Audio Duration: {dur:.3f} seconds")

if __name__ == "__main__":
    create_master_audio()
