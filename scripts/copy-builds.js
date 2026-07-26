import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source directory not found: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Copying build outputs to public directory...');

// Create public directory
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Copy main frontend dist to public root
const frontendDist = path.join(rootDir, 'project', 'dist');
console.log('📁 Copying frontend build...');
copyDir(frontendDist, publicDir);

// Copy admin dashboard dist to public/admin
const adminDist = path.join(rootDir, 'admin-dashboard', 'dist');
const adminPublic = path.join(publicDir, 'admin');
console.log('📁 Copying admin dashboard build...');
copyDir(adminDist, adminPublic);

// Copy super admin dashboard dist to public/super-admin
const superAdminDist = path.join(rootDir, 'super-admin-dashboard', 'dist');
const superAdminPublic = path.join(publicDir, 'super-admin');
console.log('📁 Copying super admin dashboard build...');
copyDir(superAdminDist, superAdminPublic);

console.log('✅ Build outputs copied successfully!');
console.log(`   Frontend: ${publicDir}`);
console.log(`   Admin: ${adminPublic}`);
console.log(`   Super Admin: ${superAdminPublic}`);
