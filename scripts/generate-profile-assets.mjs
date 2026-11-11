import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../profile-assets");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const SECTIONS = [
  {
    filename: "hero-light.svg",
    url: "https://www.gitskins.com/api/section/hero?username=ardianryan&theme=aurora&mode=light",
  },
  {
    filename: "hero-dark.svg",
    url: "https://www.gitskins.com/api/section/hero?username=ardianryan&theme=aurora&mode=dark",
  },
  {
    filename: "wordmark.svg",
    url: "https://www.gitskins.com/api/section/wordmark?username=ardianryan&theme=aurora&label=Ardian%20Ryan",
  },
  {
    filename: "stack-light.svg",
    url: "https://www.gitskins.com/api/section/stack?username=ardianryan&theme=aurora&mode=light",
  },
  {
    filename: "stack-dark.svg",
    url: "https://www.gitskins.com/api/section/stack?username=ardianryan&theme=aurora&mode=dark",
  },
  {
    filename: "stats-light.svg",
    url: "https://www.gitskins.com/api/section/stats?username=ardianryan&theme=aurora&mode=light",
  },
  {
    filename: "stats-dark.svg",
    url: "https://www.gitskins.com/api/section/stats?username=ardianryan&theme=aurora&mode=dark",
  },
  {
    filename: "highlights-light.svg",
    url: "https://www.gitskins.com/api/section/highlights?username=ardianryan&theme=aurora&mode=light&items=Network+Engineering::MikroTik+certified%2C+designing+enterprise+network+infrastructure|Web+Development::Building+Laravel+%2B+React+SPA+applications+for+education+sector|Open+Source::Developing+SIEKSA+V3+and+ScholarGate+for+Indonesian+schools",
  },
  {
    filename: "highlights-dark.svg",
    url: "https://www.gitskins.com/api/section/highlights?username=ardianryan&theme=aurora&mode=dark&items=Network+Engineering::MikroTik+certified%2C+designing+enterprise+network+infrastructure|Web+Development::Building+Laravel+%2B+React+SPA+applications+for+education+sector|Open+Source::Developing+SIEKSA+V3+and+ScholarGate+for+Indonesian+schools",
  },
];

function cleanSvg(svgText) {
  let cleaned = svgText;

  // 1. Remove GitSkins Pro preview watermark overlay group
  cleaned = cleaned.replace(
    /<g aria-label="Pro preview: unlock this template at gitskins\.com"[\s\S]*?<\/g>\s*<\/g>/gi,
    ""
  );

  // 2. Remove any remaining gitskins promo text
  cleaned = cleaned.replace(
    /<text[^>]*>gitskins\.com<\/text>/gi,
    ""
  );

  // 3. Clean "styled by GitSkins" subtitle in stats to clean subtitle
  cleaned = cleaned.replace(
    /styled by GitSkins/gi,
    "· live profile telemetry"
  );

  return cleaned;
}

async function run() {
  console.log("Generating clean profile SVGs...");

  for (const item of SECTIONS) {
    const destPath = path.join(outputDir, item.filename);
    try {
      console.log(`Fetching ${item.filename} from ${item.url.slice(0, 50)}...`);
      const res = await fetch(item.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "image/svg+xml,image/*,*/*",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const text = await res.text();
      if (!text.includes("<svg")) {
        throw new Error("Response is not an SVG");
      }

      const cleaned = cleanSvg(text);
      fs.writeFileSync(destPath, cleaned, "utf8");
      console.log(`✓ Saved ${item.filename} (${cleaned.length} bytes, paywall stripped)`);
    } catch (err) {
      console.error(`✗ Error processing ${item.filename}:`, err.message);
      if (!fs.existsSync(destPath)) {
        console.warn(`No existing fallback found for ${item.filename}`);
      } else {
        console.log(`Kept existing ${item.filename}`);
      }
    }
  }

  console.log("All profile assets updated successfully!");
}

run();
