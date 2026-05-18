const DATA_URL = "data/simulations.json";
const STORAGE_KEY = "gogoland-current-simulation";

const state = {
  categories: [],
  simulations: [],
  activeId: null,
  activeStartedAt: null,
  query: "",
};

const shell = document.querySelector(".app-shell");
const categoryList = document.getElementById("category-list");
const searchInput = document.getElementById("search-input");
const welcomePanel = document.getElementById("welcome-panel");
const playerPanel = document.getElementById("player-panel");
const iframe = document.getElementById("simulation-frame");
const frameLoading = document.getElementById("frame-loading");
const currentCategory = document.getElementById("current-category");
const currentTitle = document.getElementById("current-title");
const openNewButton = document.getElementById("open-new-button");

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function categoryById(id) {
  return state.categories.find((category) => category.id === id);
}

function trackEvent(name, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

function activeSimulation() {
  return state.simulations.find((item) => item.id === state.activeId);
}

function flushEngagement() {
  const sim = activeSimulation();
  if (!sim || !state.activeStartedAt) return;
  const seconds = Math.max(1, Math.round((Date.now() - state.activeStartedAt) / 1000));
  const category = categoryById(sim.category);
  trackEvent("simulation_engagement", {
    simulation_id: sim.id,
    simulation_title: sim.title,
    simulation_category: category?.name || sim.category,
    value: seconds,
    engagement_seconds: seconds,
  });
  state.activeStartedAt = Date.now();
}

async function loadSiteData() {
  const embeddedData = document.getElementById("gogoland-data")?.textContent?.trim();
  if (embeddedData && embeddedData !== "{}") {
    return JSON.parse(embeddedData);
  }

  if (window.GOGOLAND_DATA) {
    return window.GOGOLAND_DATA;
  }

  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function renderStats() {
  const stats = document.getElementById("quick-stats");
  stats.innerHTML = [
    ["folder-kanban", `${state.categories.length} 個分類`],
    ["monitor-play", `${state.simulations.length} 個模擬`],
    ["graduation-cap", "公開學習入口"],
  ].map(([icon, text]) => `
    <span class="stat-pill"><i data-lucide="${icon}"></i>${text}</span>
  `).join("");
}

function simMatches(sim) {
  if (!state.query) return true;
  const haystack = normalize([
    sim.title,
    sim.description,
    sim.category,
    ...(sim.tags || []),
  ].join(" "));
  return haystack.includes(state.query);
}

function renderSidebar() {
  categoryList.innerHTML = state.categories.map((category) => {
    const sims = state.simulations.filter((sim) => sim.category === category.id && simMatches(sim));
    if (!sims.length) return "";

    return `
      <section class="category-block">
        <div class="category-title">
          <i data-lucide="${category.icon}"></i>
          ${category.name}
        </div>
        ${sims.map((sim) => `
          <button class="sim-button ${state.activeId === sim.id ? "is-active" : ""}" type="button" data-sim-id="${sim.id}">
            <span class="sim-icon" style="background:${category.color}">
              <i data-lucide="${sim.icon || category.icon}"></i>
            </span>
            <span>
              <strong>${sim.title}</strong>
              <span>${sim.description}</span>
            </span>
          </button>
        `).join("")}
      </section>
    `;
  }).join("");

  categoryList.querySelectorAll("[data-sim-id]").forEach((button) => {
    button.addEventListener("click", () => openSimulation(button.dataset.simId));
  });
  lucide.createIcons();
}

function renderFeatured() {
  const featured = document.getElementById("featured-list");
  featured.innerHTML = state.simulations.slice(0, 5).map((sim) => {
    const category = categoryById(sim.category);
    return `
      <button class="feature-card" type="button" data-sim-id="${sim.id}">
        <span class="sim-icon" style="background:${category?.color || "#2563eb"}">
          <i data-lucide="${sim.icon || category?.icon || "play"}"></i>
        </span>
        <span>
          <strong>${sim.title}</strong>
          <span>${sim.description}</span>
        </span>
      </button>
    `;
  }).join("");

  featured.querySelectorAll("[data-sim-id]").forEach((button) => {
    button.addEventListener("click", () => openSimulation(button.dataset.simId));
  });
}

function openSimulation(id) {
  const sim = state.simulations.find((item) => item.id === id);
  if (!sim) return;

  flushEngagement();
  const category = categoryById(sim.category);
  state.activeId = sim.id;
  state.activeStartedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, sim.id);
  currentCategory.textContent = category?.name || "";
  currentTitle.textContent = sim.title;
  openNewButton.href = sim.url;
  welcomePanel.hidden = true;
  playerPanel.hidden = false;
  frameLoading.classList.add("is-visible");
  iframe.src = sim.url;
  renderSidebar();
  trackEvent("simulation_open", {
    simulation_id: sim.id,
    simulation_title: sim.title,
    simulation_category: category?.name || sim.category,
  });

  if (window.matchMedia("(max-width: 860px)").matches) {
    shell.dataset.sidebarOpen = "false";
  }
}

async function init() {
  const data = await loadSiteData();
  state.categories = data.categories;
  state.simulations = data.simulations;

  if (window.matchMedia("(max-width: 860px)").matches) {
    shell.dataset.sidebarOpen = "false";
  }

  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    shell.dataset.sidebarOpen = shell.dataset.sidebarOpen === "true" ? "false" : "true";
  });

  document.getElementById("home-button").addEventListener("click", () => {
    flushEngagement();
    state.activeId = null;
    state.activeStartedAt = null;
    iframe.src = "about:blank";
    playerPanel.hidden = true;
    welcomePanel.hidden = false;
    renderSidebar();
    trackEvent("portal_home");
  });

  document.getElementById("reload-button").addEventListener("click", () => {
    if (state.activeId) iframe.src = iframe.src;
  });

  iframe.addEventListener("load", () => {
    frameLoading.classList.remove("is-visible");
  });

  searchInput.addEventListener("input", () => {
    state.query = normalize(searchInput.value);
    renderSidebar();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEngagement();
  });
  window.addEventListener("pagehide", flushEngagement);

  renderStats();
  renderFeatured();
  renderSidebar();
  lucide.createIcons();
}

init().catch((error) => {
  categoryList.innerHTML = `<p style="padding:16px;color:#ef476f;">模擬清單載入失敗：${error.message}</p>`;
});
