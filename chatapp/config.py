import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def env_flag(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_csv(name: str) -> list[str]:
    value = os.getenv(name, "")
    return [item.strip() for item in value.split(",") if item.strip()]


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'chat.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_UPLOAD_SIZE_MB", "16")) * 1024 * 1024
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
    OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
    OTP_REQUEST_COOLDOWN = int(os.getenv("OTP_REQUEST_COOLDOWN", "45"))
    DEV_OTP_EXPOSE = env_flag("DEV_OTP_EXPOSE", True)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = env_flag("SESSION_COOKIE_SECURE", False)
    REMEMBER_COOKIE_SAMESITE = "Lax"
    RTC_STUN_URLS = env_csv("RTC_STUN_URLS") or [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
    ]
    RTC_TURN_URLS = env_csv("RTC_TURN_URLS")
    RTC_TURN_USERNAME = os.getenv("RTC_TURN_USERNAME", "")
    RTC_TURN_CREDENTIAL = os.getenv("RTC_TURN_CREDENTIAL", "")
    RTC_ICE_TRANSPORT_POLICY = os.getenv("RTC_ICE_TRANSPORT_POLICY", "all")
    RTC_ICE_SERVERS = ([{"urls": RTC_STUN_URLS}] + ([{
        "urls": RTC_TURN_URLS,
        "username": RTC_TURN_USERNAME,
        "credential": RTC_TURN_CREDENTIAL,
    }] if RTC_TURN_URLS else []))
    WTF_CSRF_TIME_LIMIT = None
    WTF_CSRF_CHECK_DEFAULT = False

