import os
import subprocess

SCENES = [
    ("S01.png", 8.0),
    ("S02.png", 7.0),
    ("S03.png", 13.0),
    ("S04.png", 15.0),
    ("S05.png", 15.0),
    ("S06.png", 10.0),
    ("S07.png", 10.0),
    ("S08.png", 22.0),
    ("S09.png", 18.0),
    ("S10.png", 10.0),
    ("S11.png", 8.0),
    ("S12.png", 10.0),
    ("S13.png", 11.0),
    ("S14.png", 18.0),
    ("S15.png", 18.0),
    ("S16.png", 19.0),
    ("S17.png", 16.0)
]

def render_final_video():
    scenes_dir = "space-apps-video/assets/scenes"
    clips_dir = "space-apps-video/output/clips"
    os.makedirs(clips_dir, exist_ok=True)
    concat_list = os.path.join(clips_dir, "concat.txt")
    
    with open(concat_list, "w") as f_concat:
        for idx, (img_name, dur) in enumerate(SCENES):
            in_img = os.path.join(scenes_dir, img_name)
            clip_out = os.path.join(clips_dir, f"clip_{idx:02d}.mp4")
            
            # Subtle smooth motion: slow zoom-in (1.0 to 1.03) or static
            # 30 fps
            frames = int(dur * 30)
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1",
                "-i", in_img,
                "-vf", f"scale=1920:1080,fps=30,format=yuv420p",
                "-t", str(dur),
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-pix_fmt", "yuv420p",
                clip_out
            ]
            print(f"Rendering clip {idx+1}/{len(SCENES)}: {img_name} ({dur}s)...")
            subprocess.check_call(cmd)
            f_concat.write(f"file '{os.path.abspath(clip_out)}'\n")
            
    # Concatenate all clips
    merged_video = "space-apps-video/output/video_only.mp4"
    print("Concatenating video clips...")
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        merged_video
    ]
    subprocess.check_call(cmd_concat)
    
    # Merge with master_audio.wav
    master_audio = "space-apps-video/output/master_audio.wav"
    final_mp4 = "space-apps-video/output/final-space-apps-video.mp4"
    print("Merging video and master audio into final MP4...")
    cmd_merge = [
        "ffmpeg", "-y",
        "-i", merged_video,
        "-i", master_audio,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_mp4
    ]
    subprocess.check_call(cmd_merge)
    
    # Validation with FFprobe
    probe_cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate",
        "-of", "default=noprint_wrappers=1",
        final_mp4
    ]
    probe_out = subprocess.check_output(probe_cmd).decode()
    print("\n================ FINAL VIDEO VALIDATION ================")
    print(probe_out)
    print("Final competition video rendered successfully at:", final_mp4)

if __name__ == "__main__":
    render_final_video()
