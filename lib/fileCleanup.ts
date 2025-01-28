import fs from "fs";
import path from "path";

// Define the path to the tmp folder
const tmpDir = path.join(process.cwd(), "public", "tmp");

// Ensure the tmpDir exists, if not, create it
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

export const cleanupOldFiles = () => {
  const now = Date.now();
  const files = fs.readdirSync(tmpDir);

  files.forEach((file) => {
    const filePath = path.join(tmpDir, file);
    const stat = fs.statSync(filePath);

    // Check if the file was modified more than 10 minutes ago (600000 ms)
    if (now - stat.mtimeMs > 10 * 60 * 1000) {
      // If it's older than 10 minutes, delete the file
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${file}`);
    }
  });
};
