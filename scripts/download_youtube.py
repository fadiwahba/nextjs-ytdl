import os
import subprocess
import sys
import re

def sanitize_filename(title):
    """
    Sanitize the filename by:
    1. Replacing spaces and special chars with underscores
    2. Removing any non-alphanumeric characters except underscores and hyphens
    3. Limiting length to avoid path length issues
    """
    # Replace spaces and special chars with underscores
    sanitized = re.sub(r'[^\w\-]', '_', title)
    # Remove consecutive underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    # Remove leading/trailing underscores
    sanitized = sanitized.strip('_')
    # Limit length to 50 chars (adjust if needed)
    return sanitized[:50]

def download_youtube_video(url, output_format, quality="best"):
    try:
        tmp_dir = os.path.join(os.getcwd(), "public", "tmp")
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)

        # First, get the video title
        title_command = ["yt-dlp", "--get-title", url]
        video_title = subprocess.check_output(title_command).decode('utf-8').strip()
        
        # Sanitize the title and create filename
        safe_title = sanitize_filename(video_title)
        output_filename = f"{safe_title}.{output_format}"
        output_file = os.path.join(tmp_dir, output_filename)
        
        # Remove the file if it already exists
        if os.path.exists(output_file):
            os.remove(output_file)

        # Base command
        command = [
            "yt-dlp",
            url,
            "-o", output_file,
            "--force-overwrites"
        ]

        # Add format-specific options
        if output_format == "mp3":
            command.extend([
                "--extract-audio",
                "--audio-format", "mp3",
                "--audio-quality", "0"
            ])
        elif output_format == "mp4":
            command.extend(["-f", "best[ext=mp4]/best"])

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