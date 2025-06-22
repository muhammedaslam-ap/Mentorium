import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of extensions to clean
const extensions = ['.js', '.js.map', '.jsx', '.jsx.map'];

const cleanFolder = path.join(__dirname, 'src');

function deleteFilesRecursively(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      deleteFilesRecursively(fullPath);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${fullPath}`);
    }
  }
}

deleteFilesRecursively(cleanFolder);
