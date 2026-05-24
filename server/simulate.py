import requests
import time
import random
import math

URL = "http://127.0.0.1:5001/api/measurements"

print("Starting simulation... Sending data every 5 seconds.")

step = 0
while True:
    # Simulate realistic temperature variations using sine wave + noise
    base_temp = 22.0
    temp_variation = math.sin(step * 0.1) * 3  # +/- 3 degrees
    noise_temp = random.uniform(-0.5, 0.5)
    temp = base_temp + temp_variation + noise_temp

    # Simulate humidity variations
    base_hum = 45.0
    hum_variation = math.cos(step * 0.1) * 10 # +/- 10 percent
    noise_hum = random.uniform(-2.0, 2.0)
    hum = base_hum + hum_variation + noise_hum

    payload = {
        "temp": round(temp, 1),
        "hum": round(hum, 1)
    }

    try:
        response = requests.post(URL, json=payload)
        print(f"Sent {payload} - Status: {response.status_code}")
    except Exception as e:
        print(f"Error sending data: {e}")

    step += 1
    time.sleep(5)
