// scripts/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("sidebar-content");
  if (!sidebar || !content) return;

    // === Shared family registry data ===
  const categories = FAMILY_REGISTRY.categories;
  const starredMembers = FAMILY_REGISTRY.starredMembers;
  const spouses = FAMILY_REGISTRY.spouses;

  // === Load family data dynamically ===
  async function loadFamilyData() {
    const family = {};
    const allMembers = [
      "marcus",
      ...Object.values(categories).flat()
    ];

      for (const id of allMembers) {
        try {
          if (FAMILY_REGISTRY.members?.[id]) {
            family[id] = FAMILY_REGISTRY.members[id];
            continue;
          }

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

      // Clear old highlight
      document.querySelectorAll("#sidebar-content a.current").forEach(a =>
        a.classList.remove("current")
      );

      // Highlight this one
      const clickedLink = document.querySelector(`#sidebar-content a[data-id='${id}']`);
      if (clickedLink) {
        clickedLink.classList.add("current");

        // Keep parent dropdown open
        const parentList = clickedLink.closest(".nav-list");
        if (parentList && !parentList.classList.contains("open")) {
          parentList.classList.add("open");
          parentList.style.maxHeight = (parentList.scrollHeight + 28) + "px";
          parentList.previousElementSibling.classList.add("open"); // keep header visually open
        }
      }

      if (typeof window.loadCharacter === "function") {
        window.loadCharacter(id);
      } else {
        window.location.href = `journal.html?char=${encodeURIComponent(id)}`;
      }
    };
  }

// === Build sidebar ===
async function buildSidebar() {
  const family = await loadFamilyData();
  const wrapper = document.createElement("div");

  const marcusTitle = document.createElement("div");
  marcusTitle.classList.add("sidebar-title");
  marcusTitle.textContent = "The House of Marcus Antonius";
  wrapper.appendChild(marcusTitle);

  // === Marcus Antonius standalone entry ===
  const marcusSection = document.createElement("div");
  marcusSection.classList.add("sidebar-section");

  const marcusHeader = document.createElement("button");
  marcusHeader.classList.add("section-header");
  marcusHeader.classList.add("no-arrow");
  marcusHeader.textContent = family["marcus"]?.name || "Marcus Antonius";
  marcusHeader.dataset.id = "marcus";

  marcusHeader.addEventListener("click", (event) => {
  linkHandler("marcus")(event);

  document
    .querySelectorAll("#sidebar-content .current")
    .forEach(el => el.classList.remove("current"));

  marcusHeader.classList.add("current");
  });

  marcusSection.appendChild(marcusHeader);
  wrapper.appendChild(marcusSection);

  for (const [section, ids] of Object.entries(categories)) {
    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("sidebar-section");

    const header = document.createElement("button");
    header.classList.add("section-header");
    header.textContent = section;
    sectionDiv.appendChild(header);

    const list = document.createElement("ul");
    list.classList.add("nav-list");
    list.style.maxHeight = "0";
    list.style.overflow = "hidden";

    for (const id of ids) {
      const li = document.createElement("li");
      if (spouses.includes(id)) {
        li.classList.add("spouse-link");
      }

      const a = document.createElement("a");
      a.textContent = family[id]?.name || id;
      a.href = "#";
      a.dataset.id = id;

      if (starredMembers.includes(id)) a.classList.add("starred");

      a.addEventListener("click", linkHandler(id));
      li.appendChild(a);
      list.appendChild(li);
    }

    header.addEventListener("click", () => {
      const isOpen = list.classList.toggle("open");
      header.classList.toggle("open", isOpen);
      list.style.maxHeight = isOpen ? (list.scrollHeight + 28) + "px" : "0";
    });

    sectionDiv.appendChild(list);
    wrapper.appendChild(sectionDiv);
  }

  content.innerHTML = "";
  content.appendChild(wrapper);

  // === Auto-expand current section ===
  const url = new URL(window.location.href);
  const isJournalPage = document.body.id === "journal";
  const activeChar = url.searchParams.get("char") || (isJournalPage ? "octavia" : null);

    if (activeChar) {

      if (activeChar === "marcus") {
        const marcusHeader = document.querySelector(
          '#sidebar-content .section-header[data-id="marcus"]'
        );

        if (marcusHeader) {
          marcusHeader.classList.add("current");
        }

      } else {

        const activeLink = document.querySelector(
          `#sidebar-content a[data-id='${activeChar}']`
        );

        if (activeLink) {
          activeLink.classList.add("current");

          const list = activeLink.closest(".nav-list");
          if (list) {
            list.classList.add("open");
            list.style.maxHeight = (list.scrollHeight + 28) + "px";
            list.previousElementSibling.classList.add("open");
          }
        }

      }
    }
}

    // === Run it ===
  buildSidebar();
});