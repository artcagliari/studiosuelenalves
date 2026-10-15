import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import sharp from "sharp";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Uso: node scripts/import-instagram-media.mjs <dataset.json>");

const workspace = process.cwd();
const reviewRoot = resolve(workspace, ".media-review");
const imageRoot = resolve(reviewRoot, "instagram");
await mkdir(imageRoot, { recursive: true });

const posts = JSON.parse(await readFile(inputPath, "utf8"))
  .filter((post) => post.ownerUsername === "studiosuelenvaes");

const assets = [];
for (const post of posts) {
  const children = Array.isArray(post.childPosts) && post.childPosts.length
    ? post.childPosts
    : [post];

  for (const [index, child] of children.entries()) {
    if (!child.displayUrl) continue;
    const file = `${post.shortCode}-${String(index + 1).padStart(2, "0")}.webp`;
    const destination = resolve(imageRoot, file);
    const response = await fetch(child.displayUrl, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; StudioSuelenVaesMediaImport/1.0)" },
    });
    if (!response.ok) {
      console.warn(`Falha ${response.status}: ${post.shortCode} item ${index + 1}`);
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await sharp(buffer)
      .rotate()
      .resize({ width: 1800, height: 2200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 })
      .toFile(destination);

    assets.push({
      file,
      path: destination,
      sourcePostUrl: post.url,
      sourceShortCode: post.shortCode,
      sourceType: post.type,
      sourceTimestamp: post.timestamp,
      caption: post.caption ?? "",
      alt: child.alt ?? post.alt ?? "",
      itemIndex: index + 1,
      width: result.width,
      height: result.height,
    });
    console.log(`${String(assets.length).padStart(2, "0")} ${file}`);
  }
}

await writeFile(
  resolve(reviewRoot, "instagram-media-manifest.json"),
  `${JSON.stringify({ importedAt: new Date().toISOString(), profile: "studiosuelenvaes", assets }, null, 2)}\n`,
);

const columns = 5;
const cellWidth = 250;
const cellHeight = 340;
const rows = Math.ceil(assets.length / columns);
const composites = [];
for (const [index, asset] of assets.entries()) {
  const thumb = await sharp(asset.path)
    .resize({ width: 230, height: 285, fit: "cover", position: "attention" })
    .jpeg({ quality: 80 })
    .toBuffer();
  const label = `${String(index + 1).padStart(2, "0")} · ${basename(asset.file, ".webp")}`;
  const labelSvg = Buffer.from(`<svg width="230" height="38" xmlns="http://www.w3.org/2000/svg"><rect width="230" height="38" fill="#17120f"/><text x="10" y="24" fill="#f7f1e8" font-family="Arial" font-size="12">${label}</text></svg>`);
  const left = (index % columns) * cellWidth + 10;
  const top = Math.floor(index / columns) * cellHeight + 10;
  composites.push({ input: thumb, left, top });
  composites.push({ input: labelSvg, left, top: top + 285 });
}

await sharp({
  create: {
    width: columns * cellWidth,
    height: Math.max(rows * cellHeight, cellHeight),
    channels: 3,
    background: "#ede7de",
  },
})
  .composite(composites)
  .jpeg({ quality: 88 })
  .toFile(resolve(reviewRoot, "instagram-contact-sheet.jpg"));

console.log(`Importadas ${assets.length} imagens públicas de ${posts.length} publicações oficiais.`);
console.log(`Manifesto: ${resolve(reviewRoot, "instagram-media-manifest.json")}`);
console.log(`Contato: ${resolve(reviewRoot, "instagram-contact-sheet.jpg")}`);
