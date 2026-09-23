import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ⚠️ NO HARDCODED SCHOOL DATA HERE.
 * All institution identity (name, phone, email, address etc.) MUST come
 * from the Admin panel and be stored in `school-config.json` or the database.
 *
 * This file only provides structural defaults. It does NOT contain
 * any school-specific values.
 */

let config = {
  institution: {
    name: null,
    hubName: null,
    fullName: null,
    shortName: null,
    motto: null,
    contactEmail: null,
    contactPhone: null,
    address: null,
    emailDomain: null
  },
  theme: {
    primary: "#111827",
    secondary: "#2563eb",
    accent: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    surface: "#ffffff",
    background: "#F8FAFC"
  },
  system: {
    version: "v2.5.0",
    status: "Stable Production",
    footerText: "Authorized Academic Result Governance",
    enableTransport: true,
    enableGrievance: true,
    enableCompliance: true,
    maxClass: "12TH"
  }
};

const possiblePaths = [
  path.join(process.cwd(), '../school-config.json'),
  path.join(process.cwd(), 'school-config.json'),
  path.resolve(__dirname, '../../../school-config.json')
];

let loaded = false;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      const rawData = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(rawData);
      config.institution = { ...config.institution, ...parsed.institution };
      config.theme = { ...config.theme, ...parsed.theme };
      config.system = { ...config.system, ...parsed.system };
      console.log(`🟢 [Config] Loaded school configuration from: ${p}`);
      loaded = true;
      break;
    } catch (err) {
      console.error(`🔴 [Config] Failed to parse config at ${p}:`, err.message);
    }
  }
}

if (!loaded) {
  console.error("🔴 [Config] school-config.json not found! Institution data is empty. Please configure from Admin panel.");
}

export default config;
