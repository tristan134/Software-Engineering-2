import "./style.css";
import { DefaultApi } from "./generated/apis/DefaultApi.js";
import { Configuration } from "./generated/runtime.js";

const api = new DefaultApi(
  new Configuration({
    basePath: "/api",
  })
);

document.querySelector("#app").innerHTML = `
  <div class="card">
    <h1>Landing Page</h1>
    <p id="status">Lade...</p>
    <button id="btn">Backend anfragen</button>
    <pre id="out"></pre>
  </div>
`;

const status = document.querySelector("#status");
const out = document.querySelector("#out");

async function loadHealth() {
  try {
    const res = await api.healthApiV1HealthGet();
    status.textContent = `Health: ${res.status}`;
  } catch (e) {
    status.textContent = "Health: FEHLER (Proxy/Backend?)";
    console.error(e);
  }
}

document.querySelector("#btn").addEventListener("click", async () => {
  out.textContent = "";
  try {
    const res = await api.messageApiV1MessageGet();
    out.textContent = JSON.stringify(res, null, 2);
  } catch (e) {
    out.textContent = String(e);
    console.error(e);
  }
});

loadHealth();
