from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 # Token will be valid for 1 hour
    database_url: str
    class Config:
        env_file = ".env"

settings = Settings()