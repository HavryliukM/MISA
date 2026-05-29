from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from datetime import datetime, timedelta
from models import SessionLocal, SensorReading
from config import HISTORY_HOURS, APP_HOST, APP_PORT

app = FastAPI()
# Statické súbory a šablóny sú oddelené, aby backend vracal aj UI.
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Telo POST requestu s jedným meraním zo senzora alebo simulátora.
class MeasurementIn(BaseModel):
    temp: float
    hum: float

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # Úvodná stránka dashboardu.
    return templates.TemplateResponse(request, "index.html", {"request": request})

@app.get("/api/history")
async def get_history():
    # Vrátime merania iba za posledných HISTORY_HOURS hodín.
    db = SessionLocal()
    cutoff = datetime.utcnow() - timedelta(hours=HISTORY_HOURS)
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.timestamp >= cutoff)
        .order_by(SensorReading.timestamp.asc())
        .all()
    )
    now = datetime.utcnow()
    data = []
    for r in readings:
        d = r.to_dict()
        d["age_seconds"] = (now - r.timestamp).total_seconds()
        data.append(d)
    db.close()
    return JSONResponse(content=data)

@app.get("/api/latest")
async def get_latest():
    # Posledný uložený záznam slúži pre rýchle zobrazenie aktuálnych hodnôt.
    db = SessionLocal()
    reading = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    data = reading.to_dict() if reading else None
    db.close()
    return JSONResponse(content=data)

@app.post("/api/measurements")
async def add_measurement(measurement: MeasurementIn):
    # Odmietneme zjavne chybné hodnoty zo senzora.
    if measurement.temp <= 0.5 or measurement.hum <= 1.0:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Invalid or corrupted sensor reading"}
        )
    
    # Platné meranie uložíme do databázy a pošleme späť potvrdenie.
    db = SessionLocal()
    new_reading = SensorReading(temp=measurement.temp, hum=measurement.hum)
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    data = new_reading.to_dict()
    db.close()
    return JSONResponse(content={"status": "success", "data": data})

if __name__ == "__main__":
    # Lokálne spustenie backendu priamo z tohto súboru.
    import uvicorn
    uvicorn.run(app, host=APP_HOST, port=APP_PORT, log_level="info")
