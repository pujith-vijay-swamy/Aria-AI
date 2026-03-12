from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost/mental_ai_db"
    GEMINI_API_KEY: str = ""
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_SERVICE_ACCOUNT_PATH: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
