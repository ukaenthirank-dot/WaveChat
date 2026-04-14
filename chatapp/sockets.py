from collections import Counter
from threading import Lock

from flask import current_app, request
from flask_login import current_user, login_user
from flask_socketio import emit, join_room

from .extensions import db
from .models import CallLog, Message, User, utcnow
from .security import validate_text_message_payload, verify_socket_token
from .services import get_chat_for_user, serialize_message_for_viewer, serialize_user

active_connections = Counter()
active_lock = Lock()


def register_socket_events(socketio):
    def notify_presence(user, is_online):
        payload = {
            "userId": user.id,
            "isOnline": is_online,
            "lastSeenAt": user.last_seen_at.isoformat() if user.last_seen_at else None,
        }
        for membership in user.memberships:
            counterpart = membership.chat.counterpart(user.id)
            if counterpart:
                socketio.emit("presence:update", payload, room=f"user_{counterpart.id}")

    def connection_count_for(user_id):
        with active_lock:
            return active_connections[user_id]

    def resolve_chat_and_counterpart(chat_id):
        try:
            normalized_chat_id = int(chat_id)
        except (TypeError, ValueError):
            emit("call:error", {"error": "Invalid chat selected for the call."})
            return None, None

        chat = get_chat_for_user(normalized_chat_id, current_user.id)
        if not chat:
            emit("call:error", {"error": "Chat not found."})
            return None, None

        counterpart = chat.counterpart(current_user.id)
        if not counterpart:
            emit("call:error", {"error": "Contact not found."})
            return None, None

        return chat, counterpart

    def begin_call_log(chat, counterpart, call_id, call_type):
        call_log = CallLog.query.filter_by(call_id=call_id).first()
        if call_log:
            call_log.chat_id = chat.id
            call_log.call_type = call_type
            call_log.status = "ringing"
            db.session.commit()
            return call_log

        call_log = CallLog(
            call_id=call_id,
            chat_id=chat.id,
            caller_id=current_user.id,
            recipient_id=counterpart.id,
            call_type=call_type,
            status="ringing",
            started_at=utcnow(),
        )
        db.session.add(call_log)
        db.session.commit()
        return call_log

    def set_call_log_status(call_id, status):
        call_log = CallLog.query.filter_by(call_id=call_id).first()
        if not call_log:
            return None
        call_log.status = status
        db.session.commit()
        return call_log

    def mark_call_log_answered(call_id):
        call_log = CallLog.query.filter_by(call_id=call_id).first()
        if not call_log:
            return None
        if not call_log.answered_at:
            call_log.answered_at = utcnow()
        call_log.status = "connected"
        db.session.commit()
        return call_log

    def finalize_call_log(call_id, reason):
        call_log = CallLog.query.filter_by(call_id=call_id).first()
        if not call_log:
            return None

        normalized = str(reason or "ended").strip().lower() or "ended"
        if not call_log.ended_at:
            call_log.ended_at = utcnow()

        if call_log.answered_at:
            if normalized in {"busy", "declined", "failed", "cancelled"}:
                call_log.status = normalized
            else:
                call_log.status = "completed"
        else:
            if normalized == "ended":
                call_log.status = "cancelled"
            elif normalized in {"unsupported", "device-error"}:
                call_log.status = "failed"
            elif normalized == "unavailable":
                call_log.status = "missed"
            else:
                call_log.status = normalized

        db.session.commit()
        return call_log

    def extract_socket_token(auth_payload=None):
        if isinstance(auth_payload, dict):
            token = str(auth_payload.get("token") or "").strip()
            if token:
                return token

        query_token = str(request.args.get("token") or "").strip()
        if query_token:
            return query_token

        return None

    def resolve_socket_user(auth_payload=None):
        if current_user.is_authenticated:
            return current_user

        token = extract_socket_token(auth_payload)
        user_id = verify_socket_token(token)
        if not user_id:
            return None

        user = db.session.get(User, user_id)
        if not user:
            return None

        login_user(user, remember=False, force=True)
        return user

    @socketio.on("connect")
    def handle_connect(auth=None):
        user = resolve_socket_user(auth)
        current_app.logger.info(
            "Socket connect attempt. Authenticated=%s user_id=%s",
            bool(user),
            getattr(user, "id", None),
        )
        if not user:
            current_app.logger.warning("Socket connect rejected because the user is not authenticated.")
            return False

        join_room(f"user_{user.id}")
        with active_lock:
            active_connections[user.id] += 1
            first_connection = active_connections[user.id] == 1

        if first_connection:
            user.is_online = True
            user.last_seen_at = utcnow()
            db.session.commit()
            notify_presence(user, True)

        current_app.logger.info("Socket connected for user_id=%s", user.id)
        emit("socket:ready", {"ok": True, "userId": user.id})

    @socketio.on("disconnect")
    def handle_disconnect():
        if not current_user.is_authenticated:
            return

        with active_lock:
            active_connections[current_user.id] = max(active_connections[current_user.id] - 1, 0)
            should_mark_offline = active_connections[current_user.id] == 0

        if should_mark_offline:
            current_user.is_online = False
            current_user.last_seen_at = utcnow()
            db.session.commit()
            notify_presence(current_user, False)

        current_app.logger.info("Socket disconnected for user_id=%s", current_user.id)

    @socketio.on("send_message")
    def handle_send_message(data):
        if not current_user.is_authenticated:
            emit("message:error", {"error": "Authentication required."})
            return

        try:
            payload = validate_text_message_payload(data)
        except (TypeError, ValueError) as exc:
            emit("message:error", {"error": str(exc)})
            return

        chat = get_chat_for_user(payload["chat_id"], current_user.id)
        if not chat:
            emit("message:error", {"error": "Chat not found."})
            return

        counterpart = chat.counterpart(current_user.id)
        if not counterpart:
            emit("message:error", {"error": "Counterpart not found."})
            return

        existing = Message.query.filter_by(client_message_id=payload["client_message_id"]).first()
        if existing:
            emit("message:new", serialize_message_for_viewer(existing, current_user.id))
            return

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

    @socketio.on("typing")
    def handle_typing(data):
        if not current_user.is_authenticated:
            return

        try:
            chat_id = int(data.get("chatId", 0))
        except (TypeError, ValueError):
            return

        chat = get_chat_for_user(chat_id, current_user.id)
        if not chat:
            return

        counterpart = chat.counterpart(current_user.id)
        if not counterpart:
            return

        socketio.emit(
            "typing",
            {
                "chatId": chat_id,
                "userId": current_user.id,
                "isTyping": bool(data.get("isTyping")),
            },
            room=f"user_{counterpart.id}",
        )

    @socketio.on("message_delivered")
    def handle_delivered(data):
        try:
            message_id = int(data.get("messageId", 0))
        except (TypeError, ValueError):
            return

        message = Message.query.get(message_id)
        if not message or message.recipient_id != current_user.id:
            return

        if not message.delivered_at:
            message.delivered_at = utcnow()
            db.session.commit()

        socketio.emit(
            "message:status",
            {
                "messageId": message.id,
                "chatId": message.chat_id,
                "status": "delivered",
                "deliveredAt": message.delivered_at.isoformat(),
            },
            room=f"user_{message.sender_id}",
        )

    @socketio.on("messages_read")
    def handle_messages_read(data):
        try:
            chat_id = int(data.get("chatId", 0))
        except (TypeError, ValueError):
            return

        message_ids = [int(item) for item in data.get("messageIds", []) if str(item).isdigit()]
        if not message_ids:
            return

        messages = Message.query.filter(
            Message.chat_id == chat_id,
            Message.id.in_(message_ids),
            Message.recipient_id == current_user.id,
        ).all()
        if not messages:
            return

        now = utcnow()
        changed_ids = []
        sender_id = messages[0].sender_id
        for message in messages:
            if not message.delivered_at:
                message.delivered_at = now
            if not message.read_at:
                message.read_at = now
                changed_ids.append(message.id)
        db.session.commit()

        if changed_ids:
            socketio.emit(
                "messages:read",
                {
                    "chatId": chat_id,
                    "messageIds": changed_ids,
                    "readAt": now.isoformat(),
                },
                room=f"user_{sender_id}",
            )

    @socketio.on("call:start")
    def handle_call_start(data):
        if not current_user.is_authenticated:
            emit("call:error", {"error": "Authentication required."})
            return

        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        call_type = str(data.get("callType") or "voice").strip().lower()
        offer = data.get("offer")

        if call_type not in {"voice", "video"}:
            emit("call:error", {"error": "Unsupported call type.", "chatId": chat.id})
            return
        if not call_id:
            emit("call:error", {"error": "Missing call identifier.", "chatId": chat.id})
            return
        if not isinstance(offer, dict):
            emit("call:error", {"error": "Missing call offer.", "chatId": chat.id})
            return
        if connection_count_for(counterpart.id) == 0:
            emit(
                "call:error",
                {
                    "error": "This contact is offline right now. Calls work when both people are online.",
                    "chatId": chat.id,
                },
            )
            return

        begin_call_log(chat, counterpart, call_id, call_type)
        socketio.emit(
            "call:incoming",
            {
                "chatId": chat.id,
                "callId": call_id,
                "callType": call_type,
                "offer": offer,
                "caller": serialize_user(current_user, include_public_key=False),
            },
            room=f"user_{counterpart.id}",
        )
        emit(
            "call:outgoing",
            {
                "chatId": chat.id,
                "callId": call_id,
                "callType": call_type,
                "recipient": serialize_user(counterpart, include_public_key=False),
            },
        )

    @socketio.on("call:ringing")
    def handle_call_ringing(data):
        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        call_type = str(data.get("callType") or "voice").strip().lower() or "voice"
        if not call_id:
            return

        set_call_log_status(call_id, "ringing")
        socketio.emit(
            "call:ringing",
            {
                "chatId": chat.id,
                "callId": call_id,
                "callType": call_type,
                "userId": current_user.id,
            },
            room=f"user_{counterpart.id}",
        )

    @socketio.on("call:answer")
    def handle_call_answer(data):
        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        answer = data.get("answer")
        if not call_id or not isinstance(answer, dict):
            return

        mark_call_log_answered(call_id)
        socketio.emit(
            "call:answered",
            {
                "chatId": chat.id,
                "callId": call_id,
                "answer": answer,
                "userId": current_user.id,
            },
            room=f"user_{counterpart.id}",
        )

    @socketio.on("call:ice_candidate")
    def handle_call_ice_candidate(data):
        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        candidate = data.get("candidate")
        if not call_id or not isinstance(candidate, dict):
            return

        socketio.emit(
            "call:ice_candidate",
            {
                "chatId": chat.id,
                "callId": call_id,
                "candidate": candidate,
                "userId": current_user.id,
            },
            room=f"user_{counterpart.id}",
        )

    @socketio.on("call:reject")
    def handle_call_reject(data):
        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        reason = str(data.get("reason") or "declined").strip() or "declined"
        if not call_id:
            return

        finalize_call_log(call_id, reason)
        socketio.emit(
            "call:rejected",
            {
                "chatId": chat.id,
                "callId": call_id,
                "reason": reason,
                "userId": current_user.id,
            },
            room=f"user_{counterpart.id}",
        )

    @socketio.on("call:end")
    def handle_call_end(data):
        chat, counterpart = resolve_chat_and_counterpart(data.get("chatId"))
        if not chat:
            return

        call_id = str(data.get("callId") or "").strip()
        reason = str(data.get("reason") or "ended").strip() or "ended"
        if not call_id:
            return

        finalize_call_log(call_id, reason)
        socketio.emit(
            "call:ended",
            {
                "chatId": chat.id,
                "callId": call_id,
                "reason": reason,
                "userId": current_user.id,
            },
            room=f"user_{counterpart.id}",
        )
