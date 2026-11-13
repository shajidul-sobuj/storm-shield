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
    # Sleek 72px top HUD ribbon
    draw.rectangle([(0, 0), (W, 72)], fill=(8, 14, 26))
    draw.line([(0, 72), (W, 72)], fill=(30, 41, 59), width=2)

    # Section tag pill
    draw.rounded_rectangle([(35, 15), (220, 56)], radius=6, fill=section_color)
    f_tag = get_font(FONT_BOLD, 17)
    draw.text((50, 24), section_tag, font=f_tag, fill=(10, 15, 30))

    # Section title
    f_title = get_font(FONT_BOLD, 22)
    draw.text((245, 23), title_text, font=f_title, fill=(241, 245, 249))

    # Pulsing live beacon
    pulse = int(128 + 127 * math.sin(frame_idx * 0.2))
    draw.ellipse([(W - 460, 31), (W - 446, 45)], fill=(16, 185, 129))

    # Mission clock
    f_meta = get_font(FONT_MONO, 15)
    sec = (frame_idx // FPS) % 60
    draw.text((W - 435, 26), f"STORM SHIELD 🛡️  |  MET 142:18:{sec:02d}", font=f_meta, fill=(148, 163, 184))

# =========================================================================
# PROFESSIONAL KINETIC SUBTITLE ENGINE (Karaoke / 3-5 Word Dynamic Pill)
# =========================================================================
def draw_kinetic_subtitle(draw, subs, t):
    cur_sub = None
    for (t0, t1, text) in subs:
        if t0 <= t < t1:
            cur_sub = (t0, t1, text)
            break
    if not cur_sub:
        return

    t0, t1, text = cur_sub
    words = text.split()
    if not words:
        return

    # Calculate active spoken word index
    prog = max(0.0, min(0.999, (t - t0) / max(0.01, (t1 - t0))))
    active_idx = min(len(words) - 1, int(prog * len(words)))

    f_bold = get_font(FONT_BOLD, 26)
    f_reg = get_font(FONT_REG, 26)

    # Calculate widths
    word_widths = [draw.textbbox((0, 0), w, font=f_bold)[2] for w in words]
    space_w = draw.textbbox((0, 0), ' ', font=f_bold)[2]
    total_w = sum(word_widths) + space_w * (len(words) - 1)

    pill_w = max(260, total_w + 64)
    pill_h = 58
    cx = W // 2
    cy = H - 75
    x1, y1 = cx - pill_w // 2, cy - pill_h // 2
    x2, y2 = cx + pill_w // 2, cy + pill_h // 2

    # Draw dark frosted glass pill with cyan/gold border
    draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=16, fill=(10, 16, 28), outline=(6, 182, 212), width=2)
    # Status micro dot
    draw.ellipse([(x1 + 18, cy - 4), (x1 + 26, cy + 4)], fill=(245, 158, 11))

    # Render words with active word in radiant yellow
    cur_x = x1 + 42
    text_y = cy - 15
    for i, w in enumerate(words):
        is_active = (i == active_idx)
        col = (250, 204, 21) if is_active else (255, 255, 255)
        fnt = f_bold if is_active else f_reg
        draw.text((cur_x, text_y), w, font=fnt, fill=col)
        cur_x += word_widths[i] + space_w

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
        if 0 <= sx < W and 72 <= sy < H - 85:
            b = int(255 * (1.0 - s[2] / 1000.0))
            draw.ellipse([(sx - sz, sy - sz), (sx + sz, sy + sz)], fill=(b, b, min(255, b + 40)))

# Ken Burns Pan & Zoom Helper
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
# SCENE 01: Hook 1 - Deep Space Emergency (8.0s / 240 frames)
# =========================================================================
def render_scene_01(out_path):
    print("Rendering S01: Deep Space Hook (8.0s)...")
    pipe = open_ffmpeg_pipe(out_path)
    total_frames = 240

    subs = [
        (2.0, 3.4, "Fifty million miles"),
        (3.4, 4.8, "from Earth, in the silent void"),
        (4.8, 6.2, "of deep space, an alarm"),
        (6.2, 7.8, "breaks the silence.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (6, 10, 20))
        draw = ImageDraw.Draw(img)

        # 3D Stars
        draw_3d_starfield(draw, speed=9)

        # Mars in distance
        mars_x, mars_y = 1520, 300
        draw.ellipse([(mars_x - 100, mars_y - 100), (mars_x + 100, mars_y + 100)], fill=(185, 60, 30))
        draw.ellipse([(mars_x - 80, mars_y - 80), (mars_x + 65, mars_y + 65)], fill=(215, 80, 40))
        pulse_g = int(20 * math.sin(f * 0.1))
        draw.ellipse([(mars_x - 115, mars_y - 115), (mars_x + 115, mars_y + 115)], outline=(244, 63, 94), width=2)
        draw.text((mars_x - 50, mars_y + 120), "MARS TRANSIT", font=get_font(FONT_MONO, 15), fill=(251, 146, 60))

        # Spacecraft silhouette with cyan plume
        ship_x = 320 + int(f * 2.0)
        ship_y = 440 + int(8 * math.sin(f * 0.05))
        plume_w = 40 + int(15 * math.sin(f * 0.4))
        draw.polygon([(ship_x - 100 - plume_w, ship_y), (ship_x - 90, ship_y - 10), (ship_x - 90, ship_y + 10)], fill=(6, 182, 212))
        draw.polygon([(ship_x, ship_y), (ship_x - 90, ship_y - 25), (ship_x - 80, ship_y), (ship_x - 90, ship_y + 25)], fill=(203, 213, 225))
        draw.polygon([(ship_x + 20, ship_y), (ship_x - 20, ship_y - 12), (ship_x - 20, ship_y + 12)], fill=(241, 245, 249))

        # Main headline
        draw.text((140, 160), "50,000,000 MILES FROM EARTH...", font=get_font(FONT_BOLD, 48), fill=(248, 113, 113))
        draw.text((140, 225), "Deep-space translunar habitat · Earth out of reach by radio.", font=get_font(FONT_REG, 24), fill=(226, 232, 240))

        # Warning Card
        draw.rounded_rectangle([(140, 290), (960, 560)], radius=16, fill=(15, 23, 42), outline=(239, 68, 68), width=3)
        draw.text((175, 320), "⚠️  CRITICAL ALERT: SOLAR STORM ERUPTION", font=get_font(FONT_BOLD, 26), fill=(252, 165, 165))
        draw.text((175, 375), "• Energetic Proton Flux: > 4,200 pfu (S3 Severe SPE)", font=get_font(FONT_REG, 21), fill=(241, 245, 249))
        draw.text((175, 420), "• Astronaut Vitals: Acute Tachycardia + SpO2 Decline", font=get_font(FONT_REG, 21), fill=(241, 245, 249))
        draw.text((175, 465), "• Physician on Board: NONE · Radio Delay: 22 Minutes", font=get_font(FONT_BOLD, 21), fill=(251, 146, 60))

        # Radar scanner on right
        rx, ry, rad = 1520, 580, 95
        draw.ellipse([(rx - rad, ry - rad), (rx + rad, ry + rad)], outline=(56, 189, 248), width=2)
        ang = f * 0.12
        draw.line([(rx, ry), (rx + int(rad * math.cos(ang)), ry + int(rad * math.sin(ang)))], fill=(239, 68, 68), width=3)
        draw.text((rx - 65, ry + rad + 12), "RADIATION RADAR", font=get_font(FONT_MONO, 13), fill=(248, 113, 113))

        draw_top_bar(draw, "WHO · HOOK", "DEEP SPACE TRANSLUNAR TRANSIT", (244, 63, 94), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (0.3, 1.8, "A solar storm has erupted,"),
        (1.8, 3.4, "and an astronaut’s vital signs"),
        (3.4, 5.0, "are dropping. No doctor on board,"),
        (5.0, 6.8, "Mission Control is twenty minutes away.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (12, 16, 28))
        draw = ImageDraw.Draw(img)

        # Flashing red emergency vignette
        flash = int(50 + 40 * math.sin(f * 0.35))
        draw.rectangle([(0, 72), (W, 72 + flash)], fill=(flash*2, 20, 30))
        draw.rectangle([(0, H - 85 - flash), (W, H - 85)], fill=(flash*2, 20, 30))
        draw.rectangle([(0, 72), (flash, H - 85)], fill=(flash*2, 20, 30))
        draw.rectangle([(W - flash, 72), (W, H - 85)], fill=(flash*2, 20, 30))

        draw.text((120, 110), "CRITICAL ALERT · CREW VITALS DEVIATION", font=get_font(FONT_BOLD, 42), fill=(248, 113, 113))

        # Left Info Card
        draw.rounded_rectangle([(120, 180), (950, 650)], radius=16, fill=(15, 23, 42), outline=(244, 63, 94), width=2)
        draw.text((155, 215), "NASA EARTH-INDEPENDENT MEDICAL CHALLENGE", font=get_font(FONT_BOLD, 23), fill=(56, 189, 248))
        metrics = [
            ("Speed-of-light One-Way Delay:", "20 to 22 Minutes"),
            ("Round-Trip to Mission Control:", "40 to 44 Minutes"),
            ("Solar Conjunction Blackout:", "Up to 2 Weeks (Zero Signal)"),
            ("Onboard Physician Available:", "None Guaranteed"),
            ("Astronaut Role in Emergency:", "Autonomous First Responders")
        ]
        y_pos = 280
        for label, val in metrics:
            draw.text((155, y_pos), label, font=get_font(FONT_REG, 20), fill=(148, 163, 184))
            draw.text((600, y_pos), val, font=get_font(FONT_BOLD, 20), fill=(241, 245, 249))
            y_pos += 65

        # Right ECG Card
        draw.rounded_rectangle([(1010, 180), (1800, 650)], radius=16, fill=(15, 23, 42), outline=(239, 68, 68), width=2)
        draw.text((1045, 215), "REAL-TIME LEAD II ECG: TACHYCARDIA", font=get_font(FONT_BOLD, 23), fill=(248, 113, 113))
        draw_ecg_wave(draw, 1045, 270, 720, 240, f, bpm=125, color=(239, 68, 68), thickness=3)

        draw.text((1045, 540), "HEART RATE: 125 BPM", font=get_font(FONT_BOLD, 22), fill=(252, 165, 165))
        draw.text((1440, 540), "SpO2: 91% (HYPOXIA)", font=get_font(FONT_BOLD, 22), fill=(251, 146, 60))
        draw.text((1045, 585), "STATUS: PERSISTENCE GATE 3/3 LATCHED", font=get_font(FONT_MONO, 17), fill=(239, 68, 68))

        draw_top_bar(draw, "WHO · HOOK", "COMMUNICATION DELAY & CREW ISOLATION", (244, 63, 94), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (4.5, 6.2, "We are Team Extokened"),
        (6.2, 7.8, "from Bangladesh."),
        (7.8, 9.8, "I am Sajidul Islam Sobuj,"),
        (9.8, 11.0, "lead software architect,"),
        (11.0, 12.5, "alongside clinical researcher Yarin.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 15, 28))
        draw = ImageDraw.Draw(img)

        # Ambient floating particle dust
        for i in range(40):
            px = int((i * 137 + f * 1.5) % W)
            py = int((i * 97 + f * 0.8) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(40, 70, 120))

        # Main Title Banner
        draw.text((120, 100), "NASA INTERNATIONAL SPACE APPS CHALLENGE 2026", font=get_font(FONT_MONO, 20), fill=(6, 182, 212))
        draw.text((120, 135), "MEET THE BUILDERS OF STORM SHIELD", font=get_font(FONT_BOLD, 42), fill=(241, 245, 249))

        # Top Banner Card: Team Extokened (Centered, symmetrical)
        draw.rounded_rectangle([(360, 200), (1560, 330)], radius=16, fill=(15, 23, 42), outline=(245, 158, 11), width=2)
        # Traveling neon tracer
        t_pos = (f * 14) % (1200 * 2 + 130 * 2)
        if t_pos < 1200:
            tx, ty = 360 + t_pos, 200
        elif t_pos < 1200 + 130:
            tx, ty = 1560, 200 + (t_pos - 1200)
        elif t_pos < 1200 * 2 + 130:
            tx, ty = 1560 - (t_pos - 1200 - 130), 330
        else:
            tx, ty = 360, 330 - (t_pos - 1200 * 2 - 130)
        draw.ellipse([(tx - 6, ty - 6), (tx + 6, ty + 6)], fill=(251, 191, 36))

        draw.text((400, 225), "TEAM EXTOKENED · BANGLADESH 🇧🇩", font=get_font(FONT_BOLD, 32), fill=(251, 191, 36))
        draw.text((400, 275), "Mission: Autonomous Clinical Decision Support for Deep Space Missions · Global Finalist", font=get_font(FONT_REG, 20), fill=(226, 232, 240))

        # Bottom Left Card: Sajidul Islam Sobuj (Architect)
        draw.rounded_rectangle([(160, 370), (920, 650)], radius=16, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        # Icon box
        draw.rounded_rectangle([(195, 400), (255, 460)], radius=8, fill=(6, 182, 212))
        draw.text((210, 412), "👨‍💻", font=get_font(FONT_BOLD, 30), fill=(255, 255, 255))
        draw.text((280, 405), "SAJIDUL ISLAM SOBUJ", font=get_font(FONT_BOLD, 28), fill=(56, 189, 248))
        draw.text((280, 445), "LEAD SOFTWARE ARCHITECT", font=get_font(FONT_MONO, 16), fill=(6, 182, 212))
        draw.text((195, 490), "• Full-Stack Architecture & Real-Time Engine\n• Live NOAA SWPC & NASA DONKI Ingestion\n• 47 Automated Deterministic Tests (100% Pass)", font=get_font(FONT_REG, 19), fill=(203, 213, 225))

        # Bottom Right Card: Yarin (Clinical Researcher)
        draw.rounded_rectangle([(1000, 370), (1760, 650)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        # Icon box
        draw.rounded_rectangle([(1035, 400), (1095, 460)], radius=8, fill=(16, 185, 129))
        draw.text((1050, 412), "👩‍⚕️", font=get_font(FONT_BOLD, 30), fill=(255, 255, 255))
        draw.text((1120, 405), "YARIN", font=get_font(FONT_BOLD, 28), fill=(52, 211, 153))
        draw.text((1120, 445), "CLINICAL RESEARCHER", font=get_font(FONT_MONO, 16), fill=(16, 185, 129))
        draw.text((1035, 490), "• NASA STD-3001 Human-System Integration\n• Artemis I 4.0x Shielding Haven Calculations\n• Space Physiology, Allergy Locks & Care Protocols", font=get_font(FONT_REG, 19), fill=(203, 213, 225))

        draw_top_bar(draw, "WHO · TEAM", "TEAM EXTOKENED (BANGLADESH)", (245, 158, 11), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (2.5, 4.5, "As humanity prepares"),
        (4.5, 6.5, "to return to the Moon"),
        (6.5, 8.2, "and journey to Mars,"),
        (8.2, 10.0, "we created Storm Shield —"),
        (10.0, 11.5, "an autonomous medical guardian"),
        (11.5, 13.5, "when Earth is out of reach.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 16, 30))
        draw = ImageDraw.Draw(img)

        draw_3d_starfield(draw, speed=4)

        draw.text((120, 100), "AUTONOMOUS MEDICAL GUARDIAN FOR DEEP SPACE", font=get_font(FONT_MONO, 19), fill=(6, 182, 212))
        draw.text((120, 135), "STORM SHIELD: ARCHITECTURE & MISSION TRAJECTORY", font=get_font(FONT_BOLD, 42), fill=(241, 245, 249))

        # Central 3D Shield Emblem with rotating rings
        cx, cy = 960, 360
        rot = f * 0.05
        for r_ang, col in [(rot, (6, 182, 212)), (rot + math.pi/2, (16, 185, 129))]:
            pts = []
            for a in range(60):
                th = a * 2 * math.pi / 60
                px = cx + int(180 * math.cos(th) * math.cos(r_ang) - 75 * math.sin(th) * math.sin(r_ang))
                py = cy + int(180 * math.cos(th) * math.sin(r_ang) + 75 * math.sin(th) * math.cos(r_ang))
                pts.append((px, py))
            draw.line(pts + [pts[0]], fill=col, width=2)

        # Shield Polygon
        draw.polygon([(cx, cy - 75), (cx + 60, cy - 30), (cx + 45, cy + 55), (cx, cy + 90), (cx - 45, cy + 55), (cx - 60, cy - 30)], fill=(15, 23, 42), outline=(56, 189, 248), width=3)
        draw.polygon([(cx, cy - 55), (cx + 42, cy - 22), (cx + 32, cy + 40), (cx, cy + 65), (cx - 32, cy + 40), (cx - 42, cy - 22)], fill=(16, 185, 129))
        draw.text((cx - 26, cy - 15), "🛡️", font=get_font(FONT_BOLD, 34), fill=(255, 255, 255))

        # Trajectory Path: Earth -> Moon -> Mars
        draw.line([(240, 580), (1680, 580)], fill=(30, 41, 59), width=2)

        # Earth node
        draw.ellipse([(210, 550), (270, 610)], fill=(37, 99, 235))
        draw.text((200, 625), "EARTH (LEO)", font=get_font(FONT_BOLD, 17), fill=(147, 197, 253))

        # Moon / Artemis Gateway node
        draw.ellipse([(810, 550), (870, 610)], fill=(156, 163, 175))
        draw.text((760, 625), "LUNAR GATEWAY", font=get_font(FONT_BOLD, 17), fill=(229, 231, 235))

        # Mars Transit node
        draw.ellipse([(1510, 550), (1570, 610)], fill=(220, 38, 38))
        draw.text((1480, 625), "MARS TRANSIT", font=get_font(FONT_BOLD, 17), fill=(252, 165, 165))

        # Traveling pulse packet
        pulse_pos = int(240 + ((f * 5) % 1300))
        draw.ellipse([(pulse_pos - 8, 572), (pulse_pos + 8, 588)], fill=(6, 182, 212))

        # Flight principle banner
        draw.rounded_rectangle([(240, 680), (1680, 750)], radius=12, fill=(15, 23, 42), outline=(6, 182, 212), width=1)
        draw.text((280, 695), "KEY PRINCIPLE: ZERO UNANCHORED CLINICAL DATA", font=get_font(FONT_BOLD, 20), fill=(6, 182, 212))
        draw.text((280, 722), "All recommendations are grounded in NASA STD-3001, published trials, and verified baselines.", font=get_font(FONT_REG, 17), fill=(226, 232, 240))

        draw_top_bar(draw, "WHO · MISSION", "MISSION TRAJECTORY & AUTONOMY GOAL", (6, 182, 212), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.5, 3.5, "Addressing NASA’s official challenge:"),
        (3.5, 5.5, "“Create Health Monitoring Software"),
        (5.5, 7.2, "for Astronauts on Space Missions,”"),
        (7.2, 9.0, "we examined the five foundational hazards:"),
        (9.0, 11.0, "radiation, isolation, distance,"),
        (11.0, 13.5, "microgravity, and hostile closed environments.")
    ]

    hazards = [
        ("R", "SPACE RADIATION", "Solar Particle Events (SPEs), Cosmic Rays, Tissue Dosimetry", (244, 63, 94)),
        ("I", "ISOLATION & CONFINEMENT", "Sleep disruption, cognitive load, autonomous psychological support", (168, 85, 247)),
        ("D", "DISTANCE FROM EARTH", "Up to 22-min radio latency, zero evacuation capability", (245, 158, 11)),
        ("G", "GRAVITY FIELDS", "Cephalad fluid shift, spaceflight osteopenia, cardiovascular deconditioning", (59, 130, 246)),
        ("E", "HOSTILE CLOSED ENVIRONMENTS", "Microbial accumulation, atmospheric CO2, habitat toxicology", (16, 185, 129))
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        draw.text((120, 95), "OFFICIAL NASA INTERNATIONAL SPACE APPS CHALLENGE", font=get_font(FONT_MONO, 18), fill=(245, 158, 11))
        draw.text((120, 125), "“Create Health Monitoring Software for Astronauts on Space Missions”", font=get_font(FONT_BOLD, 34), fill=(251, 191, 36))

        # 5 Hazards compact stack (fits cleanly between y=180 and y=660)
        y_off = 180
        for i, (letter, title, desc, color) in enumerate(hazards):
            is_active = (f // 60) >= i
            alpha_col = color if is_active else (71, 85, 105)

            draw.rounded_rectangle([(120, y_off), (1150, y_off + 78)], radius=10, fill=(15, 23, 42), outline=alpha_col, width=2 if is_active else 1)
            # Letter badge
            draw.rounded_rectangle([(135, y_off + 12), (185, y_off + 66)], radius=6, fill=alpha_col)
            draw.text((150, y_off + 20), letter, font=get_font(FONT_BOLD, 26), fill=(15, 23, 42))

            draw.text((205, y_off + 14), title, font=get_font(FONT_BOLD, 19), fill=(241, 245, 249) if is_active else (148, 163, 184))
            draw.text((205, y_off + 44), desc, font=get_font(FONT_REG, 15), fill=(203, 213, 225) if is_active else (100, 116, 139))
            y_off += 94

        # Radar scanner on right
        rx, ry, rad = 1520, 420, 190
        draw.ellipse([(rx - rad, ry - rad), (rx + rad, ry + rad)], outline=(30, 41, 59), width=2)
        draw.ellipse([(rx - rad*2//3, ry - rad*2//3), (rx + rad*2//3, ry + rad*2//3)], outline=(30, 58, 138), width=1)
        ang = f * 0.08
        draw.line([(rx, ry), (rx + int(rad * math.cos(ang)), ry + int(rad * math.sin(ang)))], fill=(245, 158, 11), width=3)
        draw.text((rx - 80, ry - 15), "NASA RIDGE", font=get_font(FONT_BOLD, 24), fill=(245, 158, 11))
        draw.text((rx - 65, ry + 20), "5 HAZARDS", font=get_font(FONT_MONO, 15), fill=(148, 163, 184))

        draw_top_bar(draw, "WHY · CHALLENGE", "THE 5 FOUNDATIONAL SPACEFLIGHT HAZARDS (RIDGE)", (245, 158, 11), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (2.8, 4.5, "On a Mars transit,"),
        (4.5, 6.2, "radio signals take up to"),
        (6.2, 8.0, "twenty-two minutes each way,"),
        (8.0, 9.8, "and solar conjunction causes complete blackouts.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 15, 28))
        draw = ImageDraw.Draw(img)

        # Earth on left, Mars on right
        draw.ellipse([(140, 320), (320, 500)], fill=(37, 99, 235))
        draw.ellipse([(165, 345), (295, 475)], fill=(59, 130, 246))
        draw.text((170, 520), "EARTH", font=get_font(FONT_BOLD, 26), fill=(147, 197, 253))
        draw.text((150, 555), "Mission Control", font=get_font(FONT_REG, 18), fill=(148, 163, 184))

        draw.ellipse([(1600, 320), (1780, 500)], fill=(220, 38, 38))
        draw.ellipse([(1625, 345), (1755, 475)], fill=(239, 68, 68))
        draw.text((1645, 520), "MARS", font=get_font(FONT_BOLD, 26), fill=(252, 165, 165))
        draw.text((1620, 555), "Transit Habitat", font=get_font(FONT_REG, 18), fill=(148, 163, 184))

        # Radio wave pulses
        for i in range(5):
            wave_x = int(320 + ((f * 6 + i * 240) % 1280))
            draw.line([(wave_x, 380), (wave_x, 440)], fill=(6, 182, 212), width=3)
            pts = [(wave_x + dx, 410 + int(20 * math.sin((wave_x + dx) * 0.15))) for dx in range(-30, 31, 4)]
            draw.line(pts, fill=(56, 189, 248), width=2)

        # Central Stopwatch Box
        sec_counter = int((f / total_frames) * 22)
        draw.rounded_rectangle([(480, 200), (1440, 640)], radius=20, fill=(15, 23, 42), outline=(245, 158, 11), width=3)
        draw.text((540, 240), "ONE-WAY SPEED-OF-LIGHT DELAY", font=get_font(FONT_MONO, 20), fill=(245, 158, 11))
        draw.text((610, 290), f"T + {sec_counter:02d}:00 MIN", font=get_font(FONT_BOLD, 68), fill=(241, 245, 249))

        draw.text((540, 420), "• ROUND-TRIP TO MISSION CONTROL: 44 MINUTES", font=get_font(FONT_BOLD, 22), fill=(248, 113, 113))
        draw.text((540, 470), "• SOLAR CONJUNCTION BLACKOUT: 2 WEEKS ZERO SIGNAL", font=get_font(FONT_BOLD, 22), fill=(251, 146, 60))
        draw.text((540, 520), "• CONCLUSION: REAL-TIME GROUND DOCTOR IS IMPOSSIBLE", font=get_font(FONT_BOLD, 20), fill=(56, 189, 248))

        draw_top_bar(draw, "WHY · LATENCY", "COMMUNICATION DELAY & SOLAR BLACKOUT", (245, 158, 11), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (0.5, 2.8, "Meanwhile, satellite data shows"),
        (2.8, 5.0, "solar particle events can surge"),
        (5.0, 7.2, "proton flux over four-thousand-fold."),
        (7.2, 9.8, "Combined with microgravity fluid shifts...")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (12, 14, 26))
        draw = ImageDraw.Draw(img)

        # Left: CME Sun eruption
        sun_x, sun_y = 120, 420
        draw.ellipse([(sun_x - 160, sun_y - 160), (sun_x + 160, sun_y + 160)], fill=(234, 88, 12))
        draw.ellipse([(sun_x - 120, sun_y - 120), (sun_x + 120, sun_y + 120)], fill=(245, 158, 11))
        for i in range(3):
            arc_r = 160 + int((f * 4 + i * 80) % 200)
            draw.arc([(sun_x - arc_r, sun_y - arc_r), (sun_x + arc_r, sun_y + arc_r)], -60, 60, fill=(239, 68, 68), width=3)
        draw.text((140, 620), "CME ERUPTION", font=get_font(FONT_BOLD, 20), fill=(248, 113, 113))

        # Center: Dynamic Proton Flux Graph
        gx, gy, gw, gh = 420, 180, 820, 460
        draw.rectangle([(gx, gy), (gx + gw, gy + gh)], fill=(15, 23, 42), outline=(30, 41, 59), width=2)
        for y_step in range(gy + 60, gy + gh, 80):
            draw.line([(gx, y_step), (gx + gw, y_step)], fill=(30, 41, 59), width=1)
        draw.text((gx + 20, gy + 20), "NOAA GOES PROTON FLUX (> 100 MeV): EXPONENTIAL SURGE", font=get_font(FONT_BOLD, 21), fill=(248, 113, 113))

        # Plot curve
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

        draw.text((gx + gw - 300, gy + 70), f"FLUX: {curr_pfu:,.0f} pfu", font=get_font(FONT_MONO, 26), fill=(252, 165, 165))
        draw.text((gx + gw - 300, gy + 110), "THRESHOLD: S3 SEVERE", font=get_font(FONT_BOLD, 17), fill=(239, 68, 68))

        # Right: Fluid Shift Box
        draw.rounded_rectangle([(1280, 180), (1800, 640)], radius=16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
        draw.text((1310, 215), "MICROGRAVITY FLUID SHIFT", font=get_font(FONT_BOLD, 21), fill=(56, 189, 248))
        draw.text((1310, 265), "• Cephalad fluid redistribution\n• +2 Liters blood pooled to thorax\n• Elevated venous pressure\n• Reduced baroreflex sensitivity\n• Extreme susceptibility to arrhythmias\n  during radiation stress", font=get_font(FONT_REG, 18), fill=(226, 232, 240))
        draw.text((1310, 530), "⚠️ DOUBLE COMPOUND CRISIS", font=get_font(FONT_BOLD, 19), fill=(251, 146, 60))

        draw_top_bar(draw, "WHY · SURGE", "4,000-FOLD PROTON SURGE & CARDIOVASCULAR STRAIN", (244, 63, 94), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.0, 3.5, "...an acute medical crisis"),
        (3.5, 5.5, "cannot wait for Earth."),
        (5.5, 8.0, "Current space wearables stream vitals"),
        (8.0, 11.0, "to ground scientists, but leave isolated crews"),
        (11.0, 13.8, "without real-time decision support."),
        (13.8, 16.5, "Yet using black-box generative AI"),
        (16.5, 19.2, "risks dangerous medical hallucinations."),
        (19.2, 21.8, "Astronauts need grounded clinical intelligence.")
    ]

    cols = [
        ("CURRENT SPACE WEARABLES", "DATA TRAPPED ON EARTH", (245, 158, 11), [
            "• Wearables stream vitals to ground servers",
            "• Crew left blind during radio blackouts",
            "• No autonomous onboard triage intelligence",
            "• Cannot guide emergency interventions"
        ], 100),
        ("BLACK-BOX GENERATIVE LLMs", "HIGH RISK OF HALLUCINATIONS", (239, 68, 68), [
            "• Generates unanchored medical dosages",
            "• Non-deterministic probabilistic guesses",
            "• Violates NASA Safety & Traceability",
            "• High risk of fatal clinical errors"
        ], 690),
        ("STORM SHIELD", "100% DETERMINISTIC & VERIFIED", (16, 185, 129), [
            "• Fully autonomous inside spacecraft",
            "• NASA STD-3001 clinical logic rules",
            "• Active allergy & contraindication locks",
            "• NASA Level 2 Autonomy (Human in loop)"
        ], 1280)
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        # Continuous floating dust particles
        for i in range(45):
            px = int((i * 123 + f * 2.2) % W)
            py = int((i * 89 + f * 1.1) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(35, 60, 100))

        draw.text((100, 100), "THE GAP IN MODERN SPACE HEALTH MONITORING", font=get_font(FONT_MONO, 19), fill=(6, 182, 212))
        draw.text((100, 135), "WHY GEN-AI CANNOT BE TRUSTED WITH ASTRONAUT LIVES", font=get_font(FONT_BOLD, 40), fill=(241, 245, 249))

        for title, status, col_color, bullets, cx in cols:
            is_winner = (cx == 1280)
            draw.rounded_rectangle([(cx, 200), (cx + 540, 670)], radius=16, fill=(15, 23, 42), outline=col_color, width=3 if is_winner else 1)

            # Header
            draw.rectangle([(cx, 200), (cx + 540, 275)], fill=(20, 32, 50) if is_winner else (15, 20, 35))
            draw.text((cx + 25, 215), title, font=get_font(FONT_BOLD, 21), fill=(241, 245, 249))
            draw.text((cx + 25, 248), status, font=get_font(FONT_MONO, 15), fill=col_color)

            y_b = 310
            for b in bullets:
                draw.text((cx + 25, y_b), b, font=get_font(FONT_REG, 18), fill=(226, 232, 240) if is_winner else (148, 163, 184))
                y_b += 65

            if is_winner:
                # Radiant badge with pulsing aura
                draw.rounded_rectangle([(cx + 25, 590), (cx + 515, 645)], radius=8, fill=(16, 185, 129))
                draw.text((cx + 70, 608), "VERIFIED CLINICAL GROUNDING", font=get_font(FONT_BOLD, 20), fill=(15, 23, 42))

                # Electric neon tracer running around winning column border
                t_pos = (f * 16) % (540 * 2 + 470 * 2)
                if t_pos < 540:
                    tx, ty = cx + t_pos, 200
                elif t_pos < 540 + 470:
                    tx, ty = cx + 540, 200 + (t_pos - 540)
                elif t_pos < 540 * 2 + 470:
                    tx, ty = cx + 540 - (t_pos - 540 - 470), 670
                else:
                    tx, ty = cx, 670 - (t_pos - 540 * 2 - 470)
                draw.ellipse([(tx - 6, ty - 6), (tx + 6, ty + 6)], fill=(52, 211, 153))

        draw_top_bar(draw, "WHY · ARCHITECTURE", "THE TELEMETRY & AI DECISION GAP", (245, 158, 11), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.0, 3.0, "This is Storm Shield."),
        (3.0, 5.5, "Our core innovation links"),
        (5.5, 8.0, "space weather directly to physiology."),
        (8.0, 10.5, "We ingest live alerts from NASA CCMC DONKI,"),
        (10.5, 13.5, "and satellite telemetry from NOAA SWPC GOES-16,"),
        (13.5, 17.5, "benchmarked against NASA OSDR RadLab.")
    ]

    for f in range(total_frames):
        t = f / FPS
        p = f / float(total_frames)

        if p < 0.35:
            img = apply_ken_burns(base_img, 1.0, 1.04, 0, 0, 0, 0, p / 0.35)
        elif p < 0.70:
            sub_p = (p - 0.35) / 0.35
            img = apply_ken_burns(base_img, 1.04, 1.18, 0, 200, 0, -100, sub_p)
        else:
            sub_p = (p - 0.70) / 0.30
            img = apply_ken_burns(base_img, 1.18, 1.12, 200, -150, -100, 50, sub_p)

        draw = ImageDraw.Draw(img)

        # Dynamic overlay targeting box on NOAA gauge
        draw.rounded_rectangle([(1100, 110), (1820, 220)], radius=12, fill=(15, 23, 42), outline=(6, 182, 212), width=3)
        draw.text((1125, 125), "⚡ LIVE TELEMETRY: NOAA SWPC GOES-18", font=get_font(FONT_BOLD, 19), fill=(6, 182, 212))
        draw.text((1125, 160), "0.30 pfu (S0 QUIET) · INGESTION: ACTIVE", font=get_font(FONT_MONO, 16), fill=(241, 245, 249))

        # NASA DONKI callout
        draw.rounded_rectangle([(1100, 240), (1820, 340)], radius=12, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1125, 255), "🛰️ NASA CCMC DONKI SPACE WEATHER", font=get_font(FONT_BOLD, 18), fill=(16, 185, 129))
        draw.text((1125, 290), "Real-Time SPE & CME Alerts Streamed", font=get_font(FONT_REG, 16), fill=(203, 213, 225))

        draw_top_bar(draw, "WHAT · LIVE DEMO", "STORM SHIELD OVERVIEW HUD & SATELLITE TELEMETRY", (6, 182, 212), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (2.8, 5.0, "Applying Artemis I Orion"),
        (5.0, 7.2, "Radiation Measurements,"),
        (7.2, 9.8, "our engine models four-fold shielding protection.")
    ]

    for f in range(total_frames):
        t = f / FPS
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.0, 1.08, 0, 0, 0, 20, p)
        draw = ImageDraw.Draw(img)

        # Active vertical laser scanner beam
        scan_y = int(220 + 380 * (0.5 + 0.5 * math.sin(f * 0.12)))
        draw.line([(400, scan_y), (1100, scan_y)], fill=(6, 182, 212), width=3)

        # Organ beacons
        draw.ellipse([(730, 420), (770, 460)], outline=(244, 63, 94), width=3)
        draw.text((780, 430), "CARDIOVASCULAR (ACT)", font=get_font(FONT_BOLD, 17), fill=(244, 63, 94))

        draw.ellipse([(730, 260), (770, 300)], outline=(56, 189, 248), width=2)
        draw.text((780, 270), "NEUROLOGICAL (NOMINAL)", font=get_font(FONT_BOLD, 17), fill=(56, 189, 248))

        # Artemis 1 Haven callout box
        draw.rounded_rectangle([(1200, 180), (1800, 330)], radius=12, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1220, 205), "🛡️ ARTEMIS I ORION RADIATION PHYSICS", font=get_font(FONT_BOLD, 19), fill=(16, 185, 129))
        draw.text((1220, 240), "• Central Water Wall Haven: 4.0x Dose Reduction\n• Hydrogen-Rich Shielding protects crew during SPEs\n• Evaluated per NASA STD-3001 Vol 1", font=get_font(FONT_REG, 16), fill=(226, 232, 240))

        draw_top_bar(draw, "WHAT · HEALTH TWIN", "3D HOLOGRAPHIC HEALTH TWIN & ARTERIAL MAPPING", (6, 182, 212), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (0.5, 2.8, "Wearable sensor feeds are evaluated"),
        (2.8, 5.2, "by an interactive Health Twin"),
        (5.2, 7.8, "against NASA Human-System Standard 3001.")
    ]

    for f in range(total_frames):
        t = f / FPS
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.05, 1.15, 0, 150, 0, 120, p)
        draw = ImageDraw.Draw(img)

        # Overlay real-time active Lead II ECG canvas
        draw.rounded_rectangle([(120, 160), (1050, 640)], radius=16, fill=(10, 18, 32), outline=(6, 182, 212), width=2)
        draw.text((155, 190), "LEAD II ECG OSCILLOSCOPE — 115 BPM (ACUTE TACHYCARDIA)", font=get_font(FONT_BOLD, 21), fill=(248, 113, 113))
        draw_ecg_wave(draw, 155, 245, 840, 240, f, bpm=115, color=(239, 68, 68), thickness=3)

        draw.text((155, 515), "CURRENT HR: 115 BPM  |  BASELINE: 69 BPM  |  Δ +46 BPM ELEVATION", font=get_font(FONT_BOLD, 19), fill=(252, 165, 165))
        draw.text((155, 555), "SYSTOLIC BP: 148 mmHg (STAGE 2) · SPO2: 93% (BORDERLINE HYPOXIA)", font=get_font(FONT_MONO, 16), fill=(251, 146, 60))

        # Right box: NASA Standard 3001
        draw.rounded_rectangle([(1100, 160), (1800, 640)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1135, 200), "NASA HUMAN-SYSTEM STANDARD 3001", font=get_font(FONT_BOLD, 21), fill=(16, 185, 129))
        draw.text((1135, 255), "• Personalized baseline calibration\n• 3-tier persistence gate to avoid false alarms\n• Multi-astronaut telemetry evaluation\n• Autonomous habitat crew alert broadcast\n• Direct transition to Care Mode checklist", font=get_font(FONT_REG, 19), fill=(226, 232, 240))
        draw.text((1135, 490), "STATUS: VERIFIED PERSISTENT DEVIATION", font=get_font(FONT_BOLD, 18), fill=(248, 113, 113))

        draw_top_bar(draw, "WHAT · CLINICAL RULES", "LEAD II ECG SWEEP & NASA STD-3001 CALIBRATION", (6, 182, 212), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (0.8, 3.0, "In this live demonstration,"),
        (3.0, 5.5, "Pilot Alex Vance develops acute distress."),
        (5.5, 7.5, "Our persistence engine confirms the anomaly,"),
        (7.5, 9.8, "alerts the crew across browser tabs...")
    ]

    for f in range(total_frames):
        t = f / FPS
        p = f / float(total_frames)
        img = apply_ken_burns(base_img, 1.0, 1.05, 0, 0, 0, 0, p)
        draw = ImageDraw.Draw(img)

        # Flashing red emergency vignette
        pulse = int(50 + 40 * math.sin(f * 0.3))
        draw.rectangle([(0, 72), (W, 72 + pulse)], fill=(pulse * 2, 20, 30))
        draw.rectangle([(0, H - 85 - pulse), (W, H - 85)], fill=(pulse * 2, 20, 30))

        # Persistence Gate Progress Card
        draw.rounded_rectangle([(120, 110), (700, 260)], radius=12, fill=(15, 23, 42), outline=(239, 68, 68), width=3)
        draw.text((150, 130), "ANOMALY PERSISTENCE GATE", font=get_font(FONT_MONO, 17), fill=(252, 165, 165))
        draw.text((150, 165), "GATE 3/3 CONFIRMED", font=get_font(FONT_BOLD, 30), fill=(239, 68, 68))
        draw.text((150, 210), "Auto-Broadcast to All Habitat Terminals", font=get_font(FONT_REG, 16), fill=(226, 232, 240))

        # Multi-tab BroadcastChannel Badge
        draw.rounded_rectangle([(1220, 110), (1800, 230)], radius=12, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        draw.text((1250, 135), "📡 MULTI-TAB BROADCAST CHANNEL", font=get_font(FONT_BOLD, 18), fill=(6, 182, 212))
        draw.text((1250, 175), "Synchronized across 4 Browser Windows", font=get_font(FONT_MONO, 15), fill=(148, 163, 184))

        # Beacon on 'LAUNCH CARE MODE'
        draw.rounded_rectangle([(820, 640), (1100, 700)], radius=8, outline=(16, 185, 129), width=3)
        draw.text((850, 660), "➜ LAUNCH CARE MODE", font=get_font(FONT_BOLD, 18), fill=(16, 185, 129))

        draw_top_bar(draw, "WHAT · EMERGENCY", "TRIAGE PERSISTENCE GATE & HABITAT CREW BROADCAST", (244, 63, 94), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (0.5, 2.5, "...and opens Care Mode."),
        (2.5, 5.0, "Because Alex has an aspirin allergy,"),
        (5.0, 7.5, "administration is strictly blocked,"),
        (7.5, 10.5, "instantly creating a thirty-second flight surgeon handoff.")
    ]

    for f in range(total_frames):
        t = f / FPS
        p = f / float(total_frames)

        if p < 0.55:
            sub_p = p / 0.55
            img = apply_ken_burns(care_img, 1.0, 1.08, 0, -50, 0, 50, sub_p)
            draw = ImageDraw.Draw(img)

            # Prominent Red Alert Box over Contraindication
            draw.rounded_rectangle([(160, 440), (1220, 650)], radius=16, fill=(20, 10, 15), outline=(244, 63, 94), width=3)
            draw.text((195, 465), "🚫 STRICT CONTRAINDICATION: ASPIRIN BLOCKED", font=get_font(FONT_BOLD, 24), fill=(248, 113, 113))
            draw.text((195, 510), "Patient Alex Vance has a documented NSAID / Aspirin Allergy.\nAdministration would trigger life-threatening acute bronchospasm.\nStorm Shield overrides protocol and locks medication administration.", font=get_font(FONT_REG, 19), fill=(254, 205, 211))
            draw.text((195, 595), "SAFETY OVERRIDE: GUARANTEED ZERO CLINICAL ACCIDENTS", font=get_font(FONT_MONO, 16), fill=(244, 63, 94))
        else:
            sub_p = (p - 0.55) / 0.45
            img = apply_ken_burns(handoff_img, 1.0, 1.06, 0, 50, 0, -20, sub_p)
            draw = ImageDraw.Draw(img)

            # Highlight Box on 30s Handoff Brief
            draw.rounded_rectangle([(1050, 140), (1800, 350)], radius=14, fill=(15, 23, 42), outline=(16, 185, 129), width=3)
            draw.text((1080, 168), "📋 30-SECOND FLIGHT SURGEON BRIEF", font=get_font(FONT_BOLD, 23), fill=(16, 185, 129))
            draw.text((1080, 210), "• NASA EIMO Standard Format (SBAR Summary)\n• Instant 1-Click Generation & Export\n• Ready for Ground Flight Surgeon Review\n• Zero manual transcription overhead", font=get_font(FONT_REG, 18), fill=(226, 232, 240))

        draw_top_bar(draw, "WHAT · SAFETY", "ALLERGY CONTRAINDICATION LOCK & 30-SECOND HANDOFF", (16, 185, 129), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.5, 3.8, "Who benefits? Astronauts and Medical Officers"),
        (3.8, 6.2, "gain an immediate, panic-free co-pilot."),
        (6.2, 9.0, "Crucially, Storm Shield operates"),
        (9.0, 11.5, "at NASA Autonomy Ladder Level 2:"),
        (11.5, 14.5, "the human acts, while software calculates & alerts."),
        (14.5, 17.5, "We guarantee zero medical hallucinations.")
    ]

    ladder = [
        ("LEVEL 5", "FULL AUTONOMY (AI acts with zero human oversight - UNACCEPTABLE IN HEALTHCARE)", (71, 85, 105)),
        ("LEVEL 4", "SUPERVISED AUTONOMY (System initiates invasive medical interventions)", (71, 85, 105)),
        ("LEVEL 3", "SHARED AUTONOMY (Joint executive clinical actions)", (71, 85, 105)),
        ("LEVEL 2", "HUMAN ACTS — STORM SHIELD OPERATIONAL TIER\nSoftware visualizes, calculates, alerts, and records; Crew retains executive agency", (16, 185, 129)),
        ("LEVEL 1", "TELE-OPERATION (Complete ground control - FAILS ON MARS TRANSIT)", (71, 85, 105))
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        # Ambient floating dust
        for i in range(40):
            px = int((i * 149 + f * 1.8) % W)
            py = int((i * 83 + f * 0.9) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(30, 60, 90))

        draw.text((120, 100), "NASA AUTONOMY LADDER FOR HUMAN SPACE MISSIONS", font=get_font(FONT_MONO, 19), fill=(16, 185, 129))
        draw.text((120, 135), "WHY LEVEL 2 AUTONOMY GUARANTEES ZERO HALLUCINATIONS", font=get_font(FONT_BOLD, 38), fill=(241, 245, 249))

        y_l = 200
        for lvl, desc, col in ladder:
            is_our_level = (lvl == "LEVEL 2")
            box_h = 100 if is_our_level else 60

            draw.rounded_rectangle([(120, y_l), (1150, y_l + box_h)], radius=12, fill=(20, 35, 45) if is_our_level else (15, 20, 32), outline=col, width=3 if is_our_level else 1)
            # Level pill
            draw.rounded_rectangle([(140, y_l + 10), (250, y_l + 48)], radius=6, fill=col)
            draw.text((155, y_l + 18), lvl, font=get_font(FONT_BOLD, 17), fill=(10, 15, 30))

            if is_our_level:
                lines = desc.split("\n")
                draw.text((275, y_l + 14), lines[0], font=get_font(FONT_BOLD, 21), fill=(52, 211, 153))
                draw.text((275, y_l + 50), lines[1], font=get_font(FONT_REG, 17), fill=(226, 232, 240))
                # Pulsing beacon
                p_rad = int(8 + 6 * math.sin(f * 0.25))
                draw.ellipse([(1110 - p_rad, y_l + 32 - p_rad), (1110 + p_rad, y_l + 32 + p_rad)], outline=(16, 185, 129), width=2)
                draw.ellipse([(1106, y_l + 28), (1114, y_l + 36)], fill=(16, 185, 129))
            else:
                draw.text((275, y_l + 18), desc, font=get_font(FONT_REG, 16), fill=(148, 163, 184))
            y_l += box_h + 16

        # Right Card: Zero Hallucination Seal
        draw.rounded_rectangle([(1210, 200), (1800, 670)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        cx, cy = 1505, 320
        draw.ellipse([(cx - 85, cy - 85), (cx + 85, cy + 85)], outline=(16, 185, 129), width=3)
        draw.ellipse([(cx - 70, cy - 70), (cx + 70, cy + 70)], outline=(52, 211, 153), width=1)
        for r_ang, arc_col in [(f * 0.08, (16, 185, 129)), (-f * 0.1, (52, 211, 153))]:
            st_deg = int(math.degrees(r_ang)) % 360
            draw.arc([(cx - 100, cy - 100), (cx + 100, cy + 100)], st_deg, st_deg + 130, fill=arc_col, width=2)

        draw.text((cx - 45, cy - 20), "100%", font=get_font(FONT_BOLD, 34), fill=(16, 185, 129))
        draw.text((cx - 65, cy + 22), "DETERMINISTIC", font=get_font(FONT_MONO, 14), fill=(241, 245, 249))

        draw.text((1250, 440), "CLINICAL SAFETY GUARANTEES", font=get_font(FONT_BOLD, 21), fill=(16, 185, 129))
        draw.text((1250, 485), "• ZERO generative AI black boxes\n• ZERO probabilistic dosage hallucinations\n• All logic grounded in NASA STD-3001\n• Complete audit trail & retrace mode", font=get_font(FONT_REG, 18), fill=(226, 232, 240))

        draw_top_bar(draw, "IMPACT · AUTONOMY", "NASA AUTONOMY LADDER LEVEL 2 ('HUMAN ACTS')", (16, 185, 129), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.5, 3.8, "What changes is total situational clarity."),
        (3.8, 6.8, "Our deterministic engine has passed"),
        (6.8, 9.5, "forty-seven automated unit tests"),
        (9.5, 12.0, "with zero unanchored data."),
        (12.0, 14.8, "And this brings life-saving decision support"),
        (14.8, 17.5, "to Antarctic bases, naval vessels, and disaster zones.")
    ]

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

    terrestrial = [
        ("1. ANTARCTICA CONCORDIA STATION", "Extreme isolation, zero winter evacuation, limited medical staff", (56, 189, 248)),
        ("2. DEEP SUBMERSIBLE & NAVAL FLEETS", "Complete underwater radio blackout, offline deterministic protocols", (52, 211, 153)),
        ("3. REMOTE DISASTER & CONFLICT ZONES", "Earthquakes, humanitarian crises with collapsed telecommunication grids", (245, 158, 11))
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (8, 12, 24))
        draw = ImageDraw.Draw(img)

        # Tech particle dust
        for i in range(40):
            px = int((i * 131 + f * 1.6) % W)
            py = int((i * 79 + f * 1.0) % (H - 200)) + 80
            draw.ellipse([(px, py), (px + 2, py + 2)], fill=(30, 55, 85))

        draw.text((120, 100), "RIGOROUS VERIFICATION & BEYOND-SPACE APPLICATION", font=get_font(FONT_MONO, 19), fill=(16, 185, 129))
        draw.text((120, 135), "FROM DEEP SPACE TO EXTREME EARTH ENVIRONMENTS", font=get_font(FONT_BOLD, 38), fill=(241, 245, 249))

        # Left: Terminal
        draw.rounded_rectangle([(120, 200), (950, 670)], radius=12, fill=(15, 20, 30), outline=(56, 189, 248), width=2)
        draw.rectangle([(120, 200), (950, 242)], fill=(20, 30, 45))
        draw.ellipse([(140, 214), (154, 228)], fill=(239, 68, 68))
        draw.ellipse([(164, 214), (178, 228)], fill=(245, 158, 11))
        draw.ellipse([(188, 214), (202, 228)], fill=(16, 185, 129))
        draw.text((220, 212), "bash — storm-shield-test-runner", font=get_font(FONT_MONO, 13), fill=(148, 163, 184))

        y_t = 265
        for line, col in term_lines:
            draw.text((150, y_t), line, font=get_font(FONT_MONO, 17), fill=col)
            y_t += 36

        # Blinking cursor
        if (f // 8) % 2 == 0:
            draw.rectangle([(600, y_t - 36), (614, y_t - 18)], fill=(16, 185, 129))

        # Right: Terrestrial Cards
        draw.rounded_rectangle([(1010, 200), (1800, 670)], radius=16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((1045, 230), "TERRESTRIAL EARTH DEPLOYMENTS", font=get_font(FONT_BOLD, 24), fill=(16, 185, 129))

        y_terr = 285
        for i, (t_title, t_desc, t_col) in enumerate(terrestrial):
            draw.rounded_rectangle([(1045, y_terr), (1765, y_terr + 95)], radius=10, fill=(20, 30, 45), outline=t_col, width=1)
            draw.text((1070, y_terr + 16), t_title, font=get_font(FONT_BOLD, 19), fill=t_col)
            draw.text((1070, y_terr + 50), t_desc, font=get_font(FONT_REG, 16), fill=(226, 232, 240))

            r_pulse = int(10 + 8 * math.sin(f * 0.2 + i * 1.5))
            draw.ellipse([(1725 - r_pulse, y_terr + 32 - r_pulse), (1725 + r_pulse, y_terr + 32 + r_pulse)], outline=t_col, width=2)
            draw.ellipse([(1721, y_terr + 28), (1729, y_terr + 36)], fill=t_col)

            y_terr += 115

        draw_top_bar(draw, "IMPACT · VERIFICATION", "47 AUTOMATED UNIT TESTS & TERRESTRIAL IMPACT", (16, 185, 129), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.5, 4.5, "Looking forward, we are advancing Storm Shield"),
        (4.5, 8.0, "toward hardware Bluetooth integration"),
        (8.0, 11.5, "with flight-certified biometrics,"),
        (11.5, 15.0, "and private on-device language models"),
        (15.0, 18.5, "for ambient medical charting.")
    ]

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

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (10, 14, 26))
        draw = ImageDraw.Draw(img)

        draw.text((120, 100), "STORM SHIELD ADVANCED ROADMAP", font=get_font(FONT_MONO, 19), fill=(6, 182, 212))
        draw.text((120, 135), "FROM DECISION SUPPORT TO AMBIENT CLINICAL INTELLIGENCE", font=get_font(FONT_BOLD, 36), fill=(241, 245, 249))

        # Horizontal bus line
        draw.line([(260, 220), (1660, 220)], fill=(30, 41, 59), width=3)
        pulse_x = int(260 + ((f * 5) % 1400))
        draw.ellipse([(pulse_x - 8, 212), (pulse_x + 8, 228)], fill=(6, 182, 212))

        col_w = 520
        for i, (p_tag, p_title, p_status, p_col, p_bullets) in enumerate(phases):
            cx = 120 + i * 580
            draw.rounded_rectangle([(cx, 260), (cx + col_w, 670)], radius=16, fill=(15, 23, 42), outline=p_col, width=2)

            # Node beacon
            draw.ellipse([(cx + col_w//2 - 14, 206), (cx + col_w//2 + 14, 234)], fill=p_col)

            # Header
            draw.rectangle([(cx, 260), (cx + col_w, 335)], fill=(20, 30, 45))
            draw.text((cx + 25, 275), p_tag, font=get_font(FONT_MONO, 15), fill=p_col)
            draw.text((cx + 25, 302), p_title, font=get_font(FONT_BOLD, 19), fill=(241, 245, 249))

            # Status pill
            draw.rounded_rectangle([(cx + 25, 355), (cx + 340, 388)], radius=6, fill=p_col)
            draw.text((cx + 40, 364), p_status, font=get_font(FONT_BOLD, 14), fill=(10, 15, 30))

            y_b = 420
            for b in p_bullets:
                draw.text((cx + 25, y_b), b, font=get_font(FONT_REG, 17), fill=(203, 213, 225))
                y_b += 60

        draw_top_bar(draw, "IMPACT · ROADMAP", "ENGINEERING ROADMAP: SENSORS & PRIVATE EDGE SLM", (6, 182, 212), f)
        draw_kinetic_subtitle(draw, subs, t)
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

    subs = [
        (1.0, 4.0, "In deep space, autonomy is not a luxury —"),
        (4.0, 6.8, "it is survival."),
        (6.8, 9.5, "We are Team Extokened."),
        (9.5, 12.5, "Wherever humanity journeys,"),
        (12.5, 15.5, "our astronauts will never face the storm alone.")
    ]

    for f in range(total_frames):
        t = f / FPS
        img = Image.new("RGB", (W, H), (8, 12, 24))
        draw = ImageDraw.Draw(img)

        draw_3d_starfield(draw, speed=5)

        cx, cy = 960, 380
        aur_r = int(210 + 30 * math.sin(f * 0.08))
        draw.ellipse([(cx - aur_r, cy - aur_r), (cx + aur_r, cy + aur_r)], outline=(6, 182, 212), width=1)
        draw.ellipse([(cx - aur_r*2//3, cy - aur_r*2//3), (cx + aur_r*2//3, cy + aur_r*2//3)], outline=(16, 185, 129), width=1)

        draw.polygon([(cx, cy - 90), (cx + 70, cy - 35), (cx + 50, cy + 70), (cx, cy + 105), (cx - 50, cy + 70), (cx - 70, cy - 35)], fill=(15, 23, 42), outline=(245, 158, 11), width=4)
        draw.text((cx - 32, cy - 22), "🛡️", font=get_font(FONT_BOLD, 42), fill=(255, 255, 255))

        # Headline
        draw.text((360, 140), "“IN DEEP SPACE, AUTONOMY IS NOT A LUXURY —", font=get_font(FONT_BOLD, 42), fill=(241, 245, 249))
        draw.text((740, 205), "IT IS SURVIVAL.”", font=get_font(FONT_BOLD, 50), fill=(251, 191, 36))

        # Bottom Card
        draw.rounded_rectangle([(360, 560), (1560, 750)], radius=16, fill=(15, 23, 42), outline=(6, 182, 212), width=2)
        draw.text((410, 585), "STORM SHIELD", font=get_font(FONT_BOLD, 32), fill=(56, 189, 248))
        draw.text((410, 635), "TEAM EXTOKENED · BANGLADESH 🇧🇩", font=get_font(FONT_BOLD, 22), fill=(245, 158, 11))
        draw.text((410, 670), "NASA INTERNATIONAL SPACE APPS CHALLENGE 2026", font=get_font(FONT_MONO, 17), fill=(16, 185, 129))
        draw.text((410, 705), "Sajidul Islam Sobuj (Lead Architect)  ·  Yarin (Clinical Researcher)", font=get_font(FONT_REG, 18), fill=(226, 232, 240))

        draw_top_bar(draw, "FINALE", "HUMAN MISSIONS TO MARS: NEVER FACE THE STORM ALONE", (245, 158, 11), f)
        draw_kinetic_subtitle(draw, subs, t)
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
