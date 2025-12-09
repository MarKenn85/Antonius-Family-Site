// scripts/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("sidebar-content");
  if (!sidebar || !content) return;

  // === Categories ===
  const categories = {
    "Children": ["aemelia", "airiana", "antonia", "selene"],
    "Grandchildren": ["damion", "filipa", "alessandro", "jaiden", "zarek", "xal", "batresh", "gage"],
    "Great Grandchildren": ["nero", "sid", "claudius", "blay", "eben", "kierdyn", "josiah", "taurus", "rose", "frederick"],
    "Servus / Custo": ["kenny", "miklos", "zane", "tor", "dane", "quintus", "wilhelm", "talon", "inanna"]
  };

  // === Starred members ===
  const starredMembers = ["damion"];

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
          parentList.style.maxHeight = parentList.scrollHeight + "px";
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
        list.style.maxHeight = isOpen ? list.scrollHeight + "px" : "0";
      });

      sectionDiv.appendChild(list);
      wrapper.appendChild(sectionDiv);
    }

    content.innerHTML = "";
    content.appendChild(wrapper);

    // === Auto-expand current section if URL has ?char= ===
    const url = new URL(window.location.href);
    const activeChar = url.searchParams.get("char");
    if (activeChar) {
      const activeLink = document.querySelector(`#sidebar-content a[data-id='${activeChar}']`);
      if (activeLink) {
        activeLink.classList.add("current");
        const list = activeLink.closest(".nav-list");
        if (list) {
          list.classList.add("open");
          list.style.maxHeight = list.scrollHeight + "px";
          list.previousElementSibling.classList.add("open");
        }
      }
    }
  }

    // === Run it ===
  buildSidebar();
});