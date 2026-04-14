from flask import Blueprint, current_app, jsonify
from flask_login import login_required, login_user, logout_user

from .extensions import db
from .models import OtpCode, User, utcnow
from .services import merge_phone_account_users
from .security import (
    avatar_color_for,
    generate_otp_code,
    hash_otp,
    json_error,
    mask_phone_number,
    normalize_phone_number,
    phone_lookup_variants,
    select_phone_variant_match,
    otp_cooldown_ready,
    otp_expiry,
    parse_json_request,
    sanitize_display_name,
    verify_otp,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/request-otp")
def request_otp():
    try:
        body = parse_json_request()
        phone_number = normalize_phone_number(body.get("phoneNumber", ""))
    except ValueError as exc:
        return json_error(str(exc))

    phone_variants = phone_lookup_variants(phone_number)
    existing_user = (
        User.query.filter(User.phone_number.in_(phone_variants))
        .order_by(User.id.asc())
        .first()
    )

    latest_otp = (
        OtpCode.query.filter(OtpCode.phone_number.in_(phone_variants), OtpCode.consumed_at.is_(None))
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if latest_otp and not otp_cooldown_ready(latest_otp):
        return json_error("Please wait a few seconds before requesting another OTP.", 429)

    try:
        code = generate_otp_code()
        otp_record = OtpCode(
            phone_number=phone_number,
            code_hash=hash_otp(code),
            expires_at=otp_expiry(),
        )
        db.session.add(otp_record)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("OTP request failed for %s", phone_number)
        return json_error("Unable to send OTP right now. Please try again.", 500)

    current_app.logger.info("OTP for %s is %s", phone_number, code)

    response = {
        "ok": True,
        "message": f"OTP sent to {mask_phone_number(phone_number)}.",
        "hasAccount": existing_user is not None,
    }
    if current_app.config["DEV_OTP_EXPOSE"]:
        response["devOtp"] = code
    return jsonify(response)


@auth_bp.post("/verify-otp")
def verify_otp_route():
    try:
        body = parse_json_request()
        phone_number = normalize_phone_number(body.get("phoneNumber", ""))
        otp_value = str(body.get("otp", "")).strip()
        display_name = body.get("displayName", "")
    except ValueError as exc:
        return json_error(str(exc))

    phone_variants = phone_lookup_variants(phone_number)

    otp_record = (
        OtpCode.query.filter(OtpCode.phone_number.in_(phone_variants), OtpCode.consumed_at.is_(None))
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if not otp_record:
        return json_error("Request an OTP first.", 404)
    if otp_record.expires_at < utcnow():
        return json_error("OTP expired. Request a new code.", 400)
    if otp_record.attempts_left <= 0:
        return json_error("Too many attempts. Request a new OTP.", 429)

    if not verify_otp(otp_record.code_hash, otp_value):
        otp_record.attempts_left -= 1
        db.session.commit()
        return json_error("OTP is incorrect.", 400)

    try:
        otp_record.consumed_at = utcnow()
        matched_users = User.query.filter(User.phone_number.in_(phone_variants)).order_by(User.id.asc()).all()
        user = select_phone_variant_match(matched_users, phone_number)
        exact_user = next((item for item in matched_users if item.phone_number == phone_number), None)
        name = None
        if display_name:
            try:
                name = sanitize_display_name(display_name)
            except ValueError as exc:
                return json_error(str(exc))
        if name:
            existing_name = User.query.filter(User.display_name.ilike(name)).first()
            if existing_name and (not user or existing_name.id != user.id):
                return json_error("Display name already exists. Choose another.")
        if not user:
            if not name:
                return json_error("Display name is required for new accounts.")
            user = User(
                phone_number=phone_number,
                display_name=name,
                avatar_color=avatar_color_for(phone_number),
                last_seen_at=utcnow(),
            )
            db.session.add(user)
        else:
            if user.phone_number != phone_number and not exact_user:
                user.phone_number = phone_number
            if display_name and not user.display_name:
                user.display_name = sanitize_display_name(display_name)
            user.last_seen_at = utcnow()

        db.session.flush()
        user = merge_phone_account_users(phone_number, preferred_user=user) or user
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("OTP verification failed for %s", phone_number)
        return json_error("Unable to verify OTP right now. Please try again.", 500)

    login_user(user, remember=True)
    return jsonify({"ok": True, "redirect": "/"})


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"ok": True})
