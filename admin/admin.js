const PASSWORD_HASH = "a10c983928a36f3a5e75b05b8ae476546b023ff4d06db6bccbddb7a48e7b6d87";
const SESSION_KEY = "gogoland-admin-authenticated";

let rootHandle = null;
let siteData = null;

const loginCard = document.getElementById("login-card");
const dashboard = document.getElementById("dashboard");
const uploadForm = document.getElementById("upload-form");
const categoryInput = document.getElementById("category-input");
const simList = document.getElementById("sim-list");
const supportNotice = document.getElementById("support-notice");

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `simulation-${Date.now()}`;
}

function toDataScript(data) {
  return `window.GOGOLAND_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

function toEmbeddedData(data) {
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

function showDashboard() {
  loginCard.hidden = true;
  dashboard.hidden = false;
  supportNotice.hidden = Boolean(window.showDirectoryPicker);
  uploadForm.querySelector("button[type='submit']").disabled = !rootHandle;
  lucide.createIcons();
}

function renderData() {
  categoryInput.innerHTML = siteData.categories.map((category) => `
    <option value="${category.id}">${category.name}</option>
  `).join("");

  simList.innerHTML = siteData.simulations.map((sim) => {
    const category = siteData.categories.find((item) => item.id === sim.category);
    return `
      <article class="sim-row">
        <strong>${sim.title}</strong>
        <span>${category?.name || sim.category} / ${sim.url}</span>
      </article>
    `;
  }).join("");
}

async function readSiteData() {
  const dataDir = await rootHandle.getDirectoryHandle("data");
  const fileHandle = await dataDir.getFileHandle("simulations.json");
  const file = await fileHandle.getFile();
  siteData = JSON.parse(await file.text());
  renderData();
}

async function writeSiteData() {
  const dataDir = await rootHandle.getDirectoryHandle("data");
  const jsonHandle = await dataDir.getFileHandle("simulations.json");
  const jsonWritable = await jsonHandle.createWritable();
  await jsonWritable.write(`${JSON.stringify(siteData, null, 2)}\n`);
  await jsonWritable.close();

  const jsHandle = await dataDir.getFileHandle("simulations.js", { create: true });
  const jsWritable = await jsHandle.createWritable();
  await jsWritable.write(toDataScript(siteData));
  await jsWritable.close();

  const indexHandle = await rootHandle.getFileHandle("index.html");
  const indexFile = await indexHandle.getFile();
  const nextIndex = (await indexFile.text()).replace(
    /<script id="gogoland-data" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="gogoland-data" type="application/json">${toEmbeddedData(siteData)}</script>`
  );
  const indexWritable = await indexHandle.createWritable();
  await indexWritable.write(nextIndex);
  await indexWritable.close();
}

async function writeSimulationFile(file, filename) {
  const simulationsDir = await rootHandle.getDirectoryHandle("simulations", { create: true });
  const fileHandle = await simulationsDir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(await file.text());
  await writable.close();
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("password-input").value;
  if (await sha256(password) !== PASSWORD_HASH) {
    alert("密碼不正確");
    return;
  }
  sessionStorage.setItem(SESSION_KEY, "true");
  showDashboard();
});

document.getElementById("pick-root-button").addEventListener("click", async () => {
  if (!window.showDirectoryPicker) return;
  rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  await readSiteData();
  uploadForm.querySelector("button[type='submit']").disabled = false;
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!rootHandle || !siteData) {
    alert("請先選擇網站資料夾");
    return;
  }

  const file = document.getElementById("file-input").files[0];
  const title = document.getElementById("title-input").value.trim();
  const id = slugify(title || file.name);
  const filename = `${id}.html`;
  const tags = document.getElementById("tags-input").value.split(",").map((tag) => tag.trim()).filter(Boolean);

  await writeSimulationFile(file, filename);
  siteData.simulations.push({
    id,
    category: categoryInput.value,
    title,
    description: document.getElementById("description-input").value.trim(),
    icon: "monitor-play",
    url: `simulations/${filename}`,
    tags,
  });
  siteData.simulations.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title, "zh-Hant"));
  await writeSiteData();
  renderData();
  uploadForm.reset();
  alert("已上架到本地 repo。確認無誤後用 Git commit/push 發佈。");
});

if (sessionStorage.getItem(SESSION_KEY) === "true") {
  showDashboard();
}
