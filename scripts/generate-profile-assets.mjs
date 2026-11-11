import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../profile-assets");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const FEATURED_REPOS = [
  { id: 0, repo: "Jalasmara-The-Game" },
  { id: 1, repo: "qbiz-qrisdinamis" },
  { id: 2, repo: "MikroTik-Skill" },
  { id: 3, repo: "pemilu-ppts" },
  { id: 4, repo: "papermc-skill" },
  { id: 5, repo: "eyd-v" },
];

const METRO_SECTIONS = [
  {
    filename: "metro-map-light.svg",
    url: "https://www.gitskins.com/api/section/metro-map?username=ardianryan&mode=light&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-map-dark.svg",
    url: "https://www.gitskins.com/api/section/metro-map?username=ardianryan&mode=dark&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-about-light.svg",
    url: "https://www.gitskins.com/api/section/metro-about?username=ardianryan&mode=light&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-about-dark.svg",
    url: "https://www.gitskins.com/api/section/metro-about?username=ardianryan&mode=dark&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-stack-light.svg",
    url: "https://www.gitskins.com/api/section/metro-stack?username=ardianryan&mode=light&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-stack-dark.svg",
    url: "https://www.gitskins.com/api/section/metro-stack?username=ardianryan&mode=dark&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-log-light.svg",
    url: "https://www.gitskins.com/api/section/metro-log?username=ardianryan&mode=light&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-log-dark.svg",
    url: "https://www.gitskins.com/api/section/metro-log?username=ardianryan&mode=dark&v=" + new Date().toISOString().slice(0, 10),
  },
  {
    filename: "metro-streak-dark.svg",
    url: "https://streak-stats.demolab.com?user=ardianryan&background=11161D&border=262C36&border_radius=16&ring=B07219&fire=B07219&currStreakNum=F0F6FC&sideNums=F0F6FC&currStreakLabel=B07219&sideLabels=9198A1&dates=9198A1",
  },
  {
    filename: "metro-streak-light.svg",
    url: "https://streak-stats.demolab.com?user=ardianryan&background=F6F8FA&border=D0D7DE&border_radius=16&ring=B07219&fire=B07219&currStreakNum=1F2328&sideNums=1F2328&currStreakLabel=B07219&sideLabels=656D76&dates=656D76",
  },
];

// Add card items for each repo in light and dark mode
for (const item of FEATURED_REPOS) {
  METRO_SECTIONS.push({
    filename: `metro-card-${item.id}-light.svg`,
    url: `https://www.gitskins.com/api/section/metro-card?username=ardianryan&i=${item.id}&r=${item.repo}&mode=light&v=` + new Date().toISOString().slice(0, 10),
  });
  METRO_SECTIONS.push({
    filename: `metro-card-${item.id}-dark.svg`,
    url: `https://www.gitskins.com/api/section/metro-card?username=ardianryan&i=${item.id}&r=${item.repo}&mode=dark&v=` + new Date().toISOString().slice(0, 10),
  });
}

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

  return cleaned;
}

async function run() {
  console.log("Generating clean Commit Metro SVGs for @ardianryan...");

  for (const item of METRO_SECTIONS) {
    const destPath = path.join(outputDir, item.filename);
    try {
      console.log(`Fetching ${item.filename}...`);
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
      if (fs.existsSync(destPath)) {
        console.log(`  (Kept existing cached ${item.filename})`);
      }
    }
  }

  console.log("All Commit Metro assets updated successfully!");
}

run();
