import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const certDirectory = path.resolve("cert");
const certPath = path.join(certDirectory, "localhost.pem");
const keyPath = path.join(certDirectory, "localhost-key.pem");

if (!fs.existsSync(certDirectory)) fs.mkdirSync(certDirectory, {
  recursive: true
});

execSync("mkcert -install", {
  stdio: "inherit"
});

execSync(`mkcert -cert-file "${certPath}" -key-file "${keyPath}" localhost 127.0.0.1 ::1`, {
  stdio: "inherit"
});

console.log("Certificate created:");
console.log(certPath);
console.log(keyPath);
