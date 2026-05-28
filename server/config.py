from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent
# Konfiguračný súbor s premennými prostredia vedľa servera.
ENV_FILE = BASE_DIR / ".env"


def load_env_file(path: Path = ENV_FILE) -> None:
    # Načítame lokálne nastavenia iba vtedy, keď .env súbor existuje.
    if not path.exists():
        return

    # Každý riadok čítame ako key=value pár a nastavíme ho len raz.
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()

# Predvolené hodnoty sú pripravené tak, aby backend vedel bežať aj bez .env.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
HISTORY_HOURS = int(os.getenv("HISTORY_HOURS", "24"))
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "5001"))
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://127.0.0.1:5001/api/measurements")