import os
import sys
import math
import random
import subprocess
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
FPS = 30
CLIPS_DIR = "space-apps-video/assets/clips"
UI_DIR = "space-apps-video/assets/ui"
os.makedirs(CLIPS_DIR, exist_ok=True)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def open_ffmpeg_pipe(out_path):
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{W}x{H}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "18",
        out_path
    ]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

def draw_top_bar(draw, section_tag, title_text, section_color=(6, 182, 212), frame_idx=0):
    draw.rectangle([(0, 0), (W, 75)], fill=(8, 14, 26))
    draw.line([(0, 75), (W, 75)], fill=(30, 41, 59), width=2)

    # Section tag
    draw.rounded_rectangle([(35, 16), (220, 58)], radius=6, fill=section_color)
    f_tag = get_font(FONT_BOLD, 18)
    draw.text((50, 25), section_tag, font=f_tag, fill=(10, 15, 30))

    # Section title
    f_title = get_font(FONT_BOLD, 23)
    draw.text((245, 23), title_text, font=f_title, fill=(241, 245, 249))

    # Pulsing live beacon
    pulse = int(128 + 127 * math.sin(frame_idx * 0.2))
    draw.ellipse([(W - 470, 33), (W - 456, 47)], fill=(16, 185, 129))

    # Mission clock
    f_meta = get_font(FONT_MONO, 16)
    sec = (frame_idx // FPS) % 60
    draw.text((W - 445, 27), f"STORM SHIELD 🛡️  |  MET 142:18:{sec:02d}", font=f_meta, fill=(148, 163, 184))

def draw_bottom_subtitle(draw, subtitle_text, ticker="NASA CCMC DONKI · NOAA GOES-18 · NASA OSDR · 47/47 TESTS PASSING"):
    draw.rectangle([(0, H - 105), (W, H)], fill=(8, 12, 22))
    draw.line([(0, H - 105), (W, H - 105)], fill=(30, 41, 59), width=2)

    if subtitle_text:
        f_sub = get_font(FONT_REG, 22)
        draw.text((60, H - 85), f"“ {subtitle_text} ”", font=f_sub, fill=(226, 232, 240))

    if ticker:
        f_tick = get_font(FONT_MONO, 13)
        draw.text((60, H - 35), ticker, font=f_tick, fill=(6, 182, 212))

def draw_ecg_wave(draw, x, y, width, height, frame_idx, bpm=72, color=(16, 185, 129), thickness=3):
    draw.rectangle([(x, y), (x + width, y + height)], fill=(10, 18, 32), outline=(30, 41, 59), width=2)
    for gx in range(x + 20, x + width, 40):
        draw.line([(gx, y), (gx, y + height)], fill=(15, 28, 48), width=1)
    for gy in range(y + 20, y + height, 40):
        draw.line([(x, gy), (x + width, gy)], fill=(15, 28, 48), width=1)

    points = []
    cy = y + height // 2
    period = 30.0 * (60.0 / bpm)
    sweep_x = int((frame_idx * 7) % width)

    for px in range(width):
        rel_x = (px - sweep_x) % width
        phase = (rel_x % period) / period
        dy = 0
        if 0.15 < phase < 0.25:
            dy = -12 * math.sin((phase - 0.15) * 10 * math.pi)
        elif 0.32 < phase < 0.35:
            dy = 10 * math.sin((phase - 0.32) * 33.3 * math.pi)
        elif 0.35 <= phase < 0.40:
            dy = -65 * math.sin((phase - 0.35) * 20 * math.pi)
        elif 0.40 <= phase < 0.44:
            dy = 20 * math.sin((phase - 0.40) * 25 * math.pi)
        elif 0.55 < phase < 0.75:
            dy = -22 * math.sin((phase - 0.55) * 5 * math.pi)
        points.append((x + px, cy + dy))

    if len(points) > 1:
        draw.line(points, fill=color, width=thickness)
    dot_y = points[sweep_x][1] if sweep_x < len(points) else cy
    draw.ellipse([(x + sweep_x - 4, dot_y - 4), (x + sweep_x + 4, dot_y + 4)], fill=(255, 255, 255))

# Parallax starfield data
random.seed(42)
STARS = [[random.uniform(-960, 960), random.uniform(-540, 540), random.uniform(50, 1000)] for _ in range(250)]

def draw_3d_starfield(draw, speed=8):
    for s in STARS:
        s[2] -= speed
        if s[2] <= 10:
            s[2] = 1000
            s[0] = random.uniform(-960, 960)
            s[1] = random.uniform(-540, 540)
        k = 400.0 / s[2]
        sx = int(W / 2 + s[0] * k)
        sy = int(H / 2 + s[1] * k)
        sz = max(1, int(3.5 * (1.0 - s[2] / 1000.0)))
        if 0 <= sx < W and 75 <= sy < H - 105:
            b = int(255 * (1.0 - s[2] / 1000.0))
            draw.ellipse([(sx - sz, sy - sz), (sx + sz, sy + sz)], fill=(b, b, min(255, b + 40)))

# Smooth Ken Burns helper
def apply_ken_burns(base_img, zoom_start, zoom_end, pan_x_start, pan_x_end, pan_y_start, pan_y_end, progress):
    zoom = zoom_start + (zoom_end - zoom_start) * progress
    pan_x = pan_x_start + (pan_x_end - pan_x_start) * progress
    pan_y = pan_y_start + (pan_y_end - pan_y_start) * progress

    w_crop = int(W / zoom)
    h_crop = int(H / zoom)

    cx = int(W / 2 + pan_x)
    cy = int(H / 2 + pan_y)

    left = max(0, min(W - w_crop, cx - w_crop // 2))
    top = max(0, min(H - h_crop, cy - h_crop // 2))

    cropped = base_img.crop((left, top, left + w_crop, top + h_crop))
    return cropped.resize((W, H), Image.Resampling.BILINEAR)

# =========================================================================
# SCENE 01: Hook 1 (8.0s / 240 frames)
# =========================================================================
def render_scene_01(out_path):
    print("Rendering S01: Deep Space Hook (8.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 240
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (6, 10, 20))
        draw = ImageDraw.Draw(img)

        # 3D Stars
        draw_3d_starfield(draw, speed=9)

        # Mars in distance
        mars_x, mars_y = 1500, 340
        draw.ellipse([(mars_x - 110, mars_y - 110), (mars_x + 110, mars_y + 110)], fill=(185, 60, 30))
        draw.ellipse([(mars_x - 90, mars_y - 90), (mars_x + 70, mars_y + 70)], fill=(215, 80, 40))
        # Atmospheric glow
        pulse_g = int(20 * math.sin(f * 0.1))
        draw.ellipse([(mars_x - 125, mars_y - 125), (mars_x + 125, mars_y + 125)], outline=(244, 63, 94, 100 + pulse_g), width=3)
        draw.text((mars_x - 55, mars_y + 130), "MARS TRANSIT", font=get_font(FONT_MONO, 16), fill=(251, 146, 60))

        # Spaceship silhouette moving forward
        ship_x = 350 + int(f * 1.8)
        ship_y = 480 + int(10 * math.sin(f * 0.05))
        # Cyan thruster plume
        plume_w = 40 + int(15 * math.sin(f * 0.4))
        draw.polygon([(ship_x - 100 - plume_w, ship_y), (ship_x - 90, ship_y - 10), (ship_x - 90, ship_y + 10)], fill=(6, 182, 212))
        draw.polygon([(ship_x - 90 - plume_w//2, ship_y), (ship_x - 90, ship_y - 5), (ship_x - 90, ship_y + 5)], fill=(255, 255, 255))
        # Hull
        draw.polygon([(ship_x, ship_y), (ship_x - 90, ship_y - 25), (ship_x - 80, ship_y), (ship_x - 90, ship_y + 25)], fill=(203, 213, 225))
        draw.polygon([(ship_x + 20, ship_y), (ship_x - 20, ship_y - 12), (ship_x - 20, ship_y + 12)], fill=(241, 245, 249))

        # Main hook headline
        f_huge = get_font(FONT_BOLD, 52)
        f_sub = get_font(FONT_REG, 26)
        draw.text((120, 240), "50,000,000 MILES FROM EARTH", font=f_huge, fill=(248, 113, 113))
        draw.text((120, 315), "Deep-space transit habitat beyond lunar orbit.", font=f_sub, fill=(226, 232, 240))
        draw.text((120, 360), "Earth Mission Control is 20+ minutes away by radio.", font=f_sub, fill=(148, 163, 184))

        # Critical alert card
        box_alpha = int(220 + 35 * math.sin(f * 0.2))
        draw.rounded_rectangle([(120, 450), (950, 680)], radius=16, fill=(15, 23, 42), outline=(239, 68, 68), width=3)
        draw.text((160, 480), "⚠️  CRITICAL ALERT: SOLAR STORM ERUPTION", font=get_font(FONT_BOLD, 28), fill=(252, 165, 165))
        draw.text((160, 535), "• Energetic Proton Flux: > 4,200 pfu (S3 Severe SPE)", font=get_font(FONT_REG, 23), fill=(241, 245, 249))
        draw.text((160, 575), "• Astronaut Vitals: Acute Tachycardia + SpO2 Decline", font=get_font(FONT_REG, 23), fill=(241, 245, 249))
        draw.text((160, 615), "• Physician on Board: NONE · Radio Delay: 22 Minutes", font=get_font(FONT_BOLD, 23), fill=(251, 146, 60))

        # Rotating radar on right
        rx, ry, rad = 1450, 620, 110
        draw.ellipse([(rx - rad, ry - rad), (rx + rad, ry + rad)], outline=(56, 189, 248), width=2)
        draw.ellipse([(rx - rad//2, ry - rad//2), (rx + rad//2, ry + rad//2)], outline=(30, 58, 138), width=1)
        ang = f * 0.12
        draw.line([(rx, ry), (rx + int(rad * math.cos(ang)), ry + int(rad * math.sin(ang)))], fill=(239, 68, 68), width=3)
        draw.text((rx - 70, ry + rad + 15), "RADIATION RADAR", font=get_font(FONT_MONO, 14), fill=(248, 113, 113))

        draw_top_bar(draw, "WHO · HOOK", "DEEP SPACE TRANSLUNAR TRANSIT", (244, 63, 94), f)
        draw_bottom_subtitle(draw, "Fifty million miles from Earth, in the silent void of deep space, an alarm breaks the silence.", "SOLAR PARTICLE EVENT DETECTED · PROTON FLUX > 4200 PFU")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 02: Hook 2 - Cockpit Alarm (7.0s / 210 frames)
# =========================================================================
def render_scene_02(out_path):
    print("Rendering S02: Cockpit Alarm & Latency (7.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 210
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (12, 16, 28))
        draw = ImageDraw.Draw(img)

        # Flashing red emergency vignette
        flash = int(60 + 50 * math.sin(f * 0.35))
        draw.rectangle([(0, 75), (W, 75 + flash)], fill=(flash*2, 20, 30))
        draw.rectangle([(0, H - 105 - flash), (W, H - 105)], fill=(flash*2, 20, 30))
        draw.rectangle([(0, 75), (flash, H - 105)], fill=(flash*2, 20, 30))
        draw.rectangle([(W - flash, 75), (W, H - 105)], fill=(flash*2, 20, 30))

        # Main alert
        draw.text((120, 130), "CRITICAL ALERT · CREW VITALS DEVIATION", font=get_font(FONT_BOLD, 46), fill=(248, 113, 113))

        # Left Info Card
        draw.rounded_rectangle([(120, 220), (950, 680)], radius=16, fill=(15, 23, 42), outline=(244, 63, 94), width=2)
        draw.text((160, 260), "NASA EARTH-INDEPENDENT MEDICAL CHALLENGE", font=get_font(FONT_BOLD, 25), fill=(56, 189, 248))
        metrics = [
            ("Speed-of-light One-Way Delay:", "20 to 22 Minutes"),
            ("Round-Trip to Mission Control:", "40 to 44 Minutes"),
            ("Solar Conjunction Blackout:", "Up to 2 Weeks (Zero Signal)"),
            ("Onboard Physician Available:", "None Guaranteed"),
            ("Astronaut Role in Emergency:", "Autonomous First Responders")
        ]
        y_pos = 320
        for label, val in metrics:
            draw.text((160, y_pos), label, font=get_font(FONT_REG, 21), fill=(148, 163, 184))
            draw.text((620, y_pos), val, font=get_font(FONT_BOLD, 21), fill=(241, 245, 249))
            y_pos += 65

        # Right ECG Card with tachycardia wave
        draw.rounded_rectangle([(1020, 220), (1800, 680)], radius=16, fill=(15, 23, 42), outline=(239, 68, 68), width=2)
        draw.text((1060, 260), "REAL-TIME LEAD II ECG: TACHYCARDIA", font=get_font(FONT_BOLD, 25), fill=(248, 113, 113))
        draw_ecg_wave(draw, 1060, 320, 700, 240, f, bpm=125, color=(239, 68, 68), thickness=3)

        # Readout stats
        draw.text((1060, 590), "HEART RATE: 125 BPM", font=get_font(FONT_BOLD, 24), fill=(252, 165, 165))
        draw.text((1450, 590), "SpO2: 91% (HYPOXIA)", font=get_font(FONT_BOLD, 24), fill=(251, 146, 60))
        draw.text((1060, 630), "STATUS: PERSISTENCE GATE 3/3 LATCHED", font=get_font(FONT_MONO, 18), fill=(239, 68, 68))

        draw_top_bar(draw, "WHO · HOOK", "COMMUNICATION DELAY & CREW ISOLATION", (244, 63, 94), f)
        draw_bottom_subtitle(draw, "A solar storm has erupted, and an astronaut’s vital signs are dropping. There is no doctor on board, and Mission Control is twenty minutes away.", "ONE-WAY SPEED-OF-LIGHT DELAY: 22 MINUTES · CREW IS ENTIRELY AUTONOMOUS")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 03: Team Presentation (13.0s / 390 frames)
# =========================================================================
def render_scene_03(out_path):
    print("Rendering S03: Team Extokened Presentation (13.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 390
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 15, 28))
        draw = ImageDraw.Draw(img)

        # Subtle floating particle dust
        for i in range(40):
            px = int((i * 137 + f * 1.5) % W)
            py = int((i * 97 + f * 0.8) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(40, 70, 120))

        # Main Title Banner
        draw.text((120, 120), "NASA INTERNATIONAL SPACE APPS CHALLENGE 2026", font=get_font(FONT_MONO, 22), fill=(6, 182, 212))
        draw.text((120, 160), "MEET THE BUILDERS OF STORM SHIELD", font=get_font(FONT_BOLD, 46), fill=(241, 245, 249))

        # Slide-in easing for cards
        p_c1 = min(1.0, f / 35.0)
        p_c2 = min(1.0, max(0.0, (f - 40) / 35.0))
        p_c3 = min(1.0, max(0.0, (f - 70) / 35.0))

        # Card 1: Team Extokened
        c1_y = int(240 + (1.0 - p_c1) * 60)
        draw.rounded_rectangle([(120, c1_y), (850, c1_y + 190)], radius=16, fill=(15, 23, 42), outline=(245, 158, 11), width=2)
        # Neon tracer on border
        t_pos = (f * 12) % (730 + 190)
        draw.ellipse([(120 + min(730, t_pos) - 6, c1_y - 6), (120 + min(730, t_pos) + 6, c1_y + 6)], fill=(245, 158, 11))
        draw.text((150, c1_y + 30), "TEAM EXTOKENED", font=get_font(FONT_BOLD, 36), fill=(251, 191, 36))
        draw.text((150, c1_y + 85), "Country: BANGLADESH 🇧🇩  |  Global Space Apps Finalist", font=get_font(FONT_REG, 22), fill=(226, 232, 240))
        draw.text((150, c1_y + 125), "Mission: Autonomous Clinical Decision Support for Deep Space", font=get_font(FONT_REG, 20), fill=(148, 163, 184))

        # Card 2: Sajidul Islam Sobuj (Architect)
        c2_x = int(120 + (1.0 - p_c2) * -60)
        draw.rounded_rectangle([(c2_x, 470), (c2_x + 800, 740)], radius=16, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        draw.text((c2_x + 40, 505), "SAJIDUL ISLAM SOBUJ", font=get_font(FONT_BOLD, 32), fill=(56, 189, 248))
        draw.text((c2_x + 40, 555), "ROLE: LEAD SOFTWARE ARCHITECT", font=get_font(FONT_MONO, 18), fill=(6, 182, 212))
        draw.text((c2_x + 40, 600), "• Full-Stack Architecture & Real-Time Engine\n• Live NOAA SWPC & NASA DONKI Telemetry Ingestion\n• 47 Automated Deterministic Unit Tests (100% Pass)", font=get_font(FONT_REG, 20), fill=(203, 213, 225))

        # Card 3: Yarin (Clinical Researcher)
        c3_x = int(960 + (1.0 - p_c3) * 60)
        draw.rounded_rectangle([(c3_x, 470), (c3_x + 840, 740)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((c3_x + 40, 505), "YARIN", font=get_font(FONT_BOLD, 32), fill=(52, 211, 153))
        draw.text((c3_x + 40, 555), "ROLE: CLINICAL RESEARCHER", font=get_font(FONT_MONO, 18), fill=(16, 185, 129))
        draw.text((c3_x + 40, 600), "• NASA STD-3001 Human-System Integration Rules\n• Artemis I Radiation Shielding & Haven Calculations\n• Space Physiology, Allergy Locks & Clinical Countermeasures", font=get_font(FONT_REG, 20), fill=(203, 213, 225))

        # Right emblem graphic
        draw.ellipse([(1400, 160), (1680, 440)], outline=(6, 182, 212), width=3)
        draw.ellipse([(1440, 200), (1640, 400)], outline=(16, 185, 129), width=2)
        draw.text((1470, 280), "STORM SHIELD", font=get_font(FONT_BOLD, 20), fill=(241, 245, 249))
        draw.text((1500, 315), "TEAM 2026", font=get_font(FONT_MONO, 16), fill=(148, 163, 184))

        draw_top_bar(draw, "WHO · TEAM", "TEAM EXTOKENED (BANGLADESH)", (245, 158, 11), f)
        draw_bottom_subtitle(draw, "We are Team Extokened from Bangladesh. I am Sajidul Islam Sobuj, lead software architect, alongside clinical researcher Yarin.", "SAJIDUL ISLAM SOBUJ (LEAD ARCHITECT) & YARIN (CLINICAL RESEARCHER)")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 04: Storm Shield Identity & Mission Path (15.0s / 450 frames)
# =========================================================================
def render_scene_04(out_path):
    print("Rendering S04: Mission Path & Identity (15.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 450
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 16, 30))
        draw = ImageDraw.Draw(img)

        # 3D Starfield in background
        draw_3d_starfield(draw, speed=4)

        # Main Title
        draw.text((120, 120), "AUTONOMOUS MEDICAL GUARDIAN FOR DEEP SPACE", font=get_font(FONT_MONO, 20), fill=(6, 182, 212))
        draw.text((120, 160), "STORM SHIELD: ARCHITECTURE & MISSION TRAJECTORY", font=get_font(FONT_BOLD, 44), fill=(241, 245, 249))

        # Central 3D Shield Emblem with rotating rings
        cx, cy = 960, 400
        rot = f * 0.05
        # Dual rotating elliptical rings
        for r_ang, col in [(rot, (6, 182, 212)), (rot + math.pi/2, (16, 185, 129))]:
            pts = []
            for a in range(60):
                th = a * 2 * math.pi / 60
                px = cx + int(190 * math.cos(th) * math.cos(r_ang) - 80 * math.sin(th) * math.sin(r_ang))
                py = cy + int(190 * math.cos(th) * math.sin(r_ang) + 80 * math.sin(th) * math.cos(r_ang))
                pts.append((px, py))
            draw.line(pts + [pts[0]], fill=col, width=2)

        # Shield Polygon
        draw.polygon([(cx, cy - 80), (cx + 65, cy - 35), (cx + 50, cy + 60), (cx, cy + 95), (cx - 50, cy + 60), (cx - 65, cy - 35)], fill=(15, 23, 42), outline=(56, 189, 248), width=3)
        draw.polygon([(cx, cy - 60), (cx + 45, cy - 25), (cx + 35, cy + 45), (cx, cy + 70), (cx - 35, cy + 45), (cx - 45, cy - 25)], fill=(16, 185, 129))
        draw.text((cx - 28, cy - 15), "🛡️", font=get_font(FONT_BOLD, 36), fill=(255, 255, 255))

        # Trajectory Path: Earth -> Moon -> Mars
        draw.line([(180, 680), (1740, 680)], fill=(30, 41, 59), width=2)
        # Earth node
        draw.ellipse([(180, 650), (240, 710)], fill=(37, 99, 235))
        draw.text((170, 730), "EARTH (LEO)", font=get_font(FONT_BOLD, 18), fill=(147, 197, 253))
        draw.text((150, 760), "Real-time Ground Link", font=get_font(FONT_REG, 15), fill=(148, 163, 184))

        # Moon / Artemis Gateway node
        draw.ellipse([(780, 650), (840, 710)], fill=(156, 163, 175))
        draw.text((740, 730), "LUNAR GATEWAY", font=get_font(FONT_BOLD, 18), fill=(229, 231, 235))
        draw.text((710, 760), "Artemis 1 4.0x Water Wall", font=get_font(FONT_REG, 15), fill=(148, 163, 184))

        # Mars Transit node
        draw.ellipse([(1480, 650), (1540, 710)], fill=(220, 38, 38))
        draw.text((1460, 730), "MARS TRANSIT", font=get_font(FONT_BOLD, 18), fill=(252, 165, 165))
        draw.text((1440, 760), "EIMO Level 2 Autonomy", font=get_font(FONT_REG, 15), fill=(148, 163, 184))

        # Moving pulse packet along path
        pulse_pos = int(210 + ((f * 5) % 1300))
        draw.ellipse([(pulse_pos - 8, 672), (pulse_pos + 8, 688)], fill=(6, 182, 212))

        # Flight waypoint cards
        draw.rounded_rectangle([(180, 810), (1740, 930)], radius=12, fill=(15, 23, 42), outline=(6, 182, 212), width=1)
        draw.text((220, 835), "KEY PRINCIPLE: ZERO UNANCHORED CLINICAL DATA", font=get_font(FONT_BOLD, 22), fill=(6, 182, 212))
        draw.text((220, 875), "Every recommendation is grounded in NASA STD-3001, published clinical trials, and verified sensor baselines.", font=get_font(FONT_REG, 19), fill=(226, 232, 240))

        draw_top_bar(draw, "WHO · MISSION", "MISSION TRAJECTORY & AUTONOMY GOAL", (6, 182, 212), f)
        draw_bottom_subtitle(draw, "As humanity prepares to return to the Moon and journey to Mars, we created Storm Shield — an autonomous medical guardian engineered to protect astronaut health when Earth is out of reach.", "AUTONOMOUS MEDICAL GUARDIAN FOR LONG-DURATION SPACE MISSIONS")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 05: NASA Challenge & 5 Hazards (15.0s / 450 frames)
# =========================================================================
def render_scene_05(out_path):
    print("Rendering S05: NASA Challenge & 5 Hazards (15.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 450
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        # Challenge Header
        draw.text((120, 115), "OFFICIAL NASA INTERNATIONAL SPACE APPS CHALLENGE", font=get_font(FONT_MONO, 20), fill=(245, 158, 11))
        draw.text((120, 150), "“Create Health Monitoring Software for Astronauts on Space Missions”", font=get_font(FONT_BOLD, 36), fill=(251, 191, 36))

        # 5 Hazards (RIDGE) Layout
        hazards = [
            ("R", "SPACE RADIATION", "Solar Particle Events (SPEs), Cosmic Rays, Tissue Dosimetry", (244, 63, 94)),
            ("I", "ISOLATION & CONFINEMENT", "Sleep disruption, cognitive load, autonomous psychological support", (168, 85, 247)),
            ("D", "DISTANCE FROM EARTH", "Up to 22-min radio latency, zero evacuation capability", (245, 158, 11)),
            ("G", "GRAVITY FIELDS", "Cephalad fluid shift, spaceflight osteopenia, cardiovascular deconditioning", (59, 130, 246)),
            ("E", "HOSTILE CLOSED ENVIRONMENTS", "Microbial accumulation, atmospheric CO2, habitat toxicology", (16, 185, 129))
        ]

        y_off = 230
        for i, (letter, title, desc, color) in enumerate(hazards):
            is_active = (f // 70) >= i
            alpha_col = color if is_active else (71, 85, 105)

            draw.rounded_rectangle([(120, y_off), (1150, y_off + 95)], radius=12, fill=(15, 23, 42), outline=alpha_col, width=2 if is_active else 1)
            # Letter badge
            draw.rounded_rectangle([(140, y_off + 15), (200, y_off + 75)], radius=8, fill=alpha_col)
            draw.text((158, y_off + 25), letter, font=get_font(FONT_BOLD, 30), fill=(15, 23, 42))

            draw.text((225, y_off + 20), title, font=get_font(FONT_BOLD, 22), fill=(241, 245, 249) if is_active else (148, 163, 184))
            draw.text((225, y_off + 55), desc, font=get_font(FONT_REG, 17), fill=(203, 213, 225) if is_active else (100, 116, 139))
            y_off += 115

        # Radar scanner on right
        rx, ry, rad = 1520, 520, 230
        draw.ellipse([(rx - rad, ry - rad), (rx + rad, ry + rad)], outline=(30, 41, 59), width=2)
        draw.ellipse([(rx - rad*2//3, ry - rad*2//3), (rx + rad*2//3, ry + rad*2//3)], outline=(30, 58, 138), width=1)
        draw.ellipse([(rx - rad//3, ry - rad//3), (rx + rad//3, ry + rad//3)], outline=(30, 58, 138), width=1)
        # Radar sweep
        ang = f * 0.08
        draw.line([(rx, ry), (rx + int(rad * math.cos(ang)), ry + int(rad * math.sin(ang)))], fill=(245, 158, 11), width=3)
        draw.text((rx - 90, ry - 15), "NASA RIDGE", font=get_font(FONT_BOLD, 26), fill=(245, 158, 11))
        draw.text((rx - 75, ry + 25), "5 HAZARDS", font=get_font(FONT_MONO, 16), fill=(148, 163, 184))

        draw_top_bar(draw, "WHY · CHALLENGE", "THE 5 FOUNDATIONAL SPACEFLIGHT HAZARDS (RIDGE)", (245, 158, 11), f)
        draw_bottom_subtitle(draw, "Addressing NASA’s official challenge, 'Create Health Monitoring Software for Astronauts on Space Missions,' we examined the five foundational hazards of human spaceflight: radiation, isolation, distance, microgravity, and hostile closed environments.", "OFFICIAL CHALLENGE: CREATE HEALTH MONITORING SOFTWARE FOR ASTRONAUTS")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 06: 22-Minute Latency (10.0s / 300 frames)
# =========================================================================
def render_scene_06(out_path):
    print("Rendering S06: 22-Minute Latency (10.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 300
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 15, 28))
        draw = ImageDraw.Draw(img)

        # Earth on left, Mars on right
        draw.ellipse([(140, 360), (340, 560)], fill=(37, 99, 235))
        draw.ellipse([(170, 390), (310, 530)], fill=(59, 130, 246))
        draw.text((180, 590), "EARTH", font=get_font(FONT_BOLD, 28), fill=(147, 197, 253))
        draw.text((150, 630), "Mission Control", font=get_font(FONT_REG, 20), fill=(148, 163, 184))

        draw.ellipse([(1580, 360), (1780, 560)], fill=(220, 38, 38))
        draw.ellipse([(1610, 390), (1750, 530)], fill=(239, 68, 68))
        draw.text((1630, 590), "MARS", font=get_font(FONT_BOLD, 28), fill=(252, 165, 165))
        draw.text((1610, 630), "Transit Habitat", font=get_font(FONT_REG, 20), fill=(148, 163, 184))

        # Radio wave pulses traveling from Earth to Mars
        for i in range(5):
            wave_x = int(340 + ((f * 6 + i * 240) % 1240))
            draw.line([(wave_x, 420), (wave_x, 500)], fill=(6, 182, 212), width=3)
            # Radio sinusoidal wave
            pts = []
            for dx in range(-40, 41, 4):
                dy = int(25 * math.sin((wave_x + dx) * 0.15))
                pts.append((wave_x + dx, 460 + dy))
            draw.line(pts, fill=(56, 189, 248), width=2)

        # Central Stopwatch & Latency Callout
        sec_counter = int((f / total_frames) * 22)
        draw.rounded_rectangle([(520, 260), (1400, 660)], radius=20, fill=(15, 23, 42), outline=(245, 158, 11), width=3)
        draw.text((580, 310), "ONE-WAY SPEED-OF-LIGHT DELAY", font=get_font(FONT_MONO, 22), fill=(245, 158, 11))
        draw.text((640, 370), f"T + {sec_counter:02d}:00 MIN", font=get_font(FONT_BOLD, 74), fill=(241, 245, 249))

        draw.text((580, 490), "• ROUND-TRIP TO MISSION CONTROL: 44 MINUTES", font=get_font(FONT_BOLD, 23), fill=(248, 113, 113))
        draw.text((580, 535), "• SOLAR CONJUNCTION BLACKOUT: 2 WEEKS ZERO SIGNAL", font=get_font(FONT_BOLD, 23), fill=(251, 146, 60))
        draw.text((580, 580), "• CONCLUSION: REAL-TIME GROUND DOCTOR IS PHYSICALLY IMPOSSIBLE", font=get_font(FONT_BOLD, 21), fill=(56, 189, 248))

        draw_top_bar(draw, "WHY · LATENCY", "COMMUNICATION DELAY & SOLAR BLACKOUT", (245, 158, 11), f)
        draw_bottom_subtitle(draw, "On a Mars transit, radio signals take up to twenty-two minutes each way, and solar conjunction causes complete blackouts.", "ONE-WAY RADIO LATENCY: 22 MINUTES · ROUND-TRIP: 44 MINUTES")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 07: 4,000x Proton Surge & Fluid Shift (10.0s / 300 frames)
# =========================================================================
def render_scene_07(out_path):
    print("Rendering S07: Proton Surge & Fluid Shift (10.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 300
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (12, 14, 26))
        draw = ImageDraw.Draw(img)

        # Left: CME Sun eruption graphic
        sun_x, sun_y = 120, 480
        draw.ellipse([(sun_x - 180, sun_y - 180), (sun_x + 180, sun_y + 180)], fill=(234, 88, 12))
        draw.ellipse([(sun_x - 140, sun_y - 140), (sun_x + 140, sun_y + 140)], fill=(245, 158, 11))
        # Shockwave arcs
        for i in range(3):
            arc_r = 180 + int((f * 4 + i * 80) % 240)
            draw.arc([(sun_x - arc_r, sun_y - arc_r), (sun_x + arc_r, sun_y + arc_r)], -60, 60, fill=(239, 68, 68), width=3)
        draw.text((140, 700), "CME ERUPTION", font=get_font(FONT_BOLD, 22), fill=(248, 113, 113))

        # Right: Dynamic Proton Flux Graph
        gx, gy, gw, gh = 450, 200, 800, 480
        draw.rectangle([(gx, gy), (gx + gw, gy + gh)], fill=(15, 23, 42), outline=(30, 41, 59), width=2)
        # Grid lines
        for y_step in range(gy + 60, gy + gh, 80):
            draw.line([(gx, y_step), (gx + gw, y_step)], fill=(30, 41, 59), width=1)
        draw.text((gx + 20, gy + 20), "NOAA GOES PROTON FLUX (> 100 MeV): EXPONENTIAL SURGE", font=get_font(FONT_BOLD, 22), fill=(248, 113, 113))

        # Plot curve rocketing up
        pts = []
        progress = min(1.0, f / 240.0)
        curr_pfu = 0.30 + (4200.0 - 0.30) * (progress ** 2.5)

        for px in range(int(gw * progress)):
            p_prog = px / float(gw)
            pfu_val = 0.30 + (4200.0 - 0.30) * (p_prog ** 2.5)
            log_h = min(gh - 40, int((math.log10(max(0.1, pfu_val)) + 1) / 4.6 * (gh - 60)))
            pts.append((gx + px, gy + gh - 30 - log_h))

        if len(pts) > 1:
            draw.line(pts, fill=(239, 68, 68), width=4)

        # Current pfu readout
        draw.text((gx + gw - 320, gy + 70), f"FLUX: {curr_pfu:,.0f} pfu", font=get_font(FONT_MONO, 28), fill=(252, 165, 165))
        draw.text((gx + gw - 320, gy + 115), "THRESHOLD: S3 SEVERE", font=get_font(FONT_BOLD, 18), fill=(239, 68, 68))

        # Fluid Shift Box
        draw.rounded_rectangle([(1300, 200), (1800, 680)], radius=16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
        draw.text((1330, 240), "MICROGRAVITY FLUID SHIFT", font=get_font(FONT_BOLD, 22), fill=(56, 189, 248))
        draw.text((1330, 290), "• Cephalad fluid redistribution\n• +2 Liters blood pooled to thorax\n• Elevated venous pressure\n• Reduced baroreflex sensitivity\n• Extreme susceptibility to arrhythmias\n  during radiation stress", font=get_font(FONT_REG, 19), fill=(226, 232, 240))
        draw.text((1330, 560), "⚠️ DOUBLE COMPOUND CRISIS", font=get_font(FONT_BOLD, 20), fill=(251, 146, 60))

        draw_top_bar(draw, "WHY · SURGE", "4,000-FOLD PROTON SURGE & CARDIOVASCULAR STRAIN", (244, 63, 94), f)
        draw_bottom_subtitle(draw, "Meanwhile, satellite data shows solar particle events can surge proton flux over four-thousand-fold. Combined with microgravity fluid shifts that strain the heart, an acute medical crisis cannot wait for Earth.", "SATELLITE DATA: PROTON FLUX SURGES > 4,000-FOLD DURING SOLAR PARTICLE EVENTS")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 08: 3-Column Comparison (22.0s / 660 frames)
# =========================================================================
def render_scene_08(out_path):
    print("Rendering S08: 3-Column Telemetry & AI Gap (22.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 660
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        # Subtle continuous floating particles in background
        for i in range(45):
            px = int((i * 123 + f * 2.2) % W)
            py = int((i * 89 + f * 1.1) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(35, 60, 100))

        draw.text((120, 115), "THE GAP IN MODERN SPACE HEALTH MONITORING", font=get_font(FONT_MONO, 20), fill=(6, 182, 212))
        draw.text((120, 150), "WHY GEN-AI CANNOT BE TRUSTED WITH ASTRONAUT LIVES", font=get_font(FONT_BOLD, 42), fill=(241, 245, 249))

        cols = [
            ("CURRENT SPACE WEARABLES", "DATA TRAPPED ON EARTH", (245, 158, 11), [
                "• Wearables stream vitals to ground servers",
                "• Crew left blind during radio blackouts",
                "• No autonomous onboard triage intelligence",
                "• Cannot guide emergency interventions"
            ], 120),
            ("BLACK-BOX GENERATIVE LLMs", "HIGH RISK OF HALLUCINATIONS", (239, 68, 68), [
                "• Generates unanchored medical dosages",
                "• Non-deterministic probabilistic guesses",
                "• Violates NASA Safety & Traceability",
                "• High risk of fatal clinical errors"
            ], 680),
            ("STORM SHIELD", "100% DETERMINISTIC & VERIFIED", (16, 185, 129), [
                "• Fully autonomous inside spacecraft",
                "• NASA STD-3001 clinical logic rules",
                "• Active allergy & contraindication locks",
                "• NASA Level 2 Autonomy (Human in loop)"
            ], 1240)
        ]

        for title, status, col_color, bullets, cx in cols:
            is_winner = (cx == 1240)
            draw.rounded_rectangle([(cx, 230), (cx + 520, 720)], radius=16, fill=(15, 23, 42), outline=col_color, width=3 if is_winner else 1)
            # Header
            draw.rectangle([(cx, 230), (cx + 520, 310)], fill=(20, 30, 50) if is_winner else (15, 20, 35))
            draw.text((cx + 25, 248), title, font=get_font(FONT_BOLD, 22), fill=(241, 245, 249))
            draw.text((cx + 25, 280), status, font=get_font(FONT_MONO, 15), fill=col_color)

            y_b = 350
            for b in bullets:
                draw.text((cx + 25, y_b), b, font=get_font(FONT_REG, 18), fill=(226, 232, 240) if is_winner else (148, 163, 184))
                y_b += 65

            if is_winner:
                # Radiant badge with pulsing aura
                pulse_rad = int(128 + 127 * math.sin(f * 0.15))
                draw.rounded_rectangle([(cx + 25, 620), (cx + 495, 680)], radius=8, fill=(16, 185, 129))
                draw.text((cx + 65, 640), "VERIFIED CLINICAL GROUNDING", font=get_font(FONT_BOLD, 20), fill=(15, 23, 42))

                # Electric neon tracer running around winning column border
                t_pos = (f * 16) % (520 * 2 + 490 * 2)
                if t_pos < 520:
                    tx, ty = cx + t_pos, 230
                elif t_pos < 520 + 490:
                    tx, ty = cx + 520, 230 + (t_pos - 520)
                elif t_pos < 520 * 2 + 490:
                    tx, ty = cx + 520 - (t_pos - 520 - 490), 720
                else:
                    tx, ty = cx, 720 - (t_pos - 520 * 2 - 490)
                draw.ellipse([(tx - 6, ty - 6), (tx + 6, ty + 6)], fill=(52, 211, 153))

        draw_top_bar(draw, "WHY · ARCHITECTURE", "THE TELEMETRY & AI DECISION GAP", (245, 158, 11), f)
        draw_bottom_subtitle(draw, "Current space wearables stream vitals to ground scientists, but leave isolated crews without real-time decision support during blackouts. Yet using black-box generative AI risks dangerous medical hallucinations. Astronauts need immediate, transparent, and grounded clinical intelligence.", "STORM SHIELD: ZERO MEDICAL HALLUCINATIONS · NASA AUTONOMY LEVEL 2")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 09: Live UI Overview Demo (18.0s / 540 frames)
# =========================================================================
def render_scene_09(out_path):
    print("Rendering S09: Live UI Overview & NASA Telemetry (18.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    base_img = Image.open(os.path.join(UI_DIR, "ui_overview.png")).convert("RGB")
    total_frames = 540

    for f in range(total_frames):
        p = f / float(total_frames)
        # Ken Burns pan and zoom into NOAA gauge & DONKI stream
        if p < 0.35:
            # Wide overview
            img = apply_ken_burns(base_img, 1.0, 1.04, 0, 0, 0, 0, p / 0.35)
        elif p < 0.70:
            # Zoom into NOAA and DONKI live telemetry
            sub_p = (p - 0.35) / 0.35
            img = apply_ken_burns(base_img, 1.04, 1.18, 0, 200, 0, -100, sub_p)
        else:
            # Pan to avionics gauges
            sub_p = (p - 0.70) / 0.30
            img = apply_ken_burns(base_img, 1.18, 1.12, 200, -150, -100, 50, sub_p)

        draw = ImageDraw.Draw(img)

        # Dynamic overlay targeting box on NOAA gauge
        box_alpha = int(180 + 70 * math.sin(f * 0.2))
        draw.rounded_rectangle([(1100, 120), (1820, 240)], radius=12, outline=(6, 182, 212), width=3)
        draw.text((1120, 135), "⚡ LIVE TELEMETRY: NOAA SWPC GOES-18", font=get_font(FONT_BOLD, 20), fill=(6, 182, 212))
        draw.text((1120, 170), "0.30 pfu (S0 QUIET) · INGESTION: ACTIVE", font=get_font(FONT_MONO, 17), fill=(241, 245, 249))

        # NASA DONKI callout
        draw.rounded_rectangle([(1100, 260), (1820, 360)], radius=12, outline=(16, 185, 129), width=2)
        draw.text((1120, 275), "🛰️ NASA CCMC DONKI SPACE WEATHER", font=get_font(FONT_BOLD, 19), fill=(16, 185, 129))
        draw.text((1120, 310), "Real-Time SPE & CME Alerts Streamed", font=get_font(FONT_REG, 17), fill=(203, 213, 225))

        draw_top_bar(draw, "WHAT · LIVE DEMO", "STORM SHIELD OVERVIEW HUD & SATELLITE TELEMETRY", (6, 182, 212), f)
        draw_bottom_subtitle(draw, "This is Storm Shield. Our core innovation links space weather directly to human physiology. We ingest live alerts from NASA CCMC DONKI and satellite telemetry from the NOAA Space Weather Prediction Center GOES-16 Proton Flux, benchmarked against the NASA OSDR RadLab Database.", "LIVE DATASETS: NASA CCMC DONKI · NOAA SWPC GOES-18 · NASA OSDR RADLAB")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 10: Live UI Health Twin 3D Laser Scan (10.0s / 300 frames)
# =========================================================================
def render_scene_10(out_path):
    print("Rendering S10: 3D Holographic Health Twin (10.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    base_img = Image.open(os.path.join(UI_DIR, "ui_health_twin.png")).convert("RGB")
    total_frames = 300

    for f in range(total_frames):
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.0, 1.08, 0, 0, 0, 20, p)
        draw = ImageDraw.Draw(img)

        # Active vertical laser scanner beam traveling up and down
        scan_y = int(220 + 380 * (0.5 + 0.5 * math.sin(f * 0.12)))
        draw.line([(400, scan_y), (1100, scan_y)], fill=(6, 182, 212), width=3)
        draw.rectangle([(400, max(220, scan_y - 20)), (1100, scan_y)], fill=(6, 182, 212, 40))

        # Organ targeting beacons
        # Heart
        draw.ellipse([(730, 420), (770, 460)], outline=(244, 63, 94), width=3)
        draw.text((780, 430), "CARDIOVASCULAR (ACT)", font=get_font(FONT_BOLD, 17), fill=(244, 63, 94))
        # Brain
        draw.ellipse([(730, 260), (770, 300)], outline=(56, 189, 248), width=2)
        draw.text((780, 270), "NEUROLOGICAL (NOMINAL)", font=get_font(FONT_BOLD, 17), fill=(56, 189, 248))

        # Artemis 1 Haven callout box
        draw.rounded_rectangle([(1200, 180), (1800, 340)], radius=12, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1220, 205), "🛡️ ARTEMIS I ORION RADIATION PHYSICS", font=get_font(FONT_BOLD, 20), fill=(16, 185, 129))
        draw.text((1220, 245), "• Central Water Wall Haven: 4.0x Dose Reduction\n• Hydrogen-Rich Shielding protects crew during SPEs\n• Evaluated per NASA STD-3001 Vol 1", font=get_font(FONT_REG, 17), fill=(226, 232, 240))

        draw_top_bar(draw, "WHAT · HEALTH TWIN", "3D HOLOGRAPHIC HEALTH TWIN & ARTERIAL MAPPING", (6, 182, 212), f)
        draw_bottom_subtitle(draw, "Applying Artemis I Orion Radiation Measurements, our engine models four-fold shielding protection.", "ARTEMIS I ORION RADIATION MEASUREMENTS · 4.0x HYDROGEN SHIELDING HAVEN")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 11: Live Lead II ECG & Shielding (8.0s / 240 frames)
# =========================================================================
def render_scene_11(out_path):
    print("Rendering S11: Live Lead II ECG Oscilloscope (8.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    base_img = Image.open(os.path.join(UI_DIR, "ui_health_twin.png")).convert("RGB")
    total_frames = 240

    for f in range(total_frames):
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.05, 1.15, 0, 150, 0, 120, p)
        draw = ImageDraw.Draw(img)

        # Overlay real-time active Lead II ECG canvas
        draw.rounded_rectangle([(120, 180), (1050, 680)], radius=16, fill=(10, 18, 32), outline=(6, 182, 212), width=2)
        draw.text((160, 210), "LEAD II ECG OSCILLOSCOPE — 115 BPM (ACUTE TACHYCARDIA)", font=get_font(FONT_BOLD, 22), fill=(248, 113, 113))
        draw_ecg_wave(draw, 160, 270, 840, 260, f, bpm=115, color=(239, 68, 68), thickness=3)

        draw.text((160, 560), "CURRENT HR: 115 BPM  |  BASELINE: 69 BPM  |  Δ +46 BPM ELEVATION", font=get_font(FONT_BOLD, 20), fill=(252, 165, 165))
        draw.text((160, 605), "SYSTOLIC BP: 148 mmHg (STAGE 2) · SPO2: 93% (BORDERLINE HYPOXIA)", font=get_font(FONT_MONO, 17), fill=(251, 146, 60))

        # Right box: NASA Standard 3001
        draw.rounded_rectangle([(1100, 180), (1800, 680)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1140, 220), "NASA HUMAN-SYSTEM STANDARD 3001", font=get_font(FONT_BOLD, 22), fill=(16, 185, 129))
        draw.text((1140, 280), "• Personalized baseline calibration\n• 3-tier persistence gate to avoid false alarms\n• Multi-astronaut telemetry evaluation\n• Autonomous habitat crew alert broadcast\n• Direct transition to Care Mode checklist", font=get_font(FONT_REG, 20), fill=(226, 232, 240))
        draw.text((1140, 520), "STATUS: VERIFIED PERSISTENT DEVIATION", font=get_font(FONT_BOLD, 19), fill=(248, 113, 113))

        draw_top_bar(draw, "WHAT · CLINICAL RULES", "LEAD II ECG SWEEP & NASA STD-3001 CALIBRATION", (6, 182, 212), f)
        draw_bottom_subtitle(draw, "Wearable sensor feeds are evaluated by an interactive Health Twin against the astronaut’s personal baseline and NASA Human-System Standard 3001.", "EVALUATED AGAINST PERSONAL BASELINE & NASA HUMAN-SYSTEM STANDARD 3001")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 12: Emergency Crew Alert Modal (10.0s / 300 frames)
# =========================================================================
def render_scene_12(out_path):
    print("Rendering S12: Emergency Crew Alert Modal (10.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    base_img = Image.open(os.path.join(UI_DIR, "ui_crew_alert.png")).convert("RGB")
    total_frames = 300

    for f in range(total_frames):
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.0, 1.05, 0, 0, 0, 0, p)
        draw = ImageDraw.Draw(img)

        # Flashing red emergency vignette around modal
        pulse = int(50 + 40 * math.sin(f * 0.3))
        draw.rectangle([(0, 75), (W, 75 + pulse)], fill=(pulse * 2, 20, 30))
        draw.rectangle([(0, H - 105 - pulse), (W, H - 105)], fill=(pulse * 2, 20, 30))

        # Persistence Gate Progress Card
        draw.rounded_rectangle([(120, 120), (700, 280)], radius=12, fill=(15, 23, 42), outline=(239, 68, 68), width=3)
        draw.text((150, 140), "ANOMALY PERSISTENCE GATE", font=get_font(FONT_MONO, 18), fill=(252, 165, 165))
        draw.text((150, 180), "GATE 3/3 CONFIRMED", font=get_font(FONT_BOLD, 32), fill=(239, 68, 68))
        draw.text((150, 230), "Auto-Broadcast to All Habitat Terminals", font=get_font(FONT_REG, 17), fill=(226, 232, 240))

        # Multi-tab BroadcastChannel Badge
        draw.rounded_rectangle([(1220, 120), (1800, 240)], radius=12, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        draw.text((1250, 145), "📡 MULTI-TAB BROADCAST CHANNEL", font=get_font(FONT_BOLD, 18), fill=(6, 182, 212))
        draw.text((1250, 185), "Synchronized across 4 Browser Windows", font=get_font(FONT_MONO, 16), fill=(148, 163, 184))

        # Beacon on 'LAUNCH CARE MODE'
        draw.rounded_rectangle([(820, 680), (1100, 740)], radius=8, outline=(16, 185, 129), width=3)
        draw.text((850, 700), "➜ LAUNCH CARE MODE", font=get_font(FONT_BOLD, 18), fill=(16, 185, 129))

        draw_top_bar(draw, "WHAT · EMERGENCY", "TRIAGE PERSISTENCE GATE & HABITAT CREW BROADCAST", (244, 63, 94), f)
        draw_bottom_subtitle(draw, "In this live demonstration, Pilot Alex Vance develops acute distress. Our persistence engine confirms the anomaly, alerts the crew across browser tabs, and opens Care Mode.", "PERSISTENCE GATE 3/3: BROADCASTS ALERT ACROSS BROWSER TABS & OPENS CARE MODE")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 13: Care Mode Allergy Lock & Handoff (11.0s / 330 frames)
# =========================================================================
def render_scene_13(out_path):
    print("Rendering S13: Care Mode Allergy Lock & Handoff (11.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    care_img = Image.open(os.path.join(UI_DIR, "ui_care_mode.png")).convert("RGB")
    handoff_img = Image.open(os.path.join(UI_DIR, "ui_handoff.png")).convert("RGB")
    total_frames = 330

    for f in range(total_frames):
        p = f / float(total_frames)

        if p < 0.55:
            # Care Mode showing Allergy Lock
            sub_p = p / 0.55
            img = apply_ken_burns(care_img, 1.0, 1.08, 0, -50, 0, 50, sub_p)
            draw = ImageDraw.Draw(img)

            # Prominent Glowing Red Box over the Contraindication Banner
            draw.rounded_rectangle([(180, 480), (1200, 680)], radius=16, fill=(20, 10, 15), outline=(244, 63, 94), width=3)
            draw.text((220, 510), "🚫 STRICT CONTRAINDICATION: ASPIRIN BLOCKED", font=get_font(FONT_BOLD, 26), fill=(248, 113, 113))
            draw.text((220, 560), "Patient Alex Vance has a documented NSAID / Aspirin Allergy.\nAdministration would trigger life-threatening acute bronchospasm.\nStorm Shield overrides protocol and locks medication administration.", font=get_font(FONT_REG, 20), fill=(254, 205, 211))
            draw.text((220, 640), "SAFETY OVERRIDE: GUARANTEED ZERO CLINICAL ACCIDENTS", font=get_font(FONT_MONO, 17), fill=(244, 63, 94))
        else:
            # 30-Second Flight Surgeon Handoff
            sub_p = (p - 0.55) / 0.45
            img = apply_ken_burns(handoff_img, 1.0, 1.06, 0, 50, 0, -20, sub_p)
            draw = ImageDraw.Draw(img)

            # Highlight Box on 30s Handoff Brief
            draw.rounded_rectangle([(1050, 150), (1800, 360)], radius=14, fill=(15, 23, 42), outline=(16, 185, 129), width=3)
            draw.text((1080, 180), "📋 30-SECOND FLIGHT SURGEON BRIEF", font=get_font(FONT_BOLD, 24), fill=(16, 185, 129))
            draw.text((1080, 225), "• NASA EIMO Standard Format (SBAR Summary)\n• Instant 1-Click Generation & Export\n• Ready for Ground Flight Surgeon Review\n• Zero manual transcription overhead", font=get_font(FONT_REG, 19), fill=(226, 232, 240))

        draw_top_bar(draw, "WHAT · SAFETY", "ALLERGY CONTRAINDICATION LOCK & 30-SECOND HANDOFF", (16, 185, 129), f)
        draw_bottom_subtitle(draw, "Because Alex has an aspirin allergy, administration is strictly blocked, instantly creating a thirty-second flight surgeon handoff.", "ASPIRIN ALLERGY BLOCKED · 1-CLICK 30-SECOND FLIGHT SURGEON BRIEF GENERATION")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 14: NASA Autonomy Level 2 (18.0s / 540 frames)
# =========================================================================
def render_scene_14(out_path):
    print("Rendering S14: NASA Autonomy Level 2 (18.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 540

    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        # Floating ambient dust particles
        for i in range(40):
            px = int((i * 149 + f * 1.8) % W)
            py = int((i * 83 + f * 0.9) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(30, 60, 90))

        draw.text((120, 115), "NASA AUTONOMY LADDER FOR HUMAN SPACE MISSIONS", font=get_font(FONT_MONO, 20), fill=(16, 185, 129))
        draw.text((120, 150), "WHY LEVEL 2 AUTONOMY GUARANTEES ZERO HALLUCINATIONS", font=get_font(FONT_BOLD, 40), fill=(241, 245, 249))

        # 5-Tier Autonomy Ladder
        ladder = [
            ("LEVEL 5", "FULL AUTONOMY (AI acts with zero human oversight - UNACCEPTABLE IN HEALTHCARE)", (71, 85, 105)),
            ("LEVEL 4", "SUPERVISED AUTONOMY (System initiates invasive medical interventions)", (71, 85, 105)),
            ("LEVEL 3", "SHARED AUTONOMY (Joint executive clinical actions)", (71, 85, 105)),
            ("LEVEL 2", "HUMAN ACTS — STORM SHIELD OPERATIONAL TIER\nSoftware visualizes, calculates, alerts, and records; Crew retains executive agency", (16, 185, 129)),
            ("LEVEL 1", "TELE-OPERATION (Complete ground control - FAILS ON MARS TRANSIT)", (71, 85, 105))
        ]

        y_l = 230
        for lvl, desc, col in ladder:
            is_our_level = (lvl == "LEVEL 2")
            box_h = 110 if is_our_level else 65

            draw.rounded_rectangle([(120, y_l), (1150, y_l + box_h)], radius=12, fill=(20, 35, 45) if is_our_level else (15, 20, 32), outline=col, width=3 if is_our_level else 1)
            # Level pill
            draw.rounded_rectangle([(140, y_l + 12), (250, y_l + 52)], radius=6, fill=col)
            draw.text((155, y_l + 20), lvl, font=get_font(FONT_BOLD, 18), fill=(10, 15, 30))

            if is_our_level:
                lines = desc.split("\n")
                draw.text((275, y_l + 16), lines[0], font=get_font(FONT_BOLD, 22), fill=(52, 211, 153))
                draw.text((275, y_l + 55), lines[1], font=get_font(FONT_REG, 18), fill=(226, 232, 240))
                # Pulsing beacon indicator
                p_rad = int(8 + 6 * math.sin(f * 0.25))
                draw.ellipse([(1110 - p_rad, y_l + 35 - p_rad), (1110 + p_rad, y_l + 35 + p_rad)], outline=(16, 185, 129), width=2)
                draw.ellipse([(1106, y_l + 31), (1114, y_l + 39)], fill=(16, 185, 129))
            else:
                draw.text((275, y_l + 20), desc, font=get_font(FONT_REG, 16), fill=(148, 163, 184))
            y_l += box_h + 18

        # Right Card: Zero Hallucination Seal
        draw.rounded_rectangle([(1220, 230), (1800, 730)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        # Seal icon
        cx, cy = 1510, 350
        draw.ellipse([(cx - 90, cy - 90), (cx + 90, cy + 90)], outline=(16, 185, 129), width=3)
        draw.ellipse([(cx - 75, cy - 75), (cx + 75, cy + 75)], outline=(52, 211, 153), width=1)
        # Rotating neon arcs around seal
        for r_ang, arc_col in [(f * 0.08, (16, 185, 129)), (-f * 0.1, (52, 211, 153))]:
            st_deg = int(math.degrees(r_ang)) % 360
            draw.arc([(cx - 105, cy - 105), (cx + 105, cy + 105)], st_deg, st_deg + 130, fill=arc_col, width=2)

        draw.text((cx - 45, cy - 20), "100%", font=get_font(FONT_BOLD, 36), fill=(16, 185, 129))
        draw.text((cx - 65, cy + 25), "DETERMINISTIC", font=get_font(FONT_MONO, 14), fill=(241, 245, 249))

        draw.text((1260, 480), "CLINICAL SAFETY GUARANTEES", font=get_font(FONT_BOLD, 22), fill=(16, 185, 129))
        draw.text((1260, 525), "• ZERO generative AI black boxes\n• ZERO probabilistic dosage hallucinations\n• All logic grounded in NASA STD-3001\n• Complete audit trail & retrace mode", font=get_font(FONT_REG, 19), fill=(226, 232, 240))

        draw_top_bar(draw, "IMPACT · AUTONOMY", "NASA AUTONOMY LADDER LEVEL 2 ('HUMAN ACTS')", (16, 185, 129), f)
        draw_bottom_subtitle(draw, "Who benefits? Astronauts and Crew Medical Officers gain an immediate, panic-free co-pilot. Crucially, Storm Shield operates at NASA Autonomy Ladder Level 2: the human acts, while the software visualizes, calculates, alerts, and records. We guarantee zero medical hallucinations by eliminating generative black boxes from the clinical path.", "NASA LEVEL 2 AUTONOMY: HUMAN IN THE LOOP · ZERO MEDICAL HALLUCINATIONS")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 15: 47 Unit Tests & Terrestrial Impact (18.0s / 540 frames)
# =========================================================================
def render_scene_15(out_path):
    print("Rendering S15: 47 Unit Tests & Earth Impact (18.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 540

    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (8, 12, 24))
        draw = ImageDraw.Draw(img)

        # Ambient floating tech particles in background
        for i in range(40):
            px = int((i * 131 + f * 1.6) % W)
            py = int((i * 79 + f * 1.0) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(30, 55, 85))

        draw.text((120, 115), "RIGOROUS VERIFICATION & BEYOND-SPACE APPLICATION", font=get_font(FONT_MONO, 20), fill=(16, 185, 129))
        draw.text((120, 150), "FROM DEEP SPACE TO EXTREME EARTH ENVIRONMENTS", font=get_font(FONT_BOLD, 40), fill=(241, 245, 249))

        # Left: Animated Terminal Window
        draw.rounded_rectangle([(120, 230), (950, 730)], radius=12, fill=(15, 20, 30), outline=(56, 189, 248), width=2)
        # Terminal top bar
        draw.rectangle([(120, 230), (950, 275)], fill=(20, 30, 45))
        draw.ellipse([(140, 245), (154, 259)], fill=(239, 68, 68))
        draw.ellipse([(164, 245), (178, 259)], fill=(245, 158, 11))
        draw.ellipse([(188, 245), (202, 259)], fill=(16, 185, 129))
        draw.text((220, 243), "bash — storm-shield-test-runner", font=get_font(FONT_MONO, 14), fill=(148, 163, 184))

        # Terminal lines
        term_lines = [
            ("$ npm test -- --run", (241, 245, 249)),
            ("✓ test/assess.test.js (14 tests passed)", (52, 211, 153)),
            ("✓ test/storm.test.js (11 tests passed)", (52, 211, 153)),
            ("✓ test/care.test.js (12 tests passed)", (52, 211, 153)),
            ("✓ test/nasaApi.test.js (10 tests passed)", (52, 211, 153)),
            ("───────────────────────────────────────────", (71, 85, 105)),
            ("Test Suites: 4 passed, 4 total", (241, 245, 249)),
            ("Tests:       47 passed, 47 total (100% Pass Rate)", (16, 185, 129)),
            ("Snapshots:   0 failed", (148, 163, 184)),
            ("Time:        1.14s | Zero unanchored clinical data", (6, 182, 212))
        ]
        y_t = 300
        for line, col in term_lines:
            draw.text((150, y_t), line, font=get_font(FONT_MONO, 18), fill=col)
            y_t += 40

        # Blinking terminal block cursor
        if (f // 8) % 2 == 0:
            draw.rectangle([(620, y_t - 40), (635, y_t - 20)], fill=(16, 185, 129))

        # Right: Terrestrial Impact Cards
        draw.rounded_rectangle([(1020, 230), (1800, 730)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1060, 265), "TERRESTRIAL EARTH DEPLOYMENTS", font=get_font(FONT_BOLD, 26), fill=(16, 185, 129))

        terrestrial = [
            ("1. ANTARCTICA CONCORDIA STATION", "Extreme isolation, zero winter evacuation, limited medical staff", (56, 189, 248)),
            ("2. DEEP SUBMERSIBLE & NAVAL FLEETS", "Complete underwater radio blackout, offline deterministic protocols", (52, 211, 153)),
            ("3. REMOTE DISASTER & CONFLICT ZONES", "Earthquakes, humanitarian crises with collapsed telecommunication grids", (245, 158, 11))
        ]
        y_terr = 330
        for i, (t_title, t_desc, t_col) in enumerate(terrestrial):
            draw.rounded_rectangle([(1060, y_terr), (1760, y_terr + 105)], radius=10, fill=(20, 30, 45), outline=t_col, width=1)
            draw.text((1085, y_terr + 18), t_title, font=get_font(FONT_BOLD, 20), fill=t_col)
            draw.text((1085, y_terr + 55), t_desc, font=get_font(FONT_REG, 17), fill=(226, 232, 240))

            # Active pulsing radar beacon on each deployment
            r_pulse = int(10 + 8 * math.sin(f * 0.2 + i * 1.5))
            draw.ellipse([(1720 - r_pulse, y_terr + 35 - r_pulse), (1720 + r_pulse, y_terr + 35 + r_pulse)], outline=t_col, width=2)
            draw.ellipse([(1716, y_terr + 31), (1724, y_terr + 39)], fill=t_col)

            y_terr += 125

        draw_top_bar(draw, "IMPACT · VERIFICATION", "47 AUTOMATED UNIT TESTS & TERRESTRIAL IMPACT", (16, 185, 129), f)
        draw_bottom_subtitle(draw, "What changes is total situational clarity. Our deterministic engine has passed forty-seven automated unit tests with zero unanchored data. And this innovation extends beyond space: the same offline architecture can bring life-saving decision support to Antarctic research bases, naval vessels, and remote disaster zones on Earth.", "47 AUTOMATED UNIT TESTS (100% PASS) · TERRESTRIAL OFFLINE RESILIENCE")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 16: Engineering Roadmap (19.0s / 570 frames)
# =========================================================================
def render_scene_16(out_path):
    print("Rendering S16: Future Roadmap (19.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 570

    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        draw.text((120, 115), "STORM SHIELD ADVANCED ROADMAP", font=get_font(FONT_MONO, 20), fill=(6, 182, 212))
        draw.text((120, 150), "FROM DECISION SUPPORT TO AMBIENT CLINICAL INTELLIGENCE", font=get_font(FONT_BOLD, 38), fill=(241, 245, 249))

        phases = [
            ("PHASE 1", "AUTONOMOUS DECISION SUPPORT", "ACHIEVED / ACTIVE", (16, 185, 129), [
                "• NASA STD-3001 Clinical Knowledge Engine",
                "• Real-time NOAA GOES-18 & NASA DONKI API",
                "• 47 Automated Unit Tests Passing (100%)",
                "• Instant 30-Second Flight Surgeon Handoff"
            ]),
            ("PHASE 2", "BLUETOOTH BLE HARDWARE SENSORS", "IN PROGRESS (Q1 2027)", (6, 182, 212), [
                "• Direct Web Bluetooth API integration",
                "• CSA Bio-Monitor flight harness ingestion",
                "• Multi-lead continuous ECG & pulse oximetry",
                "• Active habitat ambient radiation dosimeters"
            ]),
            ("PHASE 3", "ON-DEVICE PRIVATE CLINICAL SLM", "PLANNED (Q3 2027)", (168, 85, 247), [
                "• Edge-quantized Small Language Model",
                "• Hands-free ambient voice transcription",
                "• 100% Offline execution inside habitat",
                "• Strictly air-gapped clinical documentation"
            ])
        ]

        # Horizontal connecting data bus line
        draw.line([(280, 240), (1640, 240)], fill=(30, 41, 59), width=3)
        # Pulse traveling along bus
        pulse_x = int(280 + ((f * 5) % 1360))
        draw.ellipse([(pulse_x - 8, 232), (pulse_x + 8, 248)], fill=(6, 182, 212))

        col_w = 500
        for i, (p_tag, p_title, p_status, p_col, p_bullets) in enumerate(phases):
            cx = 120 + i * 580
            draw.rounded_rectangle([(cx, 280), (cx + col_w, 740)], radius=16, fill=(15, 23, 42), outline=p_col, width=2)

            # Node beacon on timeline
            draw.ellipse([(cx + 250 - 15, 225), (cx + 250 + 15, 255)], fill=p_col)

            # Header
            draw.rectangle([(cx, 280), (cx + col_w, 360)], fill=(20, 30, 45))
            draw.text((cx + 25, 295), p_tag, font=get_font(FONT_MONO, 16), fill=p_col)
            draw.text((cx + 25, 325), p_title, font=get_font(FONT_BOLD, 21), fill=(241, 245, 249))

            # Status pill
            draw.rounded_rectangle([(cx + 25, 380), (cx + 340, 415)], radius=6, fill=p_col)
            draw.text((cx + 40, 390), p_status, font=get_font(FONT_BOLD, 15), fill=(10, 15, 30))

            y_b = 450
            for b in p_bullets:
                draw.text((cx + 25, y_b), b, font=get_font(FONT_REG, 17), fill=(203, 213, 225))
                y_b += 65

        draw_top_bar(draw, "IMPACT · ROADMAP", "ENGINEERING ROADMAP: SENSORS & PRIVATE EDGE SLM", (6, 182, 212), f)
        draw_bottom_subtitle(draw, "Looking forward, we are advancing Storm Shield toward hardware Bluetooth integration with flight-certified biometrics and private on-device language models for ambient medical charting.", "ROADMAP: CSA BIO-MONITOR BLUETOOTH BLE INTEGRATION & PRIVATE SLM CHARTING")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# SCENE 17: Grand Finale & Sign-Off (16.0s / 480 frames)
# =========================================================================
def render_scene_17(out_path):
    print("Rendering S17: Grand Finale & Sign-Off (16.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 480

    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (8, 12, 24))
        draw = ImageDraw.Draw(img)

        # Starfield
        draw_3d_starfield(draw, speed=5)

        # Radiant nebula aura in center
        cx, cy = 960, 420
        aur_r = int(220 + 30 * math.sin(f * 0.08))
        draw.ellipse([(cx - aur_r, cy - aur_r), (cx + aur_r, cy + aur_r)], outline=(6, 182, 212), width=1)
        draw.ellipse([(cx - aur_r*2//3, cy - aur_r*2//3), (cx + aur_r*2//3, cy + aur_r*2//3)], outline=(16, 185, 129), width=1)

        # Shield emblem in center
        draw.polygon([(cx, cy - 100), (cx + 80, cy - 40), (cx + 60, cy + 80), (cx, cy + 120), (cx - 60, cy + 80), (cx - 80, cy - 40)], fill=(15, 23, 42), outline=(245, 158, 11), width=4)
        draw.text((cx - 36, cy - 25), "🛡️", font=get_font(FONT_BOLD, 48), fill=(255, 255, 255))

        # Big Finale Headline
        draw.text((360, 160), "“IN DEEP SPACE, AUTONOMY IS NOT A LUXURY —", font=get_font(FONT_BOLD, 46), fill=(241, 245, 249))
        draw.text((720, 230), "IT IS SURVIVAL.”", font=get_font(FONT_BOLD, 54), fill=(251, 191, 36))

        # Bottom Competition Card
        draw.rounded_rectangle([(380, 620), (1540, 840)], radius=16, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        draw.text((430, 650), "STORM SHIELD", font=get_font(FONT_BOLD, 36), fill=(56, 189, 248))
        draw.text((430, 705), "TEAM EXTOKENED · BANGLADESH 🇧🇩", font=get_font(FONT_BOLD, 24), fill=(245, 158, 11))
        draw.text((430, 745), "NASA INTERNATIONAL SPACE APPS CHALLENGE 2026", font=get_font(FONT_MONO, 19), fill=(16, 185, 129))
        draw.text((430, 785), "Sajidul Islam Sobuj (Lead Architect)  ·  Yarin (Clinical Researcher)", font=get_font(FONT_REG, 20), fill=(226, 232, 240))

        draw_top_bar(draw, "FINALE", "HUMAN MISSIONS TO MARS: NEVER FACE THE STORM ALONE", (245, 158, 11), f)
        draw_bottom_subtitle(draw, "In deep space, autonomy is not a luxury — it is survival. We are Team Extokened. With Storm Shield, wherever humanity journeys, our astronauts will never face the storm alone.", "TEAM EXTOKENED · NASA SPACE APPS CHALLENGE 2026 · THANK YOU")
        pipe.stdin.write(img.tobytes())
    pipe.stdin.close()
    pipe.wait()

# =========================================================================
# MASTER GENERATOR PIPELINE
# =========================================================================
def build_all_animated_clips():
    generators = [
        (render_scene_01, "clip_S01.mp4"),
        (render_scene_02, "clip_S02.mp4"),
        (render_scene_03, "clip_S03.mp4"),
        (render_scene_04, "clip_S04.mp4"),
        (render_scene_05, "clip_S05.mp4"),
        (render_scene_06, "clip_S06.mp4"),
        (render_scene_07, "clip_S07.mp4"),
        (render_scene_08, "clip_S08.mp4"),
        (render_scene_09, "clip_S09.mp4"),
        (render_scene_10, "clip_S10.mp4"),
        (render_scene_11, "clip_S11.mp4"),
        (render_scene_12, "clip_S12.mp4"),
        (render_scene_13, "clip_S13.mp4"),
        (render_scene_14, "clip_S14.mp4"),
        (render_scene_15, "clip_S15.mp4"),
        (render_scene_16, "clip_S16.mp4"),
        (render_scene_17, "clip_S17.mp4"),
    ]

    for gen_func, fname in generators:
        out_path = os.path.join(CLIPS_DIR, fname)
        gen_func(out_path)
        print(f"✓ Generated: {out_path}")

    print("\nAll 17 high-fidelity animated clips rendered successfully!")

if __name__ == "__main__":
    build_all_animated_clips()
