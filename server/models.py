from sqlalchemy import Column, Integer, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from config import DATABASE_URL

# SQLite engine pre ukladanie meraní zo senzora.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SensorReading(Base):
    __tablename__ = "readings"

    # Každý záznam reprezentuje jedno meranie teploty a vlhkosti.
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    temp = Column(Float, nullable=False)
    hum = Column(Float, nullable=False)

    def to_dict(self):
        # Dáta vraciame vo formáte vhodnom pre API a grafy.
        return {
            "id": self.id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "temp": self.temp,
            "hum": self.hum,
        }


# Tabuľku vytvoríme automaticky pri štarte aplikácie.
Base.metadata.create_all(bind=engine)
