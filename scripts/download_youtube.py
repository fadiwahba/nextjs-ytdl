import os
import subprocess
import sys

def download_youtube_video(url, output_format, quality="best"):
    try:
        tmp_dir = os.path.join(os.getcwd(), "public", "tmp")
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)

        # Set output filename based on format
        output_filename = f"downloaded_{'audio' if output_format == 'mp3' else 'video'}.{output_format}"
        output_file = os.path.join(tmp_dir, output_filename)
        
        # Remove the file if it already exists
        if os.path.exists(output_file):
            os.remove(output_file)

        # Base command
        command = [
            "yt-dlp",
            url,
            "-o", output_file,
            "--force-overwrites"  # Ensure we can overwrite existing files
        ]

        # Add format-specific options
        if output_format == "mp3":
            command.extend([
                "--extract-audio",
                "--audio-format", "mp3",
                "--audio-quality", "0"  # Best quality
            ])
        elif output_format == "mp4":
            command.extend(["-f", "best[ext=mp4]/best"])  # Prefer MP4 format

        # Execute the download
        subprocess.run(command, check=True)

        # Verify the file exists
        if not os.path.exists(output_file):
            print(f"Error: File {output_file} does not exist!", file=sys.stderr)
            sys.exit(1)

        print(f"Download completed. File saved as: {output_file}")
        return output_file

    except subprocess.CalledProcessError as e:
        print(f"Error downloading media: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python download_youtube.py <youtube_url> <output_format> <quality>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    output_format = sys.argv[2]
    quality = sys.argv[3]

    download_youtube_video(url, output_format, quality)