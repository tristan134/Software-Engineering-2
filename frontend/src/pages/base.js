export function renderBaseLayout({ mount }) {
	mount.innerHTML = `
    <div class="layout">
      <header class="topbar">
        <div class="brand" role="banner">
            J<i class="fa-solid fa-location-dot"></i>urneo
        </div>

        <nav class="nav" aria-label="Hauptnavigation">
          <div class="nav-group">
            <a href="#/" data-link>Übersicht</a>
            <a href="#/newjourney" data-link>Reise hinzufügen</a>
          </div>
        </nav>
      </header>

      <main id="page-content" class="content" role="main"></main>

      <footer class="footer">
        <small>© ${new Date().getFullYear()} Journeo</small>
      </footer>
    </div>
  `;
}
