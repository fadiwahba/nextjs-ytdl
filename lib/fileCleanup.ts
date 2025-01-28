import fs from "fs";
import path from "path";

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

    // Increased to 10 minutes (600000 ms)
    if (now - stat.mtimeMs > 10 * 60 * 1000) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
      }
    }
  });
};
