import "./css/root.css";
import "./css/utilities.css";
import { renderBaseLayout } from "./pages/base.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderNewJourney } from "./pages/newjourney.js";

const routes = {
  "#/": renderDashboardPage,
  "#/newjourney": renderNewJourney,
};

function navigate(hash) {
  window.location.hash = hash;
}

function ensureLayout() {
  const app = document.querySelector("#app");

  // Layout nur einmal rendern
  if (!document.querySelector("#page-content")) {
    renderBaseLayout({ mount: app });
  }

  return document.querySelector("#page-content");
}

function render() {
  const hash = window.location.hash || "#/";
  const page = routes[hash] || routes["#/"];

  const contentMount = ensureLayout();

  // beim Seitenwechsel nach oben scrollen
  window.scrollTo(0, 0);

  page({
    mount: contentMount,
    navigate,
  });
}

window.addEventListener("hashchange", render);
render();