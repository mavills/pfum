import os
from typing import Dict, Any, Optional, List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Environment variables are loaded with the following priority:
    1. Environment variables (.env file)
    2. Default values defined in this class
    """

    # Application configuration
    APP_NAME: str = "TransformatAPI"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)

    # API Configuration
    API_PREFIX: str = "/api"
    API_V1_PREFIX: str = "/v1"

    # CORS Configuration
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    @property
    def is_development(self) -> bool:
        """Check if the application is running in development mode."""
        return self.ENVIRONMENT.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if the application is running in production mode."""
        return self.ENVIRONMENT.lower() == "production"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # class Config:
    #     """Pydantic configuration."""

    #     env_file = ".env"
    #     case_sensitive = True


# Create a global instance of the settings
settings = Settings()
