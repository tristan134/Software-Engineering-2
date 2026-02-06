from fastapi import FastAPI

app = FastAPI(title="Journeo", version="1.0.0")

@app.get("/api/v1/health")
def health():
    return {"status": "ok"}

@app.get("/api/v1/message")
def message():
    return {"message": "Hello from backend"}
