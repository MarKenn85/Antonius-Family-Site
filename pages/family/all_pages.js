// ===== PAGES ASSEMBLY (manual, unaltered content) =====
// === Combine all Antonius Family Page Files ===

// Check that each expected file has loaded
if (typeof octaviaPage === "undefined") console.error("⚠️ Octavia page missing or not loaded!");
if (typeof aemeliaPage === "undefined") console.error("⚠️ Aemelia page missing or not loaded!");
if (typeof damionPage === "undefined") console.error("⚠️ Damion page missing or not loaded!");
if (typeof filipaPage === "undefined") console.error("⚠️ Filipa page missing or not loaded!");
if (typeof airianaPage === "undefined") console.error("⚠️ Airiana page missing or not loaded!");
if (typeof antoniaPage === "undefined") console.error("⚠️ Antonia page missing or not loaded!");
if (typeof selenePage === "undefined") console.error("⚠️ Selene page missing or not loaded!");
if (typeof gagePage === "undefined") console.error("⚠️ Gage page missing or not loaded!");
if (typeof zarekPage === "undefined") console.error("⚠️ Zarek page missing or not loaded!");
if (typeof xalPage === "undefined") console.error("⚠️ Xal page missing or not loaded!");
if (typeof batreshPage === "undefined") console.error("⚠️ Batresh page missing or not loaded!");

// Build master array
const pages = [
  aemeliaPage,
  airianaPage,
  antoniaPage,
  selenePage,
  damionPage,
  filipaPage,
  zarekPage,
  xalPage,
  batreshPage,
  gagePage
  // Add new members here
];

// Verify pages loaded correctly
console.log(`✅ Antonius Chronicle loaded ${pages.length} family member(s).`);

