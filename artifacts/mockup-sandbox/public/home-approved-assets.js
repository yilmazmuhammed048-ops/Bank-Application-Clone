(() => {
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith("banka-yonetim-paneli") || window.location.pathname === "/admin" || window.location.pathname === "/admin/") return;

  async function readPart(name) {
    const response = await fetch(`/home-data/${name}?v=20260827`, { cache: "force-cache" });
    if (!response.ok) throw new Error(`asset part ${name}: ${response.status}`);
    return (await response.text()).trim();
  }

  async function lockApprovedHeader() {
    try {
      const parts = await Promise.all([
        readPart("header-1.txt"),
        readPart("header-2.txt"),
        readPart("header-3.txt"),
        readPart("header-4.txt"),
      ]);

      const header = parts.join("");
      const previous = document.getElementById("approved-home-header-byte-lock");
      if (previous) previous.remove();

      const style = document.createElement("style");
      style.id = "approved-home-header-byte-lock";
      style.textContent = `
        html body #root > main > div:has(> div.pb-24) > header {
          background-color: #e30620 !important;
          background-image: url("data:image/jpeg;base64,${header}") !important;
          background-repeat: no-repeat !important;
          background-position: center top !important;
          background-size: 100% 100% !important;
          background-blend-mode: normal !important;
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.error("Approved home header could not be loaded", error);
    }
  }

  if (document.readyState === "complete") {
    lockApprovedHeader();
  } else {
    window.addEventListener("load", lockApprovedHeader, { once: true });
  }
})();
