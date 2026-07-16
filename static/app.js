let inventory;
let visible = [];

const elements = {
  search: document.querySelector("#search"),
  type: document.querySelector("#type-filter"),
  risk: document.querySelector("#risk-filter"),
  coverage: document.querySelector("#coverage"),
  metrics: document.querySelector("#metrics"),
  rows: document.querySelector("#capability-rows"),
  resultCount: document.querySelector("#result-count"),
  detailsTitle: document.querySelector("#details-title"),
  detailsBody: document.querySelector("#details-body"),
  sources: document.querySelector("#source-rows"),
};

boot().catch(() => {
  elements.coverage.textContent = "Inventory unavailable";
  elements.coverage.className = "coverage failed";
});

async function boot() {
  const response = await fetch("/api/inventory");
  if (!response.ok) throw new Error("inventory request failed");
  inventory = await response.json();
  setupFilters();
  renderSummary();
  renderSources();
  applyFilters();
  elements.search.addEventListener("input", applyFilters);
  elements.type.addEventListener("change", applyFilters);
  elements.risk.addEventListener("change", applyFilters);
}

function setupFilters() {
  for (const type of Object.keys(inventory.summary.byType)) {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.replaceAll("-", " ");
    elements.type.append(option);
  }
}

function renderSummary() {
  const status = inventory.coverage.status;
  const statusText = `${status === "passed" ? "Complete" : "Review required"} coverage`;
  const detailText = `${inventory.coverage.unlabelledManifests} unlabelled manifests retained`;
  const statusLine = document.createElement("span");
  const detailLine = document.createElement("span");
  statusLine.textContent = statusText;
  detailLine.textContent = detailText;
  detailLine.className = "coverage-detail";
  elements.coverage.replaceChildren(statusLine, detailLine);
  elements.coverage.setAttribute("aria-label", `${statusText}; ${detailText}`);
  elements.coverage.className = `coverage ${status}`;
  const metrics = [
    ["Artifacts", inventory.summary.artifacts],
    ["Skills", inventory.summary.byType.skill || 0],
    ["Plugins", inventory.summary.byType.plugin || 0],
    ["Tools", inventory.summary.byType["app-tool"] || 0],
    ["Connectors", inventory.summary.byType.connector || 0],
  ];
  elements.metrics.replaceChildren(...metrics.map(([label, value]) => node("div", "metric", `<span>${escapeHtml(label)}</span><strong>${value}</strong>`)));
}

function applyFilters() {
  const query = elements.search.value.trim().toLowerCase();
  visible = inventory.artifacts.filter((artifact) => {
    if (elements.type.value && artifact.type !== elements.type.value) return false;
    if (elements.risk.value && artifact.risk.level !== elements.risk.value) return false;
    if (!query) return true;
    const text = [artifact.name, artifact.description, artifact.type, artifact.source, ...artifact.capabilities].join(" ").toLowerCase();
    return query.split(/\s+/).every((term) => text.includes(term));
  }).slice(0, 500);
  renderRows();
}

function renderRows() {
  elements.resultCount.textContent = `${visible.length}${visible.length === 500 ? "+" : ""} shown`;
  elements.rows.replaceChildren(...visible.map((artifact) => {
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.dataset.id = artifact.id;
    row.innerHTML = `
      <td><span class="name">${escapeHtml(artifact.name)}</span><span class="artifact-id">${escapeHtml(artifact.id)}</span></td>
      <td>${escapeHtml(artifact.type.replaceAll("-", " "))}</td>
      <td><span class="badge">${escapeHtml(readiness(artifact.lifecycle))}</span></td>
      <td><span class="badge risk-${escapeHtml(artifact.risk.level)}">${escapeHtml(artifact.risk.level)}</span></td>
      <td>${escapeHtml(artifact.source)}</td>`;
    row.addEventListener("click", () => selectArtifact(artifact, row));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectArtifact(artifact, row);
      }
    });
    return row;
  }));
}

function selectArtifact(artifact, row) {
  document.querySelectorAll("tbody tr.selected").forEach((item) => item.classList.remove("selected"));
  row.classList.add("selected");
  elements.detailsTitle.textContent = artifact.name;
  const lifecycleRows = Object.entries(artifact.lifecycle)
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
  elements.detailsBody.innerHTML = `
    <p>${escapeHtml(artifact.description || "No public description supplied.")}</p>
    <ul class="capability-list">${(artifact.capabilities.length ? artifact.capabilities : ["unknown"]).map((item) => `<li class="badge">${escapeHtml(item)}</li>`).join("")}</ul>
    <dl>
      <dt>Type</dt><dd>${escapeHtml(artifact.type)}</dd>
      <dt>Source</dt><dd>${escapeHtml(artifact.source)}</dd>
      <dt>Evidence</dt><dd>${escapeHtml(artifact.classificationEvidence)}</dd>
      <dt>Risk</dt><dd>${escapeHtml(artifact.risk.level)}</dd>
      ${lifecycleRows}
    </dl>
    <p>${escapeHtml(artifact.risk.reasons.join(" · ") || "No elevated risk reason identified from available metadata.")}</p>`;
}

function renderSources() {
  elements.sources.replaceChildren(...inventory.sources.map((source) => node("article", "source", `
    <h3>${escapeHtml(source.id)}</h3>
    <p>status=${escapeHtml(source.status)}<br>records=${source.records}<br>represented=${source.represented}<br>deduplicated=${source.deduplicated}<br>parse_failures=${source.parseFailures}</p>`)));
}

function readiness(lifecycle) {
  for (const state of ["verified", "runnable", "authenticated", "enabled", "installed", "present", "discovered"]) {
    if (lifecycle[state] === "yes") return state;
  }
  return "unknown";
}

function node(tag, className, html) {
  const element = document.createElement(tag);
  element.className = className;
  element.innerHTML = html;
  return element;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
