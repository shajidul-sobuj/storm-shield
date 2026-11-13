import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
SCENES_DIR = "space-apps-video/assets/scenes"
os.makedirs(SCENES_DIR, exist_ok=True)

# Fonts
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_header(draw, section_tag, title_text, section_color=(56, 189, 248)):
    # Top status bar
    draw.rectangle([(0, 0), (W, 90)], fill=(15, 23, 42))
    draw.line([(0, 90), (W, 90)], fill=(30, 41, 59), width=2)
    
    # Section pill
    draw.rounded_rectangle([(40, 22), (240, 68)], radius=8, fill=section_color)
    f_tag = get_font(FONT_BOLD, 20)
    draw.text((55, 33), section_tag, font=f_tag, fill=(15, 23, 42))
    
    # Section title
    f_title = get_font(FONT_BOLD, 26)
    draw.text((260, 30), title_text, font=f_title, fill=(241, 245, 249))
    
    # Mission Clock & Identity
    f_meta = get_font(FONT_REG, 20)
    draw.text((W - 480, 33), "STORM SHIELD 🛡️  |  MET 142:18:04", font=f_meta, fill=(148, 163, 184))

def draw_subtitle(draw, subtitle_text):
    if not subtitle_text:
        return
    # Subtitle bar at bottom
    draw.rectangle([(0, H - 120), (W, H)], fill=(10, 15, 30))
    draw.line([(0, H - 120), (W, H - 120)], fill=(30, 41, 59), width=2)
    
    f_sub = get_font(FONT_REG, 24)
    # Wrap text if needed
    draw.text((60, H - 85), f"“ {subtitle_text} ”", font=f_sub, fill=(226, 232, 240))

def create_base_canvas(bg_color=(11, 17, 33)):
    img = Image.new("RGB", (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    return img, draw

# Generate slides
def build_all_scenes():
    rec_dir = "space-apps-video/assets/website-recordings"
    
    # --- S01: Hook 1 (Deep space void) ---
    img, draw = create_base_canvas((8, 12, 24))
    draw_header(draw, "WHO · HOOK", "DEEP SPACE TRANSLUNAR TRANSIT", (244, 63, 94))
    f_huge = get_font(FONT_BOLD, 54)
    f_sub = get_font(FONT_REG, 28)
    draw.text((120, 280), "50,000,000 MILES FROM EARTH", font=f_huge, fill=(248, 113, 113))
    draw.text((120, 370), "Deep-space transit habitat beyond lunar orbit.", font=f_sub, fill=(226, 232, 240))
    draw.text((120, 420), "Active Solar Particle Event (SPE) alert detected.", font=f_sub, fill=(203, 213, 225))
    
    # Warning card
    draw.rounded_rectangle([(120, 520), (880, 720)], radius=16, fill=(30, 41, 59), outline=(239, 68, 68), width=3)
    f_card = get_font(FONT_BOLD, 32)
    draw.text((160, 560), "⚠️  CRITICAL ALERT: SOLAR STORM ERUPTION", font=f_card, fill=(252, 165, 165))
    f_card_sub = get_font(FONT_REG, 24)
    draw.text((160, 620), "• Energetic Proton Flux: > 4,200 pfu (S3 Strong Storm)\n• Astronaut Vitals: Tachycardia + SpO2 decline\n• Ground Latency: 21 min 40 sec (No real-time doctor)", font=f_card_sub, fill=(241, 245, 249))
    
    # Radar graphic on right
    draw.ellipse([(1150, 240), (1650, 740)], outline=(56, 189, 248), width=3)
    draw.ellipse([(1250, 340), (1550, 640)], outline=(30, 58, 138), width=2)
    draw.ellipse([(1350, 440), (1450, 540)], fill=(239, 68, 68))
    draw.text((1310, 560), "SOLAR STORM WAVE", font=get_font(FONT_BOLD, 18), fill=(248, 113, 113))
    
    draw_subtitle(draw, "Fifty million miles from Earth, an alarm breaks the silence. A solar storm has erupted, and an astronaut’s vital signs are dropping.")
    img.save(os.path.join(SCENES_DIR, "S01.png"))
    
    # --- S02: Hook 2 (Distant Earth & Latency) ---
    img, draw = create_base_canvas((8, 14, 28))
    draw_header(draw, "WHO · HOOK", "COMMUNICATION DELAY & ISOLATION", (244, 63, 94))
    draw.text((120, 260), "MISSION CONTROL IS 20 MINUTES AWAY", font=f_huge, fill=(251, 146, 60))
    
    draw.rounded_rectangle([(120, 380), (1050, 750)], radius=16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    f_tbl_head = get_font(FONT_BOLD, 26)
    draw.text((160, 420), "NASA EARTH-INDEPENDENT MEDICAL OPERATIONS (EIMO)", font=f_tbl_head, fill=(56, 189, 248))
    f_tbl_row = get_font(FONT_REG, 24)
    rows = [
        ("Speed-of-light One-Way Delay:", "20 to 22 Minutes"),
        ("Solar Conjunction Blackout:", "Up to 2 Weeks (Zero Signal)"),
        ("Onboard Physician Available:", "None Guaranteed"),
        ("Crew Role in Emergency:", "Autonomous First Responders")
    ]
    y_off = 480
    for label, val in rows:
        draw.text((160, y_off), label, font=f_tbl_row, fill=(148, 163, 184))
        draw.text((620, y_off), val, font=get_font(FONT_BOLD, 24), fill=(241, 245, 249))
        y_off += 55
        
    draw.rounded_rectangle([(1150, 380), (1780, 750)], radius=16, fill=(30, 41, 59))
    draw.text((1190, 430), "THE FLIGHT CRITICAL REALITY", font=get_font(FONT_BOLD, 28), fill=(251, 191, 36))
    draw.text((1190, 500), "Waiting for ground telemetry analysis\nis not an option in deep space.", font=f_sub, fill=(226, 232, 240))
    draw.text((1190, 580), "The crew must assess, triage, and act\nwith whatever supplies are on board.", font=f_sub, fill=(226, 232, 240))
    
    draw_subtitle(draw, "There is no doctor on board, and Mission Control is twenty minutes away.")
    img.save(os.path.join(SCENES_DIR, "S02.png"))

    # --- S03: Team Extokened ---
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHO · TEAM", "TEAM EXTOKENED · NASA SPACE APPS CHALLENGE 2026", (168, 85, 247))
    
    # Team card 1: Sobuj
    draw.rounded_rectangle([(140, 240), (880, 760)], radius=20, fill=(30, 41, 59), outline=(168, 85, 247), width=3)
    draw.ellipse([(430, 280), (590, 440)], fill=(51, 65, 85), outline=(192, 132, 252), width=3)
    draw.text((475, 335), "SIS", font=get_font(FONT_BOLD, 46), fill=(241, 245, 249))
    draw.text((250, 470), "SAJIDUL ISLAM SOBUJ", font=get_font(FONT_BOLD, 34), fill=(248, 250, 252))
    draw.text((220, 520), "Lead Software Architect & UI Engineer", font=get_font(FONT_REG, 24), fill=(192, 132, 252))
    draw.text((180, 580), "• Decoupled offline engine architecture\n• Deterministic clinical rule algorithms\n• Vitest automated testing suite (44 tests)\n• Swiss clinical light theme UI implementation", font=get_font(FONT_REG, 22), fill=(203, 213, 225))

    # Team card 2: Yarin
    draw.rounded_rectangle([(960, 240), (1700, 760)], radius=20, fill=(30, 41, 59), outline=(168, 85, 247), width=3)
    draw.ellipse([(1250, 280), (1410, 440)], fill=(51, 65, 85), outline=(192, 132, 252), width=3)
    draw.text((1305, 335), "Y", font=get_font(FONT_BOLD, 46), fill=(241, 245, 249))
    draw.text((1180, 470), "YARIN", font=get_font(FONT_BOLD, 34), fill=(248, 250, 252))
    draw.text((1050, 520), "Clinical Literature Researcher & Presentation Lead", font=get_font(FONT_REG, 24), fill=(192, 132, 252))
    draw.text((1000, 580), "• Clinical literature curation (CDC, NIH, NASA HRP)\n• Spaceflight medical scenario formulation\n• Approval Register governance (A1–A7)\n• Provenance auditing & scientific citations", font=get_font(FONT_REG, 22), fill=(203, 213, 225))
    
    draw_subtitle(draw, "We are Team Extokened from Bangladesh. I am Sajidul Islam Sobuj, lead software architect, alongside clinical researcher Yarin.")
    img.save(os.path.join(SCENES_DIR, "S03.png"))

    # --- S04: Project Reveal (Storm Shield) ---
    img, draw = create_base_canvas((11, 17, 33))
    draw_header(draw, "WHO · MISSION", "PROJECT IDENTITY & OBJECTIVE", (56, 189, 248))
    
    draw.text((120, 240), "STORM SHIELD 🛡️", font=get_font(FONT_BOLD, 68), fill=(56, 189, 248))
    draw.text((120, 330), "Autonomous Health Monitoring & Solar Radiation Decision Support", font=get_font(FONT_BOLD, 32), fill=(241, 245, 249))
    
    draw.rounded_rectangle([(120, 420), (1780, 760)], radius=18, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    cards = [
        ("1. WATCHES THE SUN", "Satellite proton flux telemetry mapped to NOAA S-Scale (S1-S5) with Artemis I Orion storm shelter dose reduction modeling."),
        ("2. WATCHES THE CREW", "Anatomical Health Twin judging vitals against personal baseline first, with CSA Bio-Monitor wearable feed integration."),
        ("3. GUIDES SAFE ACTION", "Supply-aware Care Mode enforcing allergy contraindications, with multi-tab crew alerts and 30s flight surgeon handoffs.")
    ]
    x_c = 160
    for h, desc in cards:
        draw.rounded_rectangle([(x_c, 460), (x_c + 480, 720)], radius=12, fill=(30, 41, 59))
        draw.text((x_c + 30, 490), h, font=get_font(FONT_BOLD, 26), fill=(56, 189, 248))
        draw.text((x_c + 30, 550), desc, font=get_font(FONT_REG, 22), fill=(226, 232, 240))
        x_c += 530
        
    draw_subtitle(draw, "As humanity prepares to return to the Moon and journey to Mars, we created Storm Shield — an autonomous medical guardian.")
    img.save(os.path.join(SCENES_DIR, "S04.png"))

    # --- S05: Challenge & 5 Hazards ---
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHY · CHALLENGE", "NASA SPACE APPS CHALLENGE 2026", (245, 158, 11))
    draw.text((120, 220), "OFFICIAL CHALLENGE BRIEF:", font=get_font(FONT_BOLD, 28), fill=(245, 158, 11))
    draw.text((120, 270), "“ Create Health Monitoring Software for Astronauts on Space Missions ”", font=get_font(FONT_BOLD, 38), fill=(255, 255, 255))
    
    draw.text((120, 380), "THE FIVE HAZARDS OF HUMAN SPACEFLIGHT (NASA HRP):", font=get_font(FONT_BOLD, 26), fill=(148, 163, 184))
    hazards = [
        ("RADIATION", "Solar Particle Events & Galactic Cosmic Rays"),
        ("ISOLATION", "Confinement & circadian desynchrony"),
        ("DISTANCE", "22-min comms delay & blackout"),
        ("GRAVITY", "Microgravity fluid shift & bone loss"),
        ("ENVIRONMENT", "Closed, hostile spacecraft habitat")
    ]
    x_h = 120
    for h_name, h_desc in hazards:
        draw.rounded_rectangle([(x_h, 440), (x_h + 300, 740)], radius=14, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
        draw.text((x_h + 20, 480), h_name, font=get_font(FONT_BOLD, 26), fill=(251, 191, 36))
        draw.text((x_h + 20, 560), h_desc, font=get_font(FONT_REG, 20), fill=(203, 213, 225))
        x_h += 330
        
    draw_subtitle(draw, "Addressing NASA’s official challenge, 'Create Health Monitoring Software for Astronauts on Space Missions,' we examined the five hazards.")
    img.save(os.path.join(SCENES_DIR, "S05.png"))

    # --- S06: Solar Storm & 4,000x surge ---
    img, draw = create_base_canvas((24, 10, 10))
    draw_header(draw, "WHY · SOLAR RADIATION", "SOLAR PARTICLE EVENTS & PROTON FLUX", (239, 68, 68))
    draw.text((120, 240), "SATELLITE DATA: 4,000-FOLD PROTON SURGE", font=f_huge, fill=(248, 113, 113))
    
    draw.rounded_rectangle([(120, 360), (1000, 750)], radius=16, fill=(40, 15, 15), outline=(239, 68, 68), width=2)
    draw.text((160, 410), "NOAA SWPC GOES-16 SATELLITE TELEMETRY", font=get_font(FONT_BOLD, 26), fill=(254, 202, 202))
    draw.text((160, 480), "• Baseline Flux (<10 MeV):  1 pfu (Nominal Spaceflight)\n• Solar Superstorm Peak:    4,200 pfu (S3 Strong Storm)\n• Flux Increase:           4,200x Background Surge\n• CDC ARS Clinical Limit:   >= 700 mGy Whole-Body Dose", font=get_font(FONT_REG, 24), fill=(254, 226, 226))
    
    draw.rounded_rectangle([(1060, 360), (1780, 750)], radius=16, fill=(30, 41, 59))
    draw.text((1100, 410), "WHY IT CANNOT WAIT FOR EARTH", font=get_font(FONT_BOLD, 28), fill=(251, 146, 60))
    draw.text((1100, 480), "Solar energetic protons penetrate habitat walls\ncausing acute nausea, vomiting, and cellular damage.", font=f_sub, fill=(226, 232, 240))
    draw.text((1100, 580), "Early antiemetic triage and shelter entry\nmust occur within minutes — not hours.", font=f_sub, fill=(253, 186, 116))
    
    draw_subtitle(draw, "On a Mars transit, radio signals take 22 minutes. Meanwhile, solar particle events can surge proton flux over four-thousand-fold.")
    img.save(os.path.join(SCENES_DIR, "S06.png"))

    # --- S07: Microgravity Pathology ---
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHY · MICROGRAVITY", "PHYSIOLOGICAL REMODELING IN WEIGHTLESSNESS", (59, 130, 246))
    draw.text((120, 230), "MICROGRAVITY CEPHALAD FLUID SHIFT", font=f_huge, fill=(96, 165, 250))
    
    draw.rounded_rectangle([(120, 340), (1780, 750)], radius=16, fill=(30, 41, 59), outline=(59, 130, 246), width=2)
    pathologies = [
        ("FLUID REDISTRIBUTION", "Up to 2 liters of blood and interstitial fluid shift from the lower limbs toward the chest and head, causing facial puffiness and elevated central venous pressure."),
        ("CARDIOVASCULAR STRAIN", "Loss of hydrostatic pressure leads to left ventricular remodeling, baroreflex deconditioning, and increased susceptibility to acute dysrhythmia."),
        ("THE CLINICAL DILEMMA", "Space motion sickness and cephalad congestion mimic acute chest distress. Crew must differentiate cardiovascular events from benign microgravity adaptation.")
    ]
    x_p = 160
    for p_head, p_body in pathologies:
        draw.rounded_rectangle([(x_p, 380), (x_p + 480, 710)], radius=12, fill=(15, 23, 42))
        draw.text((x_p + 30, 420), p_head, font=get_font(FONT_BOLD, 26), fill=(96, 165, 250))
        draw.text((x_p + 30, 490), p_body, font=get_font(FONT_REG, 22), fill=(226, 232, 240))
        x_p += 530
        
    draw_subtitle(draw, "Combined with microgravity fluid shifts that strain the heart, an acute medical crisis cannot wait for Earth.")
    img.save(os.path.join(SCENES_DIR, "S07.png"))

    # --- S08: The Critical Gap (Wearables vs LLM Hallucinations) ---
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHY · THE CRITICAL GAP", "EXISTING WEARABLES VS GENERATIVE AI RISKS", (239, 68, 68))
    
    # Left: Wearables gap
    draw.rounded_rectangle([(120, 240), (920, 750)], radius=18, fill=(30, 41, 59), outline=(245, 158, 11), width=2)
    draw.text((160, 280), "CURRENT SPACE WEARABLES", font=get_font(FONT_BOLD, 30), fill=(251, 191, 36))
    draw.text((160, 360), "• Passive telemetry collectors\n• Stream vitals to scientists on Earth\n• NO onboard next-step guidance\n• Silent during deep-space blackouts", font=get_font(FONT_REG, 24), fill=(226, 232, 240))

    # Right: LLM Hallucination risk
    draw.rounded_rectangle([(980, 240), (1780, 750)], radius=18, fill=(30, 41, 59), outline=(239, 68, 68), width=2)
    draw.text((1020, 280), "UNCONSTRAINED GENERATIVE AI", font=get_font(FONT_BOLD, 30), fill=(248, 113, 113))
    draw.text((1020, 360), "• Severe medical hallucination risk\n• Non-deterministic drug recommendations\n• Can recommend contraindicated drugs\n• FATAL in flight-critical healthcare", font=get_font(FONT_REG, 24), fill=(254, 202, 202))

    draw_subtitle(draw, "Current wearables leave crews without guidance, while generative AI risks hallucinations. Astronauts need grounded intelligence.")
    img.save(os.path.join(SCENES_DIR, "S08.png"))

    # --- S09: Real UI Overview & NASA Datasets ---
    # Load actual screenshot overview_v4.png
    shot = Image.open(os.path.join(rec_dir, "overview_v4.png")).resize((1400, 640))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHAT · SYSTEM DEMO", "REAL SATELLITE TELEMETRY & NASA DONKI GATEWAY", (16, 185, 129))
    img.paste(shot, (260, 110))
    draw.rectangle([(260, 110), (1660, 750)], outline=(16, 185, 129), width=3)
    
    # Overlay badges
    draw.rounded_rectangle([(40, 130), (230, 270)], radius=12, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw.text((55, 150), "DATASETS:", font=get_font(FONT_BOLD, 18), fill=(56, 189, 248))
    draw.text((55, 185), "• NASA DONKI\n• NOAA GOES-16\n• NASA RadLab", font=get_font(FONT_REG, 16), fill=(241, 245, 249))
    
    draw_subtitle(draw, "Storm Shield ingests live alerts from NASA CCMC DONKI and NOAA SWPC GOES-16 Proton Flux, benchmarked with NASA RadLab.")
    img.save(os.path.join(SCENES_DIR, "S09.png"))

    # --- S10: Artemis I Orion 4x Shelter Attenuation ---
    # Load storm_screen.png
    shot_storm = Image.open(os.path.join(rec_dir, "storm_screen.png")).resize((1300, 630))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHAT · PHYSICS MODEL", "ARTEMIS I ORION STORM SHELTER ATTENUATION", (56, 189, 248))
    img.paste(shot_storm, (60, 120))
    draw.rectangle([(60, 120), (1360, 750)], outline=(56, 189, 248), width=2)
    
    # Annotation card
    draw.rounded_rectangle([(1400, 140), (1860, 730)], radius=16, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw.text((1430, 180), "PHYSICAL SHIELDING", font=get_font(FONT_BOLD, 26), fill=(56, 189, 248))
    draw.text((1430, 240), "• Artemis I Orion Data\n  (Nature, 2024)\n\n• Storm Shelter Factor:\n  ~4.0x Dose Reduction\n\n• Example:\n  Ambient: 140 mGy\n  Shelter:  35 mGy\n\n• Triggers Post-Storm\n  Mandatory Body Check", font=get_font(FONT_REG, 22), fill=(241, 245, 249))
    
    draw_subtitle(draw, "Applying Artemis I Orion Radiation Measurements, our engine models four-fold shielding protection inside the storm shelter.")
    img.save(os.path.join(SCENES_DIR, "S10.png"))

    # --- S11: Health Twin & Baseline ---
    shot_twin = Image.open(os.path.join(rec_dir, "health_twin_screen_v4.png")).resize((1400, 640))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHAT · HEALTH TWIN", "PERSONAL BASELINE-FIRST COMPARISON (NASA-STD-3001)", (56, 189, 248))
    img.paste(shot_twin, (260, 110))
    draw.rectangle([(260, 110), (1660, 750)], outline=(56, 189, 248), width=3)
    
    draw_subtitle(draw, "Wearable sensor feeds are evaluated by an interactive Health Twin against the astronaut’s personal baseline and NASA Standard 3001.")
    img.save(os.path.join(SCENES_DIR, "S11.png"))

    # --- S12: Wearable Anomaly & Multi-Tab Crew Alert ---
    shot_care = Image.open(os.path.join(rec_dir, "care_screen.png")).resize((1400, 640))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHAT · WEARABLE FEED", "PERSISTENCE ANOMALY RULE (N=3) & CREW ALERTS", (244, 63, 94))
    img.paste(shot_care, (260, 110))
    draw.rectangle([(260, 110), (1660, 750)], outline=(244, 63, 94), width=3)
    
    draw_subtitle(draw, "In this live demo, Pilot Alex Vance develops distress. Our persistence engine confirms the anomaly, alerting crew across tabs.")
    img.save(os.path.join(SCENES_DIR, "S12.png"))

    # --- S13: Care Mode Allergy Lock & Handoff ---
    shot_handoff = Image.open(os.path.join(rec_dir, "handoff_screen.png")).resize((1400, 640))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "WHAT · CLINICAL SAFETY", "ALLERGY CONTRAINDICATION LOCK & 30-SECOND HANDOFF", (16, 185, 129))
    img.paste(shot_handoff, (260, 110))
    draw.rectangle([(260, 110), (1660, 750)], outline=(16, 185, 129), width=3)
    
    draw_subtitle(draw, "Because Alex has an aspirin allergy, administration is strictly blocked, instantly creating a thirty-second flight surgeon handoff.")
    img.save(os.path.join(SCENES_DIR, "S13.png"))

    # --- S14: Autonomy Ladder Level 2 ---
    shot_ast = Image.open(os.path.join(rec_dir, "assistant_v4.png")).resize((1300, 630))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "IMPACT · AUTONOMY LADDER", "NASA AUTONOMY LEVEL 2: HUMAN ACTS, SOFTWARE GUIDES", (16, 185, 129))
    img.paste(shot_ast, (60, 120))
    draw.rectangle([(60, 120), (1360, 750)], outline=(16, 185, 129), width=2)
    
    draw.rounded_rectangle([(1400, 140), (1860, 730)], radius=16, fill=(30, 41, 59), outline=(16, 185, 129), width=2)
    draw.text((1430, 180), "AUTONOMY LADDER", font=get_font(FONT_BOLD, 26), fill=(16, 185, 129))
    draw.text((1430, 240), "• Level 0: Displays Data\n• Level 1: Advises Norms\n\n• LEVEL 2 (OUR SYSTEM):\n  Guides Step-by-Step,\n  Calculates & Records;\n  HUMAN ACTS.\n\n• Level 5-6: Autonomous\n  treatment (Not Claimed)\n\n• ZERO HALLUCINATION:\n  Grounded clinical Q&A", font=get_font(FONT_REG, 20), fill=(241, 245, 249))
    
    draw_subtitle(draw, "Who benefits? Astronauts and Medical Officers gain a panic-free co-pilot adhering to NASA Autonomy Level 2.")
    img.save(os.path.join(SCENES_DIR, "S14.png"))

    # --- S15: 44 Vitest Tests Passing & Earth Spin-offs ---
    shot_src = Image.open(os.path.join(rec_dir, "sources_v4.png")).resize((1300, 630))
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "IMPACT · RIGOR & SPIN-OFFS", "44 VITEST TESTS PASSING & TERRESTRIAL TELEMEDICINE", (56, 189, 248))
    img.paste(shot_src, (60, 120))
    draw.rectangle([(60, 120), (1360, 750)], outline=(56, 189, 248), width=2)
    
    draw.rounded_rectangle([(1400, 140), (1860, 730)], radius=16, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw.text((1430, 180), "EARTH SPIN-OFFS", font=get_font(FONT_BOLD, 26), fill=(56, 189, 248))
    draw.text((1430, 240), "• 44/44 Tests Passed\n  (Vitest verified)\n\n• Zero Illustrative Data\n  (100% cited sources)\n\n• Antarctic Stations:\n  Extreme isolation care\n\n• Maritime Vessels:\n  Zero-comms navigation\n\n• Disaster Relief:\n  Offline field clinics", font=get_font(FONT_REG, 20), fill=(241, 245, 249))
    
    draw_subtitle(draw, "What changes is total situational clarity. Our engine passed 44 unit tests, extending to Antarctic bases and remote disaster zones.")
    img.save(os.path.join(SCENES_DIR, "S15.png"))

    # --- S16: Future Roadmap ---
    img, draw = create_base_canvas((15, 23, 42))
    draw_header(draw, "IMPACT · ROADMAP", "ENGINEERING ROADMAP & ADVANCED AUTONOMY", (168, 85, 247))
    draw.text((120, 240), "FUTURE FLIGHT-READINESS ROADMAP", font=f_huge, fill=(192, 132, 252))
    
    steps = [
        ("PHASE 1: CURRENT PROTOTYPE", "Level 2 clinical decision support, simulated CSA Bio-Monitor feed, 44 unit tests, offline client-side execution."),
        ("PHASE 2: BLE BIOMETRIC MESH", "Direct Bluetooth Low Energy integration with flight-certified wearable sensors and ambient cabin dosimeters."),
        ("PHASE 3: ON-DEVICE SMALL LM", "Quantized local Small Language Models (SLM) for ambient conversational note taking and automated charting.")
    ]
    x_r = 120
    for s_title, s_desc in steps:
        draw.rounded_rectangle([(x_r, 360), (x_r + 520, 740)], radius=16, fill=(30, 41, 59), outline=(168, 85, 247), width=2)
        draw.text((x_r + 30, 410), s_title, font=get_font(FONT_BOLD, 26), fill=(216, 180, 254))
        draw.text((x_r + 30, 500), s_desc, font=get_font(FONT_REG, 22), fill=(241, 245, 249))
        x_r += 550
        
    draw_subtitle(draw, "Looking forward, we are advancing toward hardware Bluetooth biometrics and private on-device language models for ambient charting.")
    img.save(os.path.join(SCENES_DIR, "S16.png"))

    # --- S17: Final Closing & Sign-off ---
    img, draw = create_base_canvas((8, 14, 28))
    draw_header(draw, "IMPACT · CONCLUSION", "TEAM EXTOKENED · NASA SPACE APPS CHALLENGE 2026", (56, 189, 248))
    
    draw.text((120, 260), "STORM SHIELD 🛡️", font=get_font(FONT_BOLD, 76), fill=(56, 189, 248))
    draw.text((120, 370), "“ In deep space, autonomy is not a luxury — it is survival. ”", font=get_font(FONT_BOLD, 36), fill=(255, 255, 255))
    draw.text((120, 440), "Wherever humanity journeys, our astronauts will never face the storm alone.", font=get_font(FONT_REG, 28), fill=(203, 213, 225))
    
    draw.rounded_rectangle([(120, 530), (1780, 740)], radius=16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    draw.text((160, 570), "TEAM EXTOKENED", font=get_font(FONT_BOLD, 32), fill=(56, 189, 248))
    draw.text((160, 630), "Sajidul Islam Sobuj  ·  Lead Software Architect & Engineer\nYarin  ·  Clinical Literature Researcher & Presentation Lead\nDhaka, Bangladesh", font=get_font(FONT_REG, 24), fill=(241, 245, 249))

    draw_subtitle(draw, "In deep space, autonomy is survival. We are Team Extokened. With Storm Shield, astronauts will never face the storm alone.")
    img.save(os.path.join(SCENES_DIR, "S17.png"))
    
    print("All 17 scene graphics generated successfully in", SCENES_DIR)

if __name__ == "__main__":
    build_all_scenes()
