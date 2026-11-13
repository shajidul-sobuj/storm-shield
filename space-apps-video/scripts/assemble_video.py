import os
import subprocess

def assemble_master_video():
    clips_dir = "space-apps-video/assets/clips"
    output_dir = "space-apps-video/output"
    os.makedirs(output_dir, exist_ok=True)

    clip_names = [f"clip_S{i:02d}.mp4" for i in range(1, 18)]
    concat_list = os.path.join(output_dir, "concat_manifest.txt")

    with open(concat_list, "w") as f_concat:
        for cname in clip_names:
            cpath = os.path.abspath(os.path.join(clips_dir, cname))
            if not os.path.exists(cpath):
                raise FileNotFoundError(f"Missing clip: {cpath}")
            f_concat.write(f"file '{cpath}'\n")

    video_only = os.path.join(output_dir, "video_stream_only.mp4")
    master_audio = os.path.join(output_dir, "master_audio.wav")
    final_mp4 = os.path.join(output_dir, "final-space-apps-video.mp4")

    print("Concatenating all 17 motion-animated video clips...")
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        video_only
    ]
    subprocess.check_call(cmd_concat)

    print("Muxing video with 228.0s master audio track...")
    cmd_mux = [
        "ffmpeg", "-y",
        "-i", video_only,
        "-i", master_audio,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_mp4
    ]
    subprocess.check_call(cmd_mux)

    # Verification probe
    probe_cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate",
        "-of", "default=noprint_wrappers=1",
        final_mp4
    ]
    probe_out = subprocess.check_output(probe_cmd).decode()
    print("\n================ FINAL MASTER VIDEO SPECIFICATIONS ================")
    print(probe_out)
    print("Final Master Video produced at:", final_mp4)

if __name__ == "__main__":
    assemble_master_video()
