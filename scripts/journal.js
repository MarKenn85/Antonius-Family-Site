// === Persistent state ===
let currentCharacter = null;
let currentData = null;
let currentPageIndex = 0;
let currentScriptEl = null;

// === Folder resolver ===
function getCharacterFolder(id) {
  // Add any new Servus entries here
  const servusList = ["kenny", "miklos", "zane", "tor", "dane", "quintus", "wilhelm", "talon", "inanna"];
  return servusList.includes(id) ? "servus" : "family";
}

// === Global loader so sidebar links always work ===
window.loadCharacter = async function (id) {
  const container = document.querySelector(".journal-container");
  if (container) container.classList.add("loading");

  try {
    const nameEl = document.getElementById("entry-name");
    const titleEl = document.getElementById("entry-title");
    const textEl = document.getElementById("entry-text");
    const portraitEl = document.getElementById("portrait");

    if (!nameEl || !titleEl || !textEl || !portraitEl) return;

    // Clear old
    nameEl.textContent = "Loading...";
    titleEl.textContent = "";
    textEl.innerHTML = "";
    portraitEl.src = "images/background/emblem.png";

    if (currentScriptEl) {
      document.body.removeChild(currentScriptEl);
      currentScriptEl = null;
    }
    if (currentCharacter) delete window[`${currentCharacter}Page`];

    // Determine which folder to load from
    const folder = getCharacterFolder(id);
    const response = await fetch(`pages/${folder}/${id}.js`);
    if (!response.ok) throw new Error(`Could not load ${id}.js`);
    const js = await response.text();

    const scriptEl = document.createElement("script");
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);
    currentScriptEl = scriptEl;

    const varName = `${id}Page`;
    if (window[varName]) {
      currentCharacter = id;
      currentData = window[varName];
      currentPageIndex = 0;
      displayPage();
      await buildLineageTrail(id);
    } else {
      throw new Error(`No data object found for ${id}`);
    }
  } catch (err) {
    console.error("Error loading character:", err);
    document.getElementById("entry-name").textContent = "Error loading entry.";
  } finally {
    if (container) setTimeout(() => container.classList.remove("loading"), 250);
  }
};

// === Display current page ===
function displayPage() {
  if (!currentData) return;
  document.getElementById("entry-name").textContent = currentData.name;
  document.getElementById("entry-title").textContent = currentData.title;
  document.getElementById("portrait").src = currentData.portrait;
  document.getElementById("entry-text").innerHTML = currentData.text[currentPageIndex];
}

// === Navigation Arrows ===
document.getElementById("prev-entry").addEventListener("click", async () => {
  if (!currentData) return;
  const container = document.querySelector(".journal-container");
  container.classList.add("loading");

  if (currentPageIndex > 0) {
    currentPageIndex--;
    displayPage();
  } else if (currentData.previous) {
    await loadCharacter(currentData.previous);
    if (currentData?.text) {
      currentPageIndex = currentData.text.length - 1;
      displayPage();
    }
  }

  setTimeout(() => container.classList.remove("loading"), 250);
});

document.getElementById("next-entry").addEventListener("click", async () => {
  if (!currentData) return;
  const container = document.querySelector(".journal-container");
  container.classList.add("loading");

  if (currentPageIndex < currentData.text.length - 1) {
    currentPageIndex++;
    displayPage();
  } else if (currentData.next) {
    await loadCharacter(currentData.next);
    currentPageIndex = 0;
    displayPage();
  }

  setTimeout(() => container.classList.remove("loading"), 250);
});

// === Lineage trail builder (non-clickable) ===
async function buildLineageTrail(id) {
  const trailContainer = document.getElementById("lineage-trail");
  if (!trailContainer) return;

  const lineage = [];
  let current = window[`${id}Page`];

  // Walk up through parents — load missing ones if needed
  while (current) {
    lineage.unshift(current);
    const parentId = current.parent;

    if (parentId && !window[`${parentId}Page`]) {
      try {
        const folder = getCharacterFolder(parentId);
        const res = await fetch(`pages/${folder}/${parentId}.js`);
        if (res.ok) {
          const js = await res.text();
          const fn = new Function(js + "\nreturn this;");
          fn.call(window);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    current = parentId ? window[`${parentId}Page`] : null;
  }

  // Build plain breadcrumb trail (non-clickable)
  trailContainer.innerHTML = "";
  lineage.forEach((member, index) => {
    const span = document.createElement("span");
    span.textContent = member.name;

    if (index < lineage.length - 1) {
      span.classList.add("ancestor");
      trailContainer.appendChild(span);

      const sep = document.createElement("span");
      sep.textContent = " / ";
      trailContainer.appendChild(sep);
    } else {
      span.classList.add("current");
      trailContainer.appendChild(span);
    }
  });
}

// === Default entry ===
document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href);
  const startChar = url.searchParams.get("char") || "octavia";
  loadCharacter(startChar);
});
