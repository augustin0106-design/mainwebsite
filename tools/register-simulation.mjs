import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data", "simulations.json");
const dataScriptPath = path.join(root, "data", "simulations.js");

function argValue(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `simulation-${Date.now()}`;
}

function extractTitle(html, fallback) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return match ? match[1].replace(/\s+/g, " ").trim() : fallback;
}

function toDataScript(data) {
  return `window.GOGOLAND_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

function toEmbeddedData(data) {
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

async function updateEmbeddedData(data) {
  const indexPath = path.join(root, "index.html");
  const indexHtml = await fs.readFile(indexPath, "utf8");
  const nextHtml = indexHtml.replace(
    /<script id="gogoland-data" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="gogoland-data" type="application/json">${toEmbeddedData(data)}</script>`
  );
  await fs.writeFile(indexPath, nextHtml);
}

async function main() {
  const fileArg = argValue("file");
  if (!fileArg) {
    throw new Error("請提供 --file path/to/new.html");
  }

  const category = argValue("category", "other");
  const description = argValue("description", "新上架的互動教學模擬。");
  const tags = argValue("tags").split(",").map((tag) => tag.trim()).filter(Boolean);
  const sourcePath = path.resolve(root, fileArg);
  const html = await fs.readFile(sourcePath, "utf8");
  const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
  const title = argValue("title", extractTitle(html, path.basename(sourcePath, path.extname(sourcePath))));
  const id = slugify(argValue("id", title));
  const targetName = `${id}.html`;
  const targetPath = path.join(root, "simulations", targetName);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  const nextEntry = {
    id,
    category,
    title,
    description,
    icon: argValue("icon", "monitor-play"),
    url: `simulations/${targetName}`,
    tags,
  };

  data.simulations = data.simulations.filter((sim) => sim.id !== id);
  data.simulations.push(nextEntry);
  data.simulations.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title, "zh-Hant"));

  await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  await fs.writeFile(dataScriptPath, toDataScript(data));
  await updateEmbeddedData(data);
  console.log(`Registered ${title} -> simulations/${targetName}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
