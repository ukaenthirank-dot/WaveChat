import mimetypes
import uuid
from datetime import timedelta
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_file
from flask_login import current_user, login_required
from flask_wtf.csrf import generate_csrf

from .extensions import db, socketio
from .models import Message, StatusPost, User, utcnow
from .security import (
    allowed_mime_type,
    create_socket_token,
    json_error,
    normalize_phone_number,
    phone_lookup_variants,
    select_phone_variant_match,
    parse_json_request,
    parse_public_key,
    validate_media_message_payload,
    validate_text_message_payload,
)
from .services import (
    cleanup_expired_status_posts,
    ensure_direct_chat,
    get_chat_for_user,
    query_call_logs_for_user,
    query_chats_for_user,
    query_status_posts_for_user,
    serialize_call_log_for_viewer,
    serialize_chat,
    serialize_message_for_viewer,
    serialize_status_post,
    serialize_user,
    unread_count_for_chat,
    visible_status_owner_ids,
)

api_bp = Blueprint("api", __name__)


@api_bp.get("/bootstrap")
@login_required
def bootstrap():
    cleanup_expired_status_posts()
    chats = query_chats_for_user(current_user.id)
    serialized_chats = [
        serialize_chat(chat, current_user.id, unread_count_for_chat(chat.id, current_user.id))
        for chat in chats
    ]
    serialized_chats.sort(
        key=lambda chat: chat["lastMessage"]["createdAt"] if chat["lastMessage"] else chat["updatedAt"],
        reverse=True,
    )
    call_history = [serialize_call_log_for_viewer(item, current_user.id) for item in query_call_logs_for_user(current_user.id)]
    status_posts = [serialize_status_post(item, current_user.id) for item in query_status_posts_for_user(current_user.id)]
    return jsonify(
        {
            "ok": True,
            "me": serialize_user(current_user, include_public_key=True),
            "csrfToken": generate_csrf(),
            "socketToken": create_socket_token(current_user),
            "chats": serialized_chats,
            "callHistory": call_history,
            "statusPosts": status_posts,
        }
    )


@api_bp.post("/keys")
@login_required
def save_public_key():
    try:
        body = parse_json_request()
        serialized, fingerprint = parse_public_key(body.get("publicKey"))
    except ValueError as exc:
        return json_error(str(exc))

    current_user.public_key_jwk = serialized
    current_user.public_key_fingerprint = fingerprint
    db.session.commit()
    return jsonify({"ok": True, "fingerprint": fingerprint})


@api_bp.get("/users/find")
@login_required
def find_user():
    try:
        phone_number = normalize_phone_number(request.args.get("phone", ""))
    except ValueError as exc:
        return json_error(str(exc))

    matches = User.query.filter(User.phone_number.in_(phone_lookup_variants(phone_number))).order_by(User.id.asc()).all()
    user = select_phone_variant_match(matches, phone_number)
    if not user or user.id == current_user.id:
        return json_error("No user found for that phone number.", 404)

    return jsonify({"ok": True, "user": serialize_user(user, include_public_key=True)})


@api_bp.post("/chats")
@login_required
def start_chat():
    try:
        body = parse_json_request()
        phone_number = normalize_phone_number(body.get("phoneNumber", ""))
    except ValueError as exc:
        return json_error(str(exc))

    matches = User.query.filter(User.phone_number.in_(phone_lookup_variants(phone_number))).order_by(User.id.asc()).all()
    partner = select_phone_variant_match(matches, phone_number)
    if not partner or partner.id == current_user.id:
        return json_error("No user found for that phone number.", 404)

    chat = ensure_direct_chat(current_user, partner)
    db.session.commit()
    return jsonify(
        {
            "ok": True,
            "chat": serialize_chat(chat, current_user.id, unread_count_for_chat(chat.id, current_user.id)),
        }
    )


@api_bp.get("/chats/<int:chat_id>/messages")
@login_required
def get_messages(chat_id: int):
    chat = get_chat_for_user(chat_id, current_user.id)
    if not chat:
        return json_error("Chat not found.", 404)

    before_id = request.args.get("before", type=int)
    query = Message.query.filter_by(chat_id=chat.id).order_by(Message.id.desc())
    if before_id:
        query = query.filter(Message.id < before_id)

    page_size = min(max(request.args.get("limit", 30, type=int), 1), 50)
    items = query.limit(page_size + 1).all()
    has_more = len(items) > page_size
    items = items[:page_size]
    serialized = [serialize_message_for_viewer(message, current_user.id) for message in reversed(items)]
    return jsonify({"ok": True, "messages": serialized, "hasMore": has_more})


@api_bp.post("/messages/text")
@login_required
def send_text_message():
    try:
        payload = validate_text_message_payload(parse_json_request())
    except (TypeError, ValueError) as exc:
        return json_error(str(exc))

    chat = get_chat_for_user(payload["chat_id"], current_user.id)
    if not chat:
        return json_error("Chat not found.", 404)

    counterpart = chat.counterpart(current_user.id)
    if not counterpart:
        return json_error("Counterpart not found.", 400)

    existing = Message.query.filter_by(client_message_id=payload["client_message_id"]).first()
    if existing:
        return jsonify({"ok": True, "message": serialize_message_for_viewer(existing, current_user.id)})

    message = Message(
        chat_id=chat.id,
        sender_id=current_user.id,
        recipient_id=counterpart.id,
        client_message_id=payload["client_message_id"],
        kind="text",
        ciphertext=payload["text"],
        iv="",
        wrapped_key_sender="",
        wrapped_key_recipient="",
        created_at=utcnow(),
    )
    chat.updated_at = utcnow()
    db.session.add(message)
    db.session.commit()

    sender_payload = serialize_message_for_viewer(message, current_user.id)
    recipient_payload = serialize_message_for_viewer(message, counterpart.id)
    socketio.emit("message:new", sender_payload, room=f"user_{current_user.id}")
    socketio.emit("message:new", recipient_payload, room=f"user_{counterpart.id}")

    return jsonify({"ok": True, "message": sender_payload})


@api_bp.post("/messages/media")
@login_required
def upload_media_message():
    try:
        payload = validate_media_message_payload(request.form)
    except (TypeError, ValueError) as exc:
        return json_error(str(exc))

    chat = get_chat_for_user(payload["chat_id"], current_user.id)
    if not chat:
        return json_error("Chat not found.", 404)

    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return json_error("A media file is required.")

    if not allowed_mime_type(payload["mime_type"]):
        return json_error("This file type is not supported.")

    counterpart = chat.counterpart(current_user.id)
    if not counterpart:
        return json_error("Direct chat counterpart not found.", 400)

    suffix = Path(payload["file_name"]).suffix.lower()
    if not suffix:
        suffix = mimetypes.guess_extension(payload["mime_type"].split(";")[0].strip()) or ""
    upload_name = f"{uuid.uuid4().hex}{suffix}"
    upload_path = Path(current_app.config["UPLOAD_FOLDER"]) / upload_name
    uploaded_file.save(upload_path)

    message = Message(
        chat_id=chat.id,
        sender_id=current_user.id,
        recipient_id=counterpart.id,
        client_message_id=payload["client_message_id"],
        kind="media",
        ciphertext=payload["caption"],
        iv=payload["mime_type"],
        wrapped_key_sender=payload["file_name"],
        wrapped_key_recipient="",
        media_iv=None,
        media_path=str(upload_path),
        file_size=upload_path.stat().st_size,
        created_at=utcnow(),
    )
    chat.updated_at = utcnow()
    db.session.add(message)
    db.session.commit()

    sender_payload = serialize_message_for_viewer(message, current_user.id)
    recipient_payload = serialize_message_for_viewer(message, counterpart.id)
    socketio.emit("message:new", sender_payload, room=f"user_{current_user.id}")
    socketio.emit("message:new", recipient_payload, room=f"user_{counterpart.id}")

    return jsonify({"ok": True, "message": sender_payload})


@api_bp.post("/status")
@login_required
def create_status_post():
    cleanup_expired_status_posts()

    uploaded_file = request.files.get("file")
    if request.is_json:
        try:
            body = parse_json_request()
        except ValueError as exc:
            return json_error(str(exc))
        text = str(body.get("text", "")).strip()
        mime_type = None
    else:
        text = str(request.form.get("text", "")).strip()
        mime_type = str(request.form.get("mimeType", "")).strip() or None

    text = text[:500]
    if not text and not uploaded_file:
        return json_error("Write something or attach a photo/video for your status.")

    media_path = None
    file_size = None
    normalized_mime_type = None

    if uploaded_file and uploaded_file.filename:
        normalized_mime_type = (mime_type or uploaded_file.mimetype or "application/octet-stream").split(";")[0].strip().lower()
        if not normalized_mime_type.startswith(("image/", "video/")):
            return json_error("Status supports photo and video updates only.")
        if not allowed_mime_type(normalized_mime_type):
            return json_error("This file type is not supported.")

        suffix = Path(uploaded_file.filename).suffix.lower()
        if not suffix:
            suffix = mimetypes.guess_extension(normalized_mime_type) or ""
        status_dir = Path(current_app.config["UPLOAD_FOLDER"]) / "status"
        status_dir.mkdir(parents=True, exist_ok=True)
        upload_name = f"status_{uuid.uuid4().hex}{suffix}"
        media_path = status_dir / upload_name
        uploaded_file.save(media_path)
        file_size = media_path.stat().st_size

    status_post = StatusPost(
        user_id=current_user.id,
        text=text or None,
        mime_type=normalized_mime_type,
        media_path=str(media_path) if media_path else None,
        file_size=file_size,
        created_at=utcnow(),
        expires_at=utcnow() + timedelta(hours=24),
    )
    db.session.add(status_post)
    db.session.commit()

    viewers = visible_status_owner_ids(current_user.id)
    for viewer_id in viewers:
        socketio.emit("status:new", serialize_status_post(status_post, viewer_id), room=f"user_{viewer_id}")

    return jsonify({"ok": True, "status": serialize_status_post(status_post, current_user.id)})


@api_bp.get("/chats/<int:chat_id>/read")
@login_required
def unsupported_read_get(chat_id: int):
    return json_error("Use POST to mark a chat as read.", 405)


@api_bp.post("/chats/<int:chat_id>/read")
@login_required
def mark_chat_read(chat_id: int):
    chat = get_chat_for_user(chat_id, current_user.id)
    if not chat:
        return json_error("Chat not found.", 404)

    messages = Message.query.filter(
        Message.chat_id == chat.id,
        Message.recipient_id == current_user.id,
        Message.read_at.is_(None),
    ).all()
    if not messages:
        return jsonify({"ok": True, "chatId": chat.id, "messageIds": [], "readAt": None})

    now = utcnow()
    changed_ids = []
    sender_ids = set()
    for message in messages:
        sender_ids.add(message.sender_id)
        if not message.delivered_at:
            message.delivered_at = now
        if not message.read_at:
            message.read_at = now
            changed_ids.append(message.id)

    db.session.commit()

    for sender_id in sender_ids:
        socketio.emit(
            "messages:read",
            {
                "chatId": chat.id,
                "messageIds": changed_ids,
                "readAt": now.isoformat(),
            },
            room=f"user_{sender_id}",
        )

    return jsonify({"ok": True, "chatId": chat.id, "messageIds": changed_ids, "readAt": now.isoformat()})


@api_bp.delete("/chats/<int:chat_id>")
@login_required
def delete_chat(chat_id: int):
    chat = get_chat_for_user(chat_id, current_user.id)
    if not chat:
        return json_error("Chat not found.", 404)

    participant_ids = {membership.user_id for membership in chat.memberships}
    media_paths = []
    for message in Message.query.filter_by(chat_id=chat.id).all():
        if message.media_path:
            media_paths.append(Path(message.media_path))

    db.session.delete(chat)
    db.session.commit()

    for media_path in media_paths:
        try:
            media_path.unlink(missing_ok=True)
        except OSError:
            current_app.logger.warning("Unable to remove deleted chat media file: %s", media_path)

    payload = {
        "chatId": chat_id,
        "message": "Chat deleted.",
    }
    for user_id in participant_ids:
        socketio.emit("chat:deleted", payload, room=f"user_{user_id}")

    return jsonify({"ok": True, "chatId": chat_id})


@api_bp.get("/messages/<int:message_id>/media")
@login_required
def download_media(message_id: int):
    message = Message.query.get_or_404(message_id)
    if current_user.id not in {message.sender_id, message.recipient_id}:
        return json_error("You do not have access to this attachment.", 403)
    if not message.media_path:
        return json_error("Attachment not found.", 404)

    return send_file(
        message.media_path,
        mimetype=message.iv or "application/octet-stream",
        as_attachment=False,
        download_name=message.wrapped_key_sender or None,
    )


@api_bp.get("/status/<int:status_id>/media")
@login_required
def download_status_media(status_id: int):
    cleanup_expired_status_posts()
    status_post = StatusPost.query.get_or_404(status_id)
    if status_post.expires_at <= utcnow():
        return json_error("Status is no longer available.", 404)
    if status_post.user_id not in visible_status_owner_ids(current_user.id):
        return json_error("You do not have access to this status.", 403)
    if not status_post.media_path:
        return json_error("Status media not found.", 404)

    return send_file(
        status_post.media_path,
        mimetype=status_post.mime_type or "application/octet-stream",
        as_attachment=False,
        download_name=Path(status_post.media_path).name,
    )
