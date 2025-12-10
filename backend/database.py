import os
from sqlalchemy.orm import sessionmaker,declarative_base,Session
from sqlalchemy import create_engine
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

database_url = os.getenv("database_url")
if not database_url:
    raise RuntimeError("database_url not set in environment or .env")
engine = create_engine(database_url,echo =True)
sessionLocal= sessionmaker(autoflush=False,autocommit=False,bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session,None,None]:
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()