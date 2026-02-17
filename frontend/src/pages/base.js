export function renderBaseLayout({ mount }) {
	mount.innerHTML = `
    <div class="layout">
      <header class="topbar">
        <div class="brand" role="banner">
          <a class="brand-link" href="#/">J<i class="fa-solid fa-location-dot"></i>urneo</a>
        </div>

        <nav class="nav" aria-label="Hauptnavigation">
          <a href="#/" data-link><i class="fa-solid fa-house"></i></a>
          <a href="#/newjourney" data-link>Reise hinzufügen</a>
        </nav>
      </header>

      <main id="page-content" class="content" role="main"></main>

      <footer class="footer">
        <small>© ${new Date().getFullYear()} Journeo</small>
      </footer>
    </div>
  `;
}
