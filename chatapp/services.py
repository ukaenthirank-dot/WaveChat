import json
from pathlib import Path

from flask import url_for
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from .extensions import db
from .models import CallLog, Chat, ChatParticipant, Message, StatusPost, User, utcnow
from .security import phone_lookup_variants, select_phone_variant_match


def direct_key_for(user_a_id: int, user_b_id: int) -> str:
    left, right = sorted([user_a_id, user_b_id])
    return f"{left}:{right}"


def ensure_direct_chat(user_a: User, user_b: User) -> Chat:
    direct_key = direct_key_for(user_a.id, user_b.id)
    chat = (
        Chat.query.options(joinedload(Chat.memberships).joinedload(ChatParticipant.user))
        .filter_by(direct_key=direct_key)
        .first()
    )
    if chat:
        return chat

    chat = Chat(direct_key=direct_key, is_group=False)
    chat.memberships.append(ChatParticipant(user=user_a))
    chat.memberships.append(ChatParticipant(user=user_b))
    db.session.add(chat)
    db.session.flush()
    return chat


def merge_phone_account_users(phone_number: str, preferred_user: User | None = None) -> User | None:
    matches = User.query.filter(User.phone_number.in_(phone_lookup_variants(phone_number))).order_by(User.id.asc()).all()
    if not matches:
        return preferred_user

    primary = preferred_user or select_phone_variant_match(matches, phone_number)
    exact_match = next((item for item in matches if item.phone_number == phone_number), None)
    if exact_match:
        primary = exact_match
    if not primary:
        return None

    primary.phone_number = phone_number
    duplicates = [item for item in matches if item.id != primary.id]
    if not duplicates:
        return primary

    touched_chat_ids: set[int] = set()

    for duplicate in duplicates:
        if duplicate.display_name and (not primary.display_name or primary.display_name == primary.phone_number):
            primary.display_name = duplicate.display_name
        if duplicate.public_key_jwk and not primary.public_key_jwk:
            primary.public_key_jwk = duplicate.public_key_jwk
        if duplicate.public_key_fingerprint and not primary.public_key_fingerprint:
            primary.public_key_fingerprint = duplicate.public_key_fingerprint
        if duplicate.avatar_color and not primary.avatar_color:
            primary.avatar_color = duplicate.avatar_color
        if duplicate.last_seen_at and (not primary.last_seen_at or duplicate.last_seen_at > primary.last_seen_at):
            primary.last_seen_at = duplicate.last_seen_at
        primary.is_online = bool(primary.is_online or duplicate.is_online)

        Message.query.filter_by(sender_id=duplicate.id).update({"sender_id": primary.id}, synchronize_session=False)
        Message.query.filter_by(recipient_id=duplicate.id).update({"recipient_id": primary.id}, synchronize_session=False)
        CallLog.query.filter_by(caller_id=duplicate.id).update({"caller_id": primary.id}, synchronize_session=False)
        CallLog.query.filter_by(recipient_id=duplicate.id).update({"recipient_id": primary.id}, synchronize_session=False)
        StatusPost.query.filter_by(user_id=duplicate.id).update({"user_id": primary.id}, synchronize_session=False)

        duplicate_memberships = ChatParticipant.query.filter_by(user_id=duplicate.id).all()
        for membership in duplicate_memberships:
            touched_chat_ids.add(membership.chat_id)
            existing_membership = ChatParticipant.query.filter_by(chat_id=membership.chat_id, user_id=primary.id).first()
            if existing_membership:
                db.session.delete(membership)
            else:
                membership.user_id = primary.id

        db.session.flush()
        db.session.delete(duplicate)

    db.session.flush()

    for chat_id in list(touched_chat_ids):
        chat = db.session.get(Chat, chat_id)
        if not chat:
            continue
        participant_ids = sorted({membership.user_id for membership in chat.memberships})
        if chat.is_group:
            continue
        if len(participant_ids) != 2:
            chat.direct_key = None
            continue

        normalized_key = direct_key_for(participant_ids[0], participant_ids[1])
        existing_chat = Chat.query.filter(Chat.direct_key == normalized_key, Chat.id != chat.id).first()
        if existing_chat:
            Message.query.filter_by(chat_id=chat.id).update({"chat_id": existing_chat.id}, synchronize_session=False)
            CallLog.query.filter_by(chat_id=chat.id).update({"chat_id": existing_chat.id}, synchronize_session=False)
            chat_memberships = ChatParticipant.query.filter_by(chat_id=chat.id).all()
            for membership in chat_memberships:
                existing_membership = ChatParticipant.query.filter_by(chat_id=existing_chat.id, user_id=membership.user_id).first()
                if existing_membership:
                    db.session.delete(membership)
                else:
                    membership.chat_id = existing_chat.id
            if chat.updated_at and (not existing_chat.updated_at or chat.updated_at > existing_chat.updated_at):
                existing_chat.updated_at = chat.updated_at
            db.session.flush()
            db.session.delete(chat)
            continue

        chat.direct_key = normalized_key

    db.session.flush()
    return primary


def serialize_user(user: User, include_public_key: bool = False):
    payload = {
        "id": user.id,
        "displayName": user.display_name,
        "phoneNumber": user.phone_number,
        "avatarColor": user.avatar_color,
        "isOnline": bool(user.is_online),
        "lastSeenAt": user.last_seen_at.isoformat() if user.last_seen_at else None,
        "publicKeyFingerprint": user.public_key_fingerprint,
    }
    if include_public_key and user.public_key_jwk:
        payload["publicKey"] = json.loads(user.public_key_jwk)
    return payload


def build_plain_message_payload(message: Message):
    if message.kind == "media":
        return {
            "messageType": "media",
            "caption": message.ciphertext or "",
            "mimeType": message.iv or "application/octet-stream",
            "fileName": message.wrapped_key_sender or "attachment",
            "fileSize": message.file_size,
        }

    return {
        "messageType": "text",
        "text": message.ciphertext or "",
    }


def serialize_message_for_viewer(message: Message, viewer_id: int):
    plain = build_plain_message_payload(message)
    status = "sent"
    if message.read_at:
        status = "read"
    elif message.delivered_at:
        status = "delivered"

    return {
        "id": message.id,
        "chatId": message.chat_id,
        "senderId": message.sender_id,
        "recipientId": message.recipient_id,
        "clientMessageId": message.client_message_id,
        "kind": message.kind,
        "text": plain.get("text"),
        "caption": plain.get("caption"),
        "mimeType": plain.get("mimeType"),
        "fileName": plain.get("fileName"),
        "ciphertext": message.ciphertext,
        "iv": message.iv,
        "wrappedKey": None,
        "mediaIv": None,
        "plain": plain,
        "mediaUrl": url_for("api.download_media", message_id=message.id) if message.media_path else None,
        "fileSize": message.file_size,
        "createdAt": message.created_at.isoformat(),
        "deliveredAt": message.delivered_at.isoformat() if message.delivered_at else None,
        "readAt": message.read_at.isoformat() if message.read_at else None,
        "fromSelf": viewer_id == message.sender_id,
        "status": status,
    }


def serialize_chat(chat: Chat, viewer_id: int, unread_count: int = 0):
    counterpart = chat.counterpart(viewer_id)
    last_message = chat.messages.first()
    updated_at = last_message.created_at if last_message else chat.updated_at
    return {
        "id": chat.id,
        "isGroup": chat.is_group,
        "title": chat.title,
        "updatedAt": updated_at.isoformat(),
        "counterpart": serialize_user(counterpart, include_public_key=True) if counterpart else None,
        "lastMessage": serialize_message_for_viewer(last_message, viewer_id) if last_message else None,
        "unreadCount": unread_count,
    }


def serialize_call_log_for_viewer(call_log: CallLog, viewer_id: int):
    counterpart = call_log.recipient if call_log.caller_id == viewer_id else call_log.caller
    direction = "outgoing" if call_log.caller_id == viewer_id else "incoming"
    duration_seconds = 0
    if call_log.answered_at and call_log.ended_at and call_log.ended_at >= call_log.answered_at:
        duration_seconds = int((call_log.ended_at - call_log.answered_at).total_seconds())

    return {
        "id": call_log.id,
        "callId": call_log.call_id,
        "chatId": call_log.chat_id,
        "callType": call_log.call_type,
        "direction": direction,
        "outcome": call_log.status,
        "createdAt": call_log.started_at.isoformat(),
        "answeredAt": call_log.answered_at.isoformat() if call_log.answered_at else None,
        "endedAt": call_log.ended_at.isoformat() if call_log.ended_at else None,
        "durationSeconds": duration_seconds,
        "name": counterpart.display_name if counterpart else "Contact",
        "phoneNumber": counterpart.phone_number if counterpart else None,
        "avatarColor": counterpart.avatar_color if counterpart else "#128C7E",
    }


def serialize_status_post(status_post: StatusPost, viewer_id: int):
    return {
        "id": status_post.id,
        "text": status_post.text or "",
        "mimeType": status_post.mime_type,
        "mediaUrl": url_for("api.download_status_media", status_id=status_post.id) if status_post.media_path else None,
        "fileSize": status_post.file_size,
        "createdAt": status_post.created_at.isoformat(),
        "expiresAt": status_post.expires_at.isoformat(),
        "isOwn": status_post.user_id == viewer_id,
        "user": serialize_user(status_post.user, include_public_key=False),
    }


def query_chats_for_user(user_id: int):
    return (
        Chat.query.options(joinedload(Chat.memberships).joinedload(ChatParticipant.user))
        .join(ChatParticipant)
        .filter(ChatParticipant.user_id == user_id)
        .all()
    )


def visible_status_owner_ids(user_id: int) -> set[int]:
    owner_ids = {user_id}
    for chat in query_chats_for_user(user_id):
        counterpart = chat.counterpart(user_id)
        if counterpart:
            owner_ids.add(counterpart.id)
    return owner_ids


def query_status_posts_for_user(user_id: int):
    now = utcnow()
    owner_ids = visible_status_owner_ids(user_id)
    return (
        StatusPost.query.options(joinedload(StatusPost.user))
        .filter(StatusPost.user_id.in_(owner_ids), StatusPost.expires_at > now)
        .order_by(StatusPost.created_at.desc())
        .all()
    )


def cleanup_expired_status_posts():
    now = utcnow()
    expired_items = StatusPost.query.filter(StatusPost.expires_at <= now).all()
    if not expired_items:
        return 0

    media_paths = [Path(item.media_path) for item in expired_items if item.media_path]
    for item in expired_items:
        db.session.delete(item)
    db.session.commit()

    for media_path in media_paths:
        try:
            media_path.unlink(missing_ok=True)
        except OSError:
            pass
    return len(expired_items)


def query_call_logs_for_user(user_id: int):
    return (
        CallLog.query.options(joinedload(CallLog.caller), joinedload(CallLog.recipient))
        .filter(or_(CallLog.caller_id == user_id, CallLog.recipient_id == user_id))
        .order_by(CallLog.started_at.desc())
        .limit(60)
        .all()
    )


def unread_count_for_chat(chat_id: int, user_id: int) -> int:
    return Message.query.filter(
        Message.chat_id == chat_id,
        Message.recipient_id == user_id,
        Message.read_at.is_(None),
    ).count()


def get_chat_for_user(chat_id: int, user_id: int):
    return (
        Chat.query.options(joinedload(Chat.memberships).joinedload(ChatParticipant.user))
        .join(ChatParticipant)
        .filter(Chat.id == chat_id, ChatParticipant.user_id == user_id)
        .first()
    )
