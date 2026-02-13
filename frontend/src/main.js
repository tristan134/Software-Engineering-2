import "./css/root.css";
import "./css/utilities.css";
import { renderBaseLayout } from "./pages/base.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderFullJourney } from "./pages/fulljourney.js";
import { renderNewJourney } from "./pages/newjourney.js";

const routes = new Map([
  ["#/", renderDashboardPage],
  ["#/newjourney", renderNewJourney],
  ["#/fulljourney", renderFullJourney],
]);

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

	const contentMount = ensureLayout();

	window.scrollTo(0, 0);

	if (hash.startsWith("#/fulljourney/")) {
		return renderFullJourney({ mount: contentMount, navigate });
	}

	const page = routes.get(hash) ?? routes.get("#/");
	page({ mount: contentMount, navigate });

}

window.addEventListener("hashchange", render);

render();
