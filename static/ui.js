const elements = {
  search: document.querySelector("#search"),
  type: document.querySelector("#type-filter"),
  risk: document.querySelector("#risk-filter"),
  reset: document.querySelector("#reset-filters"),
  retry: document.querySelector("#retry-load"),
  notice: document.querySelector("#load-state"),
  noticeMessage: document.querySelector("#load-message"),
  coverage: document.querySelector("#coverage"),
  metrics: document.querySelector("#metrics"),
  rows: document.querySelector("#capability-rows"),
  resultCount: document.querySelector("#result-count"),
  previous: document.querySelector("#previous-page"),
  next: document.querySelector("#next-page"),
  pageStatus: document.querySelector("#page-status"),
  details: document.querySelector(".details"),
  detailsTitle: document.querySelector("#details-title"),
  detailsBody: document.querySelector("#details-body"),
  sources: document.querySelector("#source-rows"),
  findings: document.querySelector("#finding-rows"),
  duplicates: document.querySelector("#duplicate-rows"),
  leftHost: document.querySelector("#left-host"),
  rightHost: document.querySelector("#right-host"),
  compare: document.querySelector("#compare-hosts"),
  hostResults: document.querySelector("#host-diff-results"),
};

export const ui = {
  ...elements,
  configureInventory,
  hideNotice,
  renderDetails,
  renderDetailError,
  renderDetailLoading,
  renderDiagnostics,
  renderHostDiff,
  renderHostDiffError,
  renderHostDiffLoading,
  renderLoadFailure,
  renderPage,
  renderSummary,
  setPaginationDisabled,
  showNotice,
};

function configureInventory(inventory) {
  populateSelect(elements.type, Object.keys(inventory.summary.byType), "All types");
  populateSelect(elements.leftHost, inventory.hosts, "Choose a host");
  populateSelect(elements.rightHost, inventory.hosts, "Choose a host");
  if (inventory.hosts.length > 1) {
    elements.leftHost.value = inventory.hosts[0];
    elements.rightHost.value = inventory.hosts[1];
  }
  renderSummary(inventory);
  renderSources(inventory.sources);
}

function renderSummary(inventory) {
  const passed = inventory.coverage.status === "passed";
  const statusText = passed ? "Source accounting passed" : "Source accounting needs review";
  const detailText = `${inventory.coverage.unlabelledManifests} unlabelled manifests retained`;
  elements.coverage.replaceChildren(textNode("span", statusText), textNode("span", detailText, "coverage-detail"));
  elements.coverage.setAttribute("aria-label", `${statusText}; ${detailText}`);
  elements.coverage.className = `coverage ${inventory.coverage.status}`;
  const metrics = [
    ["Artifacts", inventory.summary.artifacts],
    ["Skills", inventory.summary.byType.skill || 0],
    ["Plugins", inventory.summary.byType.plugin || 0],
    ["Tools", inventory.summary.byType["app-tool"] || 0],
    ["Connectors", inventory.summary.byType.connector || 0],
  ];
  elements.metrics.replaceChildren(...metrics.map(([label, value]) => node("div", "metric", `<span>${escapeHtml(label)}</span><strong>${value}</strong>`)));
}

function renderPage(page, onSelect) {
  const start = page.total ? page.offset + 1 : 0;
  const end = Math.min(page.offset + page.items.length, page.total);
  elements.resultCount.textContent = `${start}–${end} of ${page.total}`;
  elements.pageStatus.textContent = `Page ${Math.floor(page.offset / page.limit) + 1}`;
  elements.previous.disabled = !page.hasPrevious;
  elements.next.disabled = !page.hasNext;
  if (!page.items.length) {
    const cell = node("td", "empty-state", "No capabilities match these filters.");
    cell.colSpan = 5;
    const row = document.createElement("tr");
    row.append(cell);
    elements.rows.replaceChildren(row);
    return;
  }
  elements.rows.replaceChildren(...page.items.map(({ artifact }) => artifactRow(artifact, onSelect)));
}

function artifactRow(artifact, onSelect) {
  const row = document.createElement("tr");
  row.dataset.id = artifact.id;
  row.setAttribute("aria-selected", "false");
  row.innerHTML = `
    <td><button class="row-select" type="button"><span class="name">${escapeHtml(artifact.name)}</span><span class="artifact-id">${escapeHtml(artifact.id)}</span></button></td>
    <td>${escapeHtml(artifact.type.replaceAll("-", " "))}</td>
    <td><span class="badge">${escapeHtml(readiness(artifact.lifecycle))}</span></td>
    <td><span class="badge risk-${escapeHtml(artifact.risk.level)}">${escapeHtml(artifact.risk.level)}</span></td>
    <td>${escapeHtml(artifact.source)}</td>`;
  row.querySelector("button").addEventListener("click", () => {
    elements.rows.querySelectorAll("tr.selected").forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-selected", "false");
    });
    row.classList.add("selected");
    row.setAttribute("aria-selected", "true");
    onSelect(artifact.id);
  });
  return row;
}

function renderDetails(result) {
  const { artifact, incoming, outgoing } = result;
  elements.detailsTitle.textContent = artifact.name;
  const lifecycleRows = Object.entries(artifact.lifecycle).map(([label, value]) => definition(label, value)).join("");
  const metadataRows = Object.entries(artifact.metadata || {}).map(([label, value]) => definition(label, displayValue(value))).join("");
  elements.detailsBody.innerHTML = `
    <p>${escapeHtml(artifact.description || "No public description supplied.")}</p>
    <ul class="capability-list">${(artifact.capabilities.length ? artifact.capabilities : ["unknown"]).map((item) => `<li class="badge">${escapeHtml(item)}</li>`).join("")}</ul>
    <dl>${definition("Type", artifact.type)}${definition("Source", artifact.source)}${definition("Evidence", artifact.classificationEvidence)}${definition("Risk", artifact.risk.level)}${lifecycleRows}${metadataRows}</dl>
    <p>${escapeHtml(artifact.risk.reasons.join(" · ") || "No elevated risk reason was identified from available metadata.")}</p>
    ${relationshipList("Incoming relationships", incoming)}
    ${relationshipList("Outgoing relationships", outgoing)}`;
}

function renderSources(sources) {
  elements.sources.replaceChildren(...sources.map((source) => node("article", "source", `
    <h3>${escapeHtml(source.id)}</h3>
    <p>${escapeHtml(source.status)}<br>${source.represented} of ${source.records} represented<br>${source.deduplicated} deduplicated<br>${source.parseFailures} parse failures</p>`)));
}

function renderDiagnostics(report) {
  elements.findings.innerHTML = report.findings.length
    ? `<ul class="diagnostic-list">${report.findings.slice(0, 30).map((item) => `<li>${escapeHtml(item.level)}: ${escapeHtml(item.code)} (${escapeHtml(item.source)})</li>`).join("")}</ul>`
    : `<p class="diagnostic-empty">No source findings.</p>`;
  elements.duplicates.innerHTML = report.duplicates.length
    ? `<ul class="diagnostic-list">${report.duplicates.slice(0, 30).map((item) => `<li>${escapeHtml(item.name)}: ${item.artifactIds.length} records</li>`).join("")}</ul>`
    : `<p class="diagnostic-empty">No duplicate skill names.</p>`;
}

function renderHostDiff(report) {
  elements.hostResults.innerHTML = report.records.length
    ? `<p>${report.records.length} capability-name differences.</p><ul class="host-result-list">${report.records.slice(0, 100).map((item) => `<li>${escapeHtml(item.type)}: ${escapeHtml(item.name)} — ${escapeHtml(report.left)}=${item.left}, ${escapeHtml(report.right)}=${item.right}</li>`).join("")}</ul>`
    : `<p>No capability-name differences between these hosts.</p>`;
}

function renderLoadFailure() {
  elements.rows.replaceChildren();
  elements.resultCount.textContent = "Unavailable";
  setPaginationDisabled(true);
}

function renderDetailLoading() {
  elements.detailsTitle.textContent = "Loading capability";
  elements.detailsBody.innerHTML = `<p>Loading bounded evidence detail…</p>`;
}

function renderDetailError(message) {
  elements.detailsTitle.textContent = "Detail unavailable";
  elements.detailsBody.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function renderHostDiffLoading() {
  elements.hostResults.textContent = "Comparing capability names…";
}

function renderHostDiffError(message) {
  elements.hostResults.textContent = message;
}

function showNotice(message, options = {}) {
  elements.notice.hidden = false;
  elements.notice.className = `notice${options.error ? " error" : ""}`;
  elements.noticeMessage.textContent = message;
  elements.retry.hidden = !options.retry;
}

function hideNotice() {
  elements.notice.hidden = true;
}

function setPaginationDisabled(disabled) {
  elements.previous.disabled = disabled;
  elements.next.disabled = disabled;
}

function populateSelect(select, values, placeholder) {
  select.replaceChildren(new Option(placeholder, ""), ...values.map((value) => new Option(value.replaceAll("-", " "), value)));
}

function readiness(lifecycle) {
  for (const state of ["verified", "runnable", "authenticated", "enabled", "installed", "present", "discovered"]) {
    if (lifecycle[state] === "yes") return state;
  }
  return "unknown";
}

function relationshipList(title, records) {
  if (!records.length) return `<p>${escapeHtml(title)}: none recorded.</p>`;
  return `<h3>${escapeHtml(title)}</h3><ul class="relationship-list">${records.map((item) => `<li>${escapeHtml(item.type)}: ${escapeHtml(item.from)} → ${escapeHtml(item.to)}</li>`).join("")}</ul>`;
}

function definition(label, value) {
  return `<dt>${escapeHtml(label.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " "))}</dt><dd>${escapeHtml(value)}</dd>`;
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "not supplied";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function textNode(tag, text, className = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
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
