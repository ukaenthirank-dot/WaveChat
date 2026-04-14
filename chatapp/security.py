import hashlib
import json
import random
import re
from datetime import timedelta
from typing import Any

from flask import current_app, jsonify, request
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from .models import utcnow

PHONE_RE = re.compile(r"^\+?[1-9]\d{9,14}$")
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "audio/webm",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp4",
    "audio/aac",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/octet-stream",
}


def install_security_headers(app):
    @app.after_request
    def apply_headers(response):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' ws: wss:; "
            "media-src 'self' blob:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'; "
            "form-action 'self'"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"
        return response


def json_error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


def normalize_phone_number(value: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", (value or "").strip())
    if cleaned.startswith("00"):
        cleaned = f"+{cleaned[2:]}"
    digits = re.sub(r"\D", "", cleaned)
    if len(digits) == 10:
        normalized = digits
    elif len(digits) == 12 and digits.startswith("91"):
        normalized = digits[2:]
    else:
        normalized = f"+{digits}"
    if not PHONE_RE.match(normalized):
        raise ValueError("Enter a valid phone number.")
    return normalized


def phone_lookup_variants(value: str) -> list[str]:
    normalized = normalize_phone_number(value)
    digits = re.sub(r"\D", "", normalized)
    variants: list[str] = []

    def add(candidate: str):
        if candidate and candidate not in variants:
            variants.append(candidate)

    add(normalized)
    add(digits)
    add(f"+{digits}")

    if len(digits) == 10:
        add(f"91{digits}")
        add(f"+91{digits}")
    elif len(digits) == 12 and digits.startswith("91"):
        add(digits[2:])
        add(f"+{digits[2:]}")

    return variants


def select_phone_variant_match(items, phone_number: str, value_getter=None):
    value_getter = value_getter or (lambda item: getattr(item, "phone_number", None))
    variants = phone_lookup_variants(phone_number)
    candidates = list(items or [])

    for variant in variants:
        for item in candidates:
            if value_getter(item) == variant:
                return item

    return candidates[0] if candidates else None


def sanitize_display_name(value: str) -> str:
    display_name = (value or "").strip()
    if len(display_name) < 2 or len(display_name) > 80:
        raise ValueError("Display name must be between 2 and 80 characters.")
    return display_name


def generate_otp_code() -> str:
    return f"{random.randint(0, 999999):06d}"


def hash_otp(code: str) -> str:
    return generate_password_hash(code)


def verify_otp(code_hash: str, code: str) -> bool:
    return check_password_hash(code_hash, code)


def otp_expiry():
    return utcnow() + timedelta(seconds=current_app.config["OTP_EXPIRY_SECONDS"])


def otp_cooldown_ready(otp_record) -> bool:
    if not otp_record:
        return True
    cooldown = timedelta(seconds=current_app.config["OTP_REQUEST_COOLDOWN"])
    return (utcnow() - otp_record.created_at) >= cooldown


def mask_phone_number(phone_number: str) -> str:
    if len(phone_number) < 5:
        return phone_number
    return f"{phone_number[:3]}{'*' * max(len(phone_number) - 5, 1)}{phone_number[-2:]}"


def avatar_color_for(seed: str) -> str:
    palette = ["#128C7E", "#075E54", "#34B7F1", "#FF8A65", "#5C6BC0", "#9CCC65"]
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return palette[int(digest[:2], 16) % len(palette)]


def normalize_client_message_id(value: Any) -> str:
    client_message_id = str(value or "").strip()[:72]
    if len(client_message_id) < 8:
        raise ValueError("clientMessageId is required.")
    return client_message_id


def sanitize_message_text(value: Any, field_name: str = "text", *, required: bool = False, max_length: int = 4000) -> str:
    text = str(value or "").strip()
    if required and not text:
        raise ValueError(f"{field_name} is required.")
    if len(text) > max_length:
        raise ValueError(f"{field_name} is too long.")
    return text


def sanitize_file_name(value: Any) -> str:
    name = secure_filename(str(value or "").strip())[:180]
    return name or "attachment"


def validate_text_message_payload(data: dict):
    if not isinstance(data, dict):
        raise ValueError("Invalid JSON body.")

    try:
        chat_id = int(data.get("chatId"))
    except (TypeError, ValueError):
        raise ValueError("chatId is required.")

    return {
        "chat_id": chat_id,
        "client_message_id": normalize_client_message_id(data.get("clientMessageId")),
        "text": sanitize_message_text(data.get("text"), "text", required=True),
        "kind": "text",
    }


def validate_media_message_payload(form):
    try:
        chat_id = int(form.get("chatId"))
    except (TypeError, ValueError):
        raise ValueError("chatId is required.")

    mime_type = str(form.get("mimeType") or "").strip() or "application/octet-stream"
    file_name = sanitize_file_name(form.get("fileName"))

    return {
        "chat_id": chat_id,
        "client_message_id": normalize_client_message_id(form.get("clientMessageId")),
        "caption": sanitize_message_text(form.get("caption"), "caption", max_length=2000),
        "mime_type": mime_type,
        "file_name": file_name,
        "kind": "media",
    }


def parse_json_request() -> dict:
    if not request.is_json:
        raise ValueError("JSON body expected.")
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise ValueError("Invalid JSON body.")
    return body


def parse_public_key(public_key):
    if not isinstance(public_key, dict):
        raise ValueError("publicKey must be a JSON object.")
    serialized = json.dumps(public_key, sort_keys=True)
    if len(serialized) > 12000:
        raise ValueError("publicKey is too large.")
    fingerprint = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return serialized, fingerprint


def allowed_mime_type(mime_type: str) -> bool:
    return mime_type in ALLOWED_MIME_TYPES


def _socket_token_serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="wavechat-socket")


def create_socket_token(user) -> str:
    return _socket_token_serializer().dumps({"user_id": int(user.id)})


def verify_socket_token(token: str, max_age: int = 60 * 60 * 24 * 7):
    if not isinstance(token, str) or not token.strip():
        return None
    try:
        payload = _socket_token_serializer().loads(token, max_age=max_age)
    except (BadSignature, BadTimeSignature):
        return None

    try:
        return int(payload.get("user_id"))
    except (TypeError, ValueError, AttributeError):
        return None
