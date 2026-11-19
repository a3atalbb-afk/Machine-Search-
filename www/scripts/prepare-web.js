const fs = require("fs");
const path = require("path");

const outDir = path.resolve("www");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const ignoreNames = new Set([
  ".git",
  ".github",
  "node_modules",
  "android",
  "www",
  "scripts",
  "package.json",
  "package-lock.json",
  "capacitor.config.json"
]);

function copyRecursive(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (ignoreNames.has(entry.name)) continue;
    if (entry.name.includes("backup") || entry.name.endsWith(".bak")) continue;

    const sPath = path.join(src, entry.name);
    const dPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(dPath, { recursive: true });
      copyRecursive(sPath, dPath);
    } else {
      fs.copyFileSync(sPath, dPath);
    }
  }
}

copyRecursive(".", outDir);
console.log("✅ Web files copied to www/");
