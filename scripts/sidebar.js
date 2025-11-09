// scripts/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("sidebar-content");
  if (!sidebar || !content) return;

  // === Categories ===
  const categories = {
    "Children": ["aemelia", "airiana", "antonia", "selene"],
    "Grandchildren": ["damion", "filipa", "alessandro", "jaiden", "zarek", "xal", "batresh", "gage"],
    "Great Grandchildren": ["nero", "sid", "claudius", "blay", "eben", "kierdyn", "josiah", "taurus", "rose"],
    "Servus / Custo": ["kenny", "miklos", "zane", "tor", "dane", "quintus", "wilhelm", "talon", "inanna"]
  };

  // === Folder resolver ===
  function getCharacterFolder(id) {
    const servusList = ["kenny", "miklos", "zane", "tor", "dane", "quintus", "wilhelm", "talon", "inanna"];
    return servusList.includes(id) ? "servus" : "family";
  }

  // === Load family data dynamically ===
  async function loadFamilyData() {
    const family = {};
    const allMembers = Object.values(categories).flat();

    for (const id of allMembers) {
      try {
        const folder = getCharacterFolder(id);
        const res = await fetch(`pages/${folder}/${id}.js`);
        if (!res.ok) throw new Error(`Missing file for ${id}`);
        const js = await res.text();
        const fn = new Function(js + "\nreturn this;");
        fn.call(window);

        const varName = `${id}Page`;
        if (window[varName]) family[id] = window[varName];
      } catch (err) {
        console.warn(`Could not load ${id}:`, err);
      }
    }
    return family;
  }

  // === Handle link clicks ===
  function linkHandler(id) {
    return (e) => {
      e.preventDefault();
      if (typeof window.loadCharacter === "function") {
        // If journal.js is active
        window.loadCharacter(id);
      } else {
        // Go to journal page directly
        window.location.href = `journal.html?char=${encodeURIComponent(id)}`;
      }
    };
  }

  // === Build sidebar structure ===
  async function buildSidebar() {
    const family = await loadFamilyData();
    const wrapper = document.createElement("div");

    // Static title
    const marcusTitle = document.createElement("div");
    marcusTitle.classList.add("sidebar-title");
    marcusTitle.textContent = "The House of Marcus Antonius";
    wrapper.appendChild(marcusTitle);

    // Each category section
    for (const [section, ids] of Object.entries(categories)) {
      const sectionDiv = document.createElement("div");
      sectionDiv.classList.add("sidebar-section");

      // Header
      const header = document.createElement("button");
      header.classList.add("section-header");
      header.textContent = section;
      sectionDiv.appendChild(header);

      // Member list
      const list = document.createElement("ul");
      list.classList.add("nav-list");
      list.style.maxHeight = "0";
      list.style.overflow = "hidden";

      for (const id of ids) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.textContent = family[id]?.name || id;
        a.href = "#";
        a.addEventListener("click", linkHandler(id));
        li.appendChild(a);
        list.appendChild(li);
      }

      header.addEventListener("click", () => {
        const isOpen = list.classList.toggle("open");
        list.style.maxHeight = isOpen ? list.scrollHeight + "px" : "0";
      });

      sectionDiv.appendChild(list);
      wrapper.appendChild(sectionDiv);
    }

    // Replace sidebar content
    content.innerHTML = "";
    content.appendChild(wrapper);
  }

  buildSidebar();
});

// === Sidebar toggle ===
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("visible");
};

// === Auto-hide on mouse leave ===
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.addEventListener("mouseleave", () => {
    sidebar.classList.remove("visible");
  });
});
