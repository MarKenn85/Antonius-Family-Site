// ===== PAGES ASSEMBLY (manual, unaltered content) =====
// === Combine all Antonius Family Page Files ===

// Check that each expected file has loaded
if (typeof octaviaPage === "undefined") console.error("⚠️ Octavia page missing or not loaded!");
if (typeof aemiliaPage === "undefined") console.error("⚠️ Aemilia page missing or not loaded!");
if (typeof damionPage === "undefined") console.error("⚠️ Damion page missing or not loaded!");
if (typeof filipaPage === "undefined") console.error("⚠️ Filipa page missing or not loaded!");
if (typeof airianaPage === "undefined") console.error("⚠️ Airiana page missing or not loaded!");
if (typeof antoniaPage === "undefined") console.error("⚠️ Antonia page missing or not loaded!");
if (typeof selenePage === "undefined") console.error("⚠️ Selene page missing or not loaded!");
if (typeof gagePage === "undefined") console.error("⚠️ Gage page missing or not loaded!");
if (typeof zarekPage === "undefined") console.error("⚠️ Zarek page missing or not loaded!");
if (typeof xalPage === "undefined") console.error("⚠️ Xal page missing or not loaded!");
if (typeof batreshPage === "undefined") console.error("⚠️ Batresh page missing or not loaded!");
if (typeof alessandroPage === "undefined") console.error("⚠️ Alessandro page missing or not loaded!");
if (typeof blayPage === "undefined") console.error("⚠️ Blay page missing or not loaded!");
if (typeof claudiusPage === "undefined") console.error("⚠️ Claudius page missing or not loaded!");
if (typeof frederickPage === "undefined") console.error("⚠️ Frederick page missing or not loaded!");
if (typeof jaidenPage === "undefined") console.error("⚠️ Jaiden page missing or not loaded!");
if (typeof josiahPage === "undefined") console.error("⚠️ Josiah page missing or not loaded!");
if (typeof kierdynPage === "undefined") console.error("⚠️ Kierdyn page missing or not loaded!");
if (typeof neroPage === "undefined") console.error("⚠️ Nero page missing or not loaded!");
if (typeof rosePage === "undefined") console.error("⚠️ Rose page missing or not loaded!");
if (typeof sidPage === "undefined") console.error("⚠️ Sid page missing or not loaded!");
if (typeof taurusPage === "undefined") console.error("⚠️ Taurus page missing or not loaded!");
if (typeof zanePage === "undefined") console.error("⚠️ Zane page missing or not loaded!");

// Build master array
const pages = [
  aemiliaPage,
  airianaPage,
  antoniaPage,
  selenePage,
  damionPage,
  filipaPage,
  zarekPage,
  xalPage,
  batreshPage,
  gagePage,
  alessandroPage,
  blayPage,
  claudiusPage,
  frederickPage,
  jaidenPage,
  josiahPage,
  kierdynPage,
  neroPage,
  rosePage,
  sidPage,
  taurusPage,
  zanePage
  // Add new members here
];

// Verify pages loaded correctly
console.log(`✅ Antonius Chronicle loaded ${pages.length} family member(s).`);

