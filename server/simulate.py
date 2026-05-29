import requests
import time
import random
import math
from config import SIMULATOR_URL

# Testovací skript posiela falošné merania do backendu každých 30 sekúnd.
print("Starting simulation... Sending data every 30 seconds.")

step = 0
while True:
    # Teplota sa mení plynulo ako malá sínusová vlna s náhodným šumom.
    base_temp = 22.0
    temp_variation = math.sin(step * 0.1) * 3  # +/- 3 degrees
    noise_temp = random.uniform(-0.5, 0.5)
    temp = base_temp + temp_variation + noise_temp

    # Vlhkosť meníme podobne, ale s inou periódou a väčším rozsahom.
    base_hum = 45.0
    hum_variation = math.cos(step * 0.1) * 10 # +/- 10 percent
    noise_hum = random.uniform(-2.0, 2.0)
    hum = base_hum + hum_variation + noise_hum

    # Payload zodpovedá formátu, ktorý očakáva API endpoint.
    payload = {
        "temp": round(temp, 1),
        "hum": round(hum, 1)
    }

    try:
        response = requests.post(SIMULATOR_URL, json=payload)
        print(f"Sent {payload} - Status: {response.status_code}")
    except Exception as e:
        print(f"Error sending data: {e}")

    step += 1
    time.sleep(30)
