import { ui } from "./ui.js";

const state = {
  offset: 0,
  limit: 50,
  initialised: false,
  controller: null,
  searchTimer: null,
};

bindEvents();
refresh({ includeDiagnostics: true });

function bindEvents() {
  ui.search.addEventListener("input", () => {
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(() => resetAndRefresh(), 180);
  });
  ui.type.addEventListener("change", resetAndRefresh);
  ui.risk.addEventListener("change", resetAndRefresh);
  ui.reset.addEventListener("click", () => {
    ui.search.value = "";
    ui.type.value = "";
    ui.risk.value = "";
    resetAndRefresh();
  });
  ui.retry.addEventListener("click", () => refresh({ includeDiagnostics: !state.initialised }));
  ui.previous.addEventListener("click", () => {
    state.offset = Math.max(0, state.offset - state.limit);
    refresh();
  });
  ui.next.addEventListener("click", () => {
    state.offset += state.limit;
    refresh();
  });
  ui.compare.addEventListener("click", compareHosts);
}

function resetAndRefresh() {
  state.offset = 0;
  refresh();
}

async function refresh(options = {}) {
  state.controller?.abort();
  state.controller = new AbortController();
  ui.showNotice("Loading capability evidence…");
  ui.setPaginationDisabled(true);

  try {
    const request = fetch(`/api/inventory?${inventoryParameters()}`, { signal: state.controller.signal });
    const diagnosticsRequest = options.includeDiagnostics ? fetch("/api/diagnostics") : null;
    const response = await request;
    if (!response.ok) throw new Error("The inventory request was rejected.");
    const inventory = await response.json();

    if (!state.initialised) {
      ui.configureInventory(inventory);
      state.initialised = true;
    } else {
      ui.renderSummary(inventory);
    }
    ui.renderPage(inventory.page, selectArtifact);
    ui.hideNotice();

    if (diagnosticsRequest) {
      const diagnosticsResponse = await diagnosticsRequest;
      if (!diagnosticsResponse.ok) throw new Error("The diagnostics request was rejected.");
      ui.renderDiagnostics(await diagnosticsResponse.json());
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    ui.showNotice(error.message || "Capability evidence could not be loaded.", { error: true, retry: true });
    ui.renderLoadFailure();
  }
}

async function selectArtifact(id) {
  ui.renderDetailLoading();
  try {
    const response = await fetch(`/api/artifact?id=${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("Capability detail is unavailable.");
    ui.renderDetails(await response.json());
    if (window.matchMedia("(max-width: 980px)").matches) {
      ui.details.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    ui.renderDetailError(error.message);
  }
}

async function compareHosts() {
  const left = ui.leftHost.value;
  const right = ui.rightHost.value;
  if (!left || !right || left === right) return ui.renderHostDiffError("Choose two different hosts.");
  ui.renderHostDiffLoading();
  try {
    const response = await fetch(`/api/diff?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`);
    if (!response.ok) throw new Error("Host comparison is unavailable.");
    ui.renderHostDiff(await response.json());
  } catch (error) {
    ui.renderHostDiffError(error.message);
  }
}

function inventoryParameters() {
  return new URLSearchParams({
    q: ui.search.value.trim(),
    type: ui.type.value,
    risk: ui.risk.value,
    offset: String(state.offset),
    limit: String(state.limit),
  });
}
