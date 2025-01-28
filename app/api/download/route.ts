import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const downloadScriptPath = path.join(
  process.cwd(),
  "scripts",
  "download_youtube.py"
);
const publicTmpPath = path.join(process.cwd(), "public", "tmp");

// Ensure the tmp directory exists
if (!fs.existsSync(publicTmpPath)) {
  fs.mkdirSync(publicTmpPath, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, format } = body;

    if (!url || !format) {
      return NextResponse.json(
        { error: "Missing required parameters: url, format" },
        { status: 400 }
      );
    }

    if (!["mp3", "mp4"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Supported formats are: mp3, mp4" },
        { status: 400 }
      );
    }

    const command = `python ${downloadScriptPath} ${url} ${format} best`;

    return new Promise((resolve, reject) => {
      exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing Python script:", stderr);
          reject(new Error(`Failed to download media: ${stderr || stdout}`));
          return;
        }

        const outputLines = stdout.split("\n");
        const savedFileLine = outputLines.find((line) =>
          line.startsWith("Download completed. File saved as:")
        );

        if (!savedFileLine) {
          reject(
            new Error("Could not find downloaded file path in script output")
          );
          return;
        }

        const fullFilePath = savedFileLine
          .replace("Download completed. File saved as:", "")
          .trim();

        if (!fs.existsSync(fullFilePath)) {
          reject(
            new Error(`Downloaded file not found at path: ${fullFilePath}`)
          );
          return;
        }

        // Get the public URL path
        const publicPath = path.join(process.cwd(), "public");
        const relativePath = path.relative(publicPath, fullFilePath);
        const urlPath = "/" + relativePath.split(path.sep).join("/");

        // Include both the URL path and the sanitized filename in the response
        const filename = path.basename(fullFilePath);
        resolve(
          NextResponse.json({
            filePath: urlPath,
            filename: filename,
          })
        );
      });
    });
  } catch (err) {
    console.error("Error in download route:", err);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
