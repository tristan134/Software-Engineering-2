function defaultApiBase() {
	if (typeof window !== "undefined") {
		const host = window.location?.hostname;
		if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
			return "http://localhost:8000/api";
		}
	}
	return "/api";
}

export const API_BASE = (
	import.meta.env?.VITE_API_BASE || defaultApiBase()
).replace(/\/+$/, "");

export function apiUrl(path) {
	const p = String(path || "");
	if (!p) return API_BASE;
	return `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
}
