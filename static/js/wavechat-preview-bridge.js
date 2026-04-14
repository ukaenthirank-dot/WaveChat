(function () {
    if (window.__waveChatPreviewInstalled) {
        return;
    }
    window.__waveChatPreviewInstalled = true;

    const DEMO_IDS = {
        sarah: 9001,
        marcus: 9002,
        emily: 9003,
        design: 9004,
        david: 9005,
        lisa: 9006,
    };

    const ASSETS = {
        me: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        marcus: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        emily: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        design: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",
        david: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        lisa: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        sunset: "https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBsYW5kc2NhcGUlMjBuYXR1cmV8ZW58MXx8fHwxNzc1MTgwODY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    };

    const preview = {
        active: false,
        force: false,
        store: null,
        realFetch: window.fetch.bind(window),
        realIo: typeof window.io === "function" ? window.io.bind(window) : null,
        socket: null,
        observer: null,
    };

    preview.force = Boolean(document.getElementById("chat-app")?.dataset.previewMode === "mobile");
    if (preview.force) {
        document.body.classList.add("wavechat-preview-active");
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createOffsetIso({ days = 0, hours = 0, minutes = 0, seconds = 0 } = {}) {
        const totalMs = ((((days * 24) + hours) * 60 + minutes) * 60 + seconds) * 1000;
        return new Date(Date.now() - totalMs).toISOString();
    }

    function normalizeDigits(value) {
        return String(value || "").replace(/\D/g, "");
    }

    function jsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    function makeTextMessage(id, chatId, text, offset, fromSelf, extras = {}) {
        const createdAt = createOffsetIso(offset);
        return {
            id,
            chatId,
            kind: "text",
            text,
            ciphertext: text,
            plain: { messageType: "text", text },
            createdAt,
            fromSelf: Boolean(fromSelf),
            senderId: fromSelf ? 7000 : null,
            recipientId: fromSelf ? null : 7000,
            status: fromSelf ? "read" : "delivered",
            deliveredAt: createdAt,
            readAt: fromSelf ? createdAt : null,
            reactions: extras.reactions || [],
        };
    }

    function makeMediaMessage(id, chatId, caption, offset, mediaUrl) {
        const createdAt = createOffsetIso(offset);
        return {
            id,
            chatId,
            kind: "media",
            caption,
            mimeType: "image/jpeg",
            fileName: "sunset.jpg",
            fileSize: 320000,
            mediaUrl,
            plain: {
                messageType: "media",
                caption,
                mimeType: "image/jpeg",
                fileName: "sunset.jpg",
                fileSize: 320000,
            },
            createdAt,
            fromSelf: false,
            senderId: null,
            recipientId: 7000,
            status: "delivered",
            deliveredAt: createdAt,
            readAt: null,
        };
    }

    function createDemoStore(seedMe = {}) {
        const me = {
            id: seedMe.id || 7000,
            displayName: seedMe.displayName || "Ukaenthiran",
            phoneNumber: seedMe.phoneNumber || "7904564217",
            avatarColor: seedMe.avatarColor || "#d63145",
            avatarUrl: seedMe.avatarUrl || ASSETS.me,
            isOnline: true,
            lastSeenAt: new Date().toISOString(),
        };

        const users = {
            sarah: { id: 7001, displayName: "Sarah Chen", phoneNumber: "2025550106", avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, isOnline: true, lastSeenAt: new Date().toISOString() },
            marcus: { id: 7002, displayName: "Marcus Johnson", phoneNumber: "2025550107", avatarColor: "#25a18e", avatarUrl: ASSETS.marcus, isOnline: true, lastSeenAt: new Date().toISOString() },
            emily: { id: 7003, displayName: "Emily Rodriguez", phoneNumber: "2025550108", avatarColor: "#5f6df6", avatarUrl: ASSETS.emily, isOnline: false, lastSeenAt: createOffsetIso({ hours: 2, minutes: 5 }) },
            design: { id: 7004, displayName: "Design Team", phoneNumber: "2025550109", avatarColor: "#111827", avatarUrl: ASSETS.design, isOnline: false, lastSeenAt: createOffsetIso({ hours: 4, minutes: 10 }) },
            david: { id: 7005, displayName: "David Kim", phoneNumber: "2025550110", avatarColor: "#475569", avatarUrl: ASSETS.david, isOnline: false, lastSeenAt: createOffsetIso({ days: 1, hours: 2 }) },
            lisa: { id: 7006, displayName: "Lisa Thompson", phoneNumber: "2025550111", avatarColor: "#7c3aed", avatarUrl: ASSETS.lisa, isOnline: false, lastSeenAt: createOffsetIso({ days: 2, hours: 1 }) },
        };

        const messages = {
            [DEMO_IDS.sarah]: [
                makeTextMessage(900101, DEMO_IDS.sarah, "Hey! How are you?", { minutes: 62 }, false),
                makeTextMessage(900102, DEMO_IDS.sarah, "I'm great! Just finished the project presentation", { minutes: 60 }, true),
                makeTextMessage(900103, DEMO_IDS.sarah, "That's awesome! How did it go?", { minutes: 57 }, false),
                makeTextMessage(900104, DEMO_IDS.sarah, "Really well! The team loved it", { minutes: 52 }, true),
                makeTextMessage(900105, DEMO_IDS.sarah, "They want to implement it next quarter", { minutes: 51, seconds: 15 }, true),
                makeTextMessage(900106, DEMO_IDS.sarah, "Congratulations! That's amazing news", { minutes: 46 }, false, { reactions: ["\u2764\uFE0F", "\u{1F389}"] }),
                makeTextMessage(900107, DEMO_IDS.sarah, "Thanks! Want to celebrate tomorrow?", { minutes: 41 }, true),
                makeMediaMessage(900108, DEMO_IDS.sarah, "Check out this beautiful sunset from my office!", { minutes: 36 }, ASSETS.sunset),
                makeTextMessage(900109, DEMO_IDS.sarah, "Wow! That's stunning \u{1F60D}", { minutes: 31 }, true),
                makeTextMessage(900110, DEMO_IDS.sarah, "Absolutely! How about lunch at that new place?", { minutes: 12 }, false),
                makeTextMessage(900111, DEMO_IDS.sarah, "Perfect! 12:30 works for me", { minutes: 8 }, true),
                makeTextMessage(900112, DEMO_IDS.sarah, "See you tomorrow! \u{1F60A}", { minutes: 6 }, false),
            ],
            [DEMO_IDS.marcus]: [
                makeTextMessage(900201, DEMO_IDS.marcus, "Could you send me the latest report?", { minutes: 37 }, false),
                makeTextMessage(900202, DEMO_IDS.marcus, "Sure, I'll send it right away", { minutes: 34 }, true),
                makeTextMessage(900203, DEMO_IDS.marcus, "Thanks for the update", { minutes: 31 }, false),
            ],
            [DEMO_IDS.emily]: [makeTextMessage(900301, DEMO_IDS.emily, "Let me check and get back to you", { hours: 2 }, false)],
            [DEMO_IDS.design]: [makeTextMessage(900401, DEMO_IDS.design, "Alex: Perfect! ??", { hours: 4 }, false)],
            [DEMO_IDS.david]: [makeTextMessage(900501, DEMO_IDS.david, "Sounds good", { days: 1 }, false)],
            [DEMO_IDS.lisa]: [makeTextMessage(900601, DEMO_IDS.lisa, "Can we reschedule?", { days: 2 }, false)],
        };

        const chats = [
            { id: DEMO_IDS.sarah, isDemo: true, updatedAt: createOffsetIso({ minutes: 6 }), counterpart: users.sarah, lastMessage: messages[DEMO_IDS.sarah].at(-1), unreadCount: 2 },
            { id: DEMO_IDS.marcus, isDemo: true, updatedAt: createOffsetIso({ minutes: 31 }), counterpart: users.marcus, lastMessage: messages[DEMO_IDS.marcus].at(-1), unreadCount: 0 },
            { id: DEMO_IDS.emily, isDemo: true, updatedAt: createOffsetIso({ hours: 2 }), counterpart: users.emily, lastMessage: messages[DEMO_IDS.emily].at(-1), unreadCount: 0 },
            { id: DEMO_IDS.design, isDemo: true, updatedAt: createOffsetIso({ hours: 4 }), counterpart: users.design, lastMessage: messages[DEMO_IDS.design].at(-1), unreadCount: 5 },
            { id: DEMO_IDS.david, isDemo: true, updatedAt: createOffsetIso({ days: 1 }), counterpart: users.david, lastMessage: messages[DEMO_IDS.david].at(-1), unreadCount: 0 },
            { id: DEMO_IDS.lisa, isDemo: true, updatedAt: createOffsetIso({ days: 2 }), counterpart: users.lisa, lastMessage: messages[DEMO_IDS.lisa].at(-1), unreadCount: 0 },
        ];

        const statusPosts = [
            { id: 9901, text: "Story content would appear here", createdAt: createOffsetIso({ minutes: 31 }), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), viewed: false, user: { id: 7201, displayName: "Aadhitya", avatarColor: "#22c55e", avatarUrl: ASSETS.marcus } },
            { id: 9902, text: "Story content would appear here", createdAt: createOffsetIso({ minutes: 46 }), expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(), viewed: false, user: { id: 7202, displayName: "Shrinath", avatarColor: "#7c3aed", avatarUrl: ASSETS.david } },
            { id: 9903, text: "Story content would appear here", createdAt: createOffsetIso({ hours: 3 }), expiresAt: createOffsetIso({ minutes: 5 }), viewed: true, user: { id: 7203, displayName: "Sadhana", avatarColor: "#9ca3af", avatarUrl: ASSETS.emily } },
            { id: 9904, text: "Story content would appear here", createdAt: createOffsetIso({ hours: 5 }), expiresAt: createOffsetIso({ minutes: 10 }), viewed: true, user: { id: 7204, displayName: "Marcus", avatarColor: "#ef476f", avatarUrl: ASSETS.sarah } },
        ];

        const callHistory = [
            { id: 9801, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "completed", name: "M-Lidiya\u2728\u2764\uFE0F (2)", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ hours: 2 }) },
            { id: 9802, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "missed", name: "M-Lidiya\u2728\u2764\uFE0F", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ hours: 4 }) },
            { id: 9803, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "completed", name: "M-Lidiya\u2728\u2764\uFE0F (3)", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ hours: 6 }) },
            { id: 9804, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "completed", name: "M-Lidiya\u2728\u2764\uFE0F (6)", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ days: 1, hours: 1 }) },
            { id: 9805, chatId: DEMO_IDS.sarah, callType: "voice", direction: "incoming", outcome: "completed", name: "M-Lidiya\u2728\u2764\uFE0F", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ days: 1, hours: 3 }) },
            { id: 9806, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "missed", name: "M-Lidiya\u2728\u2764\uFE0F", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ days: 1, hours: 7 }) },
            { id: 9807, chatId: DEMO_IDS.sarah, callType: "video", direction: "incoming", outcome: "completed", name: "M-Lidiya\u2728\u2764\uFE0F (2)", phoneNumber: users.sarah.phoneNumber, avatarColor: "#ef476f", avatarUrl: ASSETS.sarah, createdAt: createOffsetIso({ days: 1, hours: 9 }) },
        ];

        return {
            me,
            chats,
            messages,
            statusPosts,
            callHistory,
            favorites: chats.map((chat) => String(chat.id)),
        };
    }

    function syncPreviewChrome() {
        const chatApp = document.getElementById("chat-app");
        if (chatApp) {
            chatApp.dataset.previewMode = "mobile";
            chatApp.dataset.sidebarView = chatApp.dataset.sidebarView || "chats";
            chatApp.dataset.activeScreen = chatApp.dataset.activeScreen || "list";
        }
        document.body.classList.add("wavechat-preview-active");
        try {
            localStorage.setItem("wavechat-favorite-contacts", JSON.stringify(preview.store?.favorites || []));
            localStorage.setItem("wavechat-call-history", JSON.stringify(preview.store?.callHistory || []));
        } catch (_error) {
            // Ignore storage failures in preview mode.
        }
    }

    function setActiveDemo(seedMe) {
        preview.active = true;
        if (!preview.store) {
            preview.store = createDemoStore(seedMe);
        } else if (seedMe) {
            preview.store.me = { ...preview.store.me, ...seedMe };
        }
        syncPreviewChrome();
        window.__waveDemo = preview;
    }

    function findChat(chatId) {
        return preview.store?.chats.find((chat) => Number(chat.id) === Number(chatId)) || null;
    }

    function getChatMessages(chatId) {
        if (!preview.store.messages[chatId]) {
            preview.store.messages[chatId] = [];
        }
        return preview.store.messages[chatId];
    }

    function syncChatMeta(chatId) {
        const chat = findChat(chatId);
        if (!chat) {
            return;
        }
        const messages = getChatMessages(chatId);
        chat.lastMessage = messages[messages.length - 1] || null;
        chat.updatedAt = chat.lastMessage?.createdAt || chat.updatedAt;
    }

    function findUserByPhone(phone) {
        const digits = normalizeDigits(phone);
        return preview.store?.chats.find((chat) => normalizeDigits(chat.counterpart?.phoneNumber).includes(digits))?.counterpart || null;
    }

    function findChatByPhone(phone) {
        const digits = normalizeDigits(phone);
        return preview.store?.chats.find((chat) => normalizeDigits(chat.counterpart?.phoneNumber).includes(digits)) || null;
    }

    function buildReply(chatId, sourceText, kind) {
        const chat = findChat(chatId);
        const baseReplies = {
            [DEMO_IDS.sarah]: "See you tomorrow! \u{1F60A}",
            [DEMO_IDS.marcus]: "Thanks for the update",
            [DEMO_IDS.emily]: "Let me check and get back to you",
            [DEMO_IDS.design]: "Alex: Perfect! ??",
            [DEMO_IDS.david]: "Sounds good",
            [DEMO_IDS.lisa]: "Can we reschedule?",
        };
        const text = kind === "media"
            ? "That looks great. Send me more details when you're free."
            : (baseReplies[chatId] || `Received: ${String(sourceText || "").slice(0, 30)}`);
        return {
            id: Date.now(),
            chatId,
            kind: "text",
            text,
            ciphertext: text,
            plain: { messageType: "text", text },
            createdAt: new Date().toISOString(),
            fromSelf: false,
            senderId: chat?.counterpart?.id || null,
            recipientId: preview.store?.me?.id || null,
            status: "delivered",
            deliveredAt: new Date().toISOString(),
            readAt: null,
        };
    }

    function makeDemoSocket() {
        const listeners = new Map();
        const socket = {
            connected: false,
            on(event, callback) {
                if (!listeners.has(event)) {
                    listeners.set(event, []);
                }
                listeners.get(event).push(callback);
                return socket;
            },
            emit(event, payload) {
                if (!preview.active) {
                    return socket;
                }
                if (event === "send_message" && payload?.chatId && findChat(payload.chatId)) {
                    const chat = findChat(payload.chatId);
                    const typingPayload = { chatId: chat.id, userId: chat.counterpart.id, isTyping: true };
                    trigger("typing", typingPayload);
                    window.setTimeout(() => trigger("typing", { ...typingPayload, isTyping: false }), 650);
                    window.setTimeout(() => {
                        const reply = buildReply(chat.id, payload.text, "text");
                        getChatMessages(chat.id).push(reply);
                        syncChatMeta(chat.id);
                        trigger("message:new", clone(reply));
                    }, 900);
                }
                if (event === "call:start" && payload?.chatId && findChat(payload.chatId)) {
                    const chat = findChat(payload.chatId);
                    window.setTimeout(() => trigger("call:outgoing", {
                        callId: payload.callId,
                        chatId: payload.chatId,
                        recipient: {
                            displayName: chat.counterpart.displayName,
                            avatarColor: chat.counterpart.avatarColor,
                        },
                    }), 240);
                }
                return socket;
            },
            connect() {
                window.setTimeout(() => {
                    socket.connected = true;
                    trigger("connect");
                    trigger("socket:ready");
                }, 30);
                return socket;
            },
            disconnect() {
                socket.connected = false;
                trigger("disconnect", "io client disconnect");
            },
            removeAllListeners() {
                listeners.clear();
            },
        };

        function trigger(event, data) {
            (listeners.get(event) || []).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(error);
                }
            });
        }

        preview.socket = socket;
        return socket;
    }

    if (preview.realIo) {
        window.io = function waveChatPreviewIo() {
            if (preview.active) {
                return makeDemoSocket();
            }
            return preview.realIo.apply(window, arguments);
        };
    }

    async function parseBody(input, init) {
        const body = init?.body;
        if (!body) {
            return {};
        }
        if (typeof body === "string") {
            try {
                return JSON.parse(body);
            } catch (_error) {
                return {};
            }
        }
        if (body instanceof FormData) {
            const data = {};
            body.forEach((value, key) => {
                data[key] = value;
            });
            return data;
        }
        return {};
    }

    async function fetchJsonResponse(input, init) {
        const response = await preview.realFetch(input, init);
        const text = await response.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (_error) {
            data = null;
        }
        return { response, data };
    }

    window.fetch = async function waveChatPreviewFetch(input, init) {
        const source = typeof input === "string" ? input : input?.url || "";
        const url = new URL(source, window.location.origin);
        const method = String(init?.method || input?.method || "GET").toUpperCase();

        if (url.pathname === "/api/bootstrap" && method === "GET") {
            const { response, data } = await fetchJsonResponse(input, init);
            const hasRealChats = Array.isArray(data?.chats) && data.chats.length > 0;
            if (preview.force || !hasRealChats) {
                setActiveDemo(data?.me);
                return jsonResponse({
                    ...(data || { ok: true }),
                    me: preview.store.me,
                    chats: clone(preview.store.chats),
                    callHistory: clone(preview.store.callHistory),
                    statusPosts: clone(preview.store.statusPosts),
                    socketToken: "wavechat-preview",
                }, 200);
            }
            return jsonResponse(data, response.status || 200);
        }

        if (!preview.active) {
            return preview.realFetch(input, init);
        }

        if (url.pathname === "/api/users/find" && method === "GET") {
            const user = findUserByPhone(url.searchParams.get("phone") || "");
            if (!user) {
                return jsonResponse({ ok: false, error: "No user found for that phone number." }, 404);
            }
            return jsonResponse({ ok: true, user: clone(user) }, 200);
        }

        if (url.pathname === "/api/chats" && method === "POST") {
            const body = await parseBody(input, init);
            const existing = findChatByPhone(body.phoneNumber || "");
            if (!existing) {
                return jsonResponse({ ok: false, error: "No user found for that phone number." }, 404);
            }
            return jsonResponse({ ok: true, chat: clone(existing) }, 200);
        }

        const messagesMatch = url.pathname.match(/^\/api\/chats\/(\d+)\/messages$/);
        if (messagesMatch && method === "GET") {
            const chatId = Number(messagesMatch[1]);
            if (findChat(chatId)) {
                return jsonResponse({ ok: true, hasMore: false, messages: clone(getChatMessages(chatId)) }, 200);
            }
        }

        const readMatch = url.pathname.match(/^\/api\/chats\/(\d+)\/read$/);
        if (readMatch && method === "POST") {
            return jsonResponse({ ok: true, readAt: new Date().toISOString() }, 200);
        }

        const deleteMatch = url.pathname.match(/^\/api\/chats\/(\d+)$/);
        if (deleteMatch && method === "DELETE") {
            const chatId = Number(deleteMatch[1]);
            preview.store.chats = preview.store.chats.filter((chat) => Number(chat.id) !== chatId);
            delete preview.store.messages[chatId];
            preview.store.favorites = preview.store.favorites.filter((id) => Number(id) !== chatId);
            return jsonResponse({ ok: true }, 200);
        }

        if (url.pathname === "/api/messages/text" && method === "POST") {
            const body = await parseBody(input, init);
            const chatId = Number(body.chatId);
            const message = makeTextMessage(Date.now(), chatId, String(body.text || ""), {}, true);
            getChatMessages(chatId).push(message);
            syncChatMeta(chatId);
            window.setTimeout(() => {
                const reply = buildReply(chatId, body.text, "text");
                getChatMessages(chatId).push(reply);
                syncChatMeta(chatId);
            }, 900);
            return jsonResponse({ ok: true, message }, 200);
        }

        if (url.pathname === "/api/messages/media" && method === "POST") {
            const body = await parseBody(input, init);
            const chatId = Number(body.chatId);
            const file = body.file;
            const mediaUrl = file instanceof File ? URL.createObjectURL(file) : ASSETS.sunset;
            const message = {
                id: Date.now(),
                chatId,
                kind: "media",
                caption: String(body.caption || ""),
                mimeType: body.mimeType || file?.type || "image/jpeg",
                fileName: body.fileName || file?.name || "attachment",
                fileSize: file?.size || 120000,
                mediaUrl,
                plain: {
                    messageType: "media",
                    caption: String(body.caption || ""),
                    mimeType: body.mimeType || file?.type || "image/jpeg",
                    fileName: body.fileName || file?.name || "attachment",
                    fileSize: file?.size || 120000,
                },
                createdAt: new Date().toISOString(),
                fromSelf: true,
                senderId: preview.store.me.id,
                recipientId: findChat(chatId)?.counterpart?.id || null,
                status: "read",
                deliveredAt: new Date().toISOString(),
                readAt: new Date().toISOString(),
            };
            getChatMessages(chatId).push(message);
            syncChatMeta(chatId);
            window.setTimeout(() => {
                const reply = buildReply(chatId, body.caption || body.fileName || "media", "media");
                getChatMessages(chatId).push(reply);
                syncChatMeta(chatId);
            }, 900);
            return jsonResponse({ ok: true, message }, 200);
        }

        if (url.pathname === "/api/status" && method === "POST") {
            const body = await parseBody(input, init);
            const status = {
                id: Date.now(),
                text: String(body.text || body.caption || "Story content would appear here"),
                createdAt: new Date().toISOString(),
                viewed: false,
                isOwn: true,
                user: {
                    id: preview.store.me.id,
                    displayName: preview.store.me.displayName,
                    avatarColor: preview.store.me.avatarColor,
                    avatarUrl: preview.store.me.avatarUrl,
                },
            };
            preview.store.statusPosts.unshift(status);
            return jsonResponse({ ok: true, status }, 200);
        }

        return preview.realFetch(input, init);
    };

    function getAvatarEntry(name) {
        const normalized = String(name || "")
            .replace(/\s*\([^)]*\)\s*/g, "")
            .replace(/'s Story$/i, "")
            .trim()
            .toLowerCase();
        const map = {
            "sarah chen": { url: ASSETS.sarah, color: "#ef476f" },
            "marcus johnson": { url: ASSETS.marcus, color: "#25a18e" },
            "emily rodriguez": { url: ASSETS.emily, color: "#5f6df6" },
            "design team": { url: ASSETS.design, color: "#111827" },
            "david kim": { url: ASSETS.david, color: "#475569" },
            "lisa thompson": { url: ASSETS.lisa, color: "#7c3aed" },
            "aadhitya": { url: ASSETS.marcus, color: "#22c55e" },
            "shrinath": { url: ASSETS.david, color: "#7c3aed" },
            "sadhana": { url: ASSETS.emily, color: "#9ca3af" },
            "marcus": { url: ASSETS.sarah, color: "#ef476f" },
            "m-lidiya\u2728\u2764\uFE0F": { url: ASSETS.sarah, color: "#ef476f" },
            "my story": { url: preview.store?.me?.avatarUrl || ASSETS.me, color: preview.store?.me?.avatarColor || "#d63145" },
            "you": { url: preview.store?.me?.avatarUrl || ASSETS.me, color: preview.store?.me?.avatarColor || "#d63145" },
            "ukaenthiran": { url: preview.store?.me?.avatarUrl || ASSETS.me, color: preview.store?.me?.avatarColor || "#d63145" },
        };
        return map[normalized] || null;
    }

    function applyPhoto(el, name) {
        if (!el) {
            return;
        }
        const avatar = getAvatarEntry(name);
        if (!avatar) {
            return;
        }
        el.classList.add("has-photo");
        el.style.background = avatar.color;
        el.style.backgroundImage = `url("${avatar.url}")`;
        el.textContent = "";
    }

    function hydrateAvatars() {
        document.querySelectorAll(".chat-item").forEach((item) => {
            const name = item.querySelector(".chat-item-title strong")?.textContent || "";
            applyPhoto(item.querySelector(".chat-avatar-wrap .avatar"), name);
        });
        applyPhoto(document.getElementById("self-avatar"), preview.store?.me?.displayName || "You");
        applyPhoto(document.getElementById("profile-panel-avatar"), preview.store?.me?.displayName || "You");
        applyPhoto(document.getElementById("conversation-avatar"), document.getElementById("conversation-title")?.textContent || "");
        applyPhoto(document.getElementById("call-menu-avatar"), document.getElementById("conversation-title")?.textContent || "");
        applyPhoto(document.getElementById("call-avatar"), document.getElementById("call-name")?.textContent || "");

        document.querySelectorAll(".message-row.other .message-side-avatar").forEach((avatar) => {
            applyPhoto(avatar, document.getElementById("conversation-title")?.textContent || "");
        });

        document.querySelectorAll(".status-my-avatar").forEach((avatar) => {
            applyPhoto(avatar, "My Story");
        });
        document.querySelectorAll(".mobile-story-row, .status-history-item").forEach((row) => {
            const name = row.querySelector("strong")?.textContent || "";
            applyPhoto(row.querySelector(".status-history-avatar"), name);
        });

        document.querySelectorAll(".call-history-row").forEach((row) => {
            const name = row.querySelector("strong")?.textContent || "";
            applyPhoto(row.querySelector(".call-history-avatar"), name);
            if (row.querySelector(".call-direction.missed")) {
                row.classList.add("is-missed");
            }
        });

        document.querySelectorAll(".call-contact-row, .favorite-add-row, .call-schedule-contact, .favorite-card").forEach((row) => {
            const name = row.querySelector("strong, .favorite-name, .favorite-add-name, span:last-child")?.textContent || "";
            applyPhoto(row.querySelector(".avatar"), name);
        });

        const storyViewer = document.querySelector(".story-viewer");
        if (storyViewer && !storyViewer.classList.contains("hidden")) {
            const title = storyViewer.querySelector(".story-viewer-title")?.textContent || "";
            applyPhoto(storyViewer.querySelector(".story-viewer-avatar"), title);
            const body = storyViewer.querySelector(".story-viewer-body");
            if (body && !body.querySelector("img, video, .wave-story-placeholder")) {
                body.innerHTML = `
                    <div class="wave-story-placeholder">
                        <div class="wave-story-icon">&#128247;</div>
                        <h3>${title}'s Story</h3>
                        <p>Story content would appear here</p>
                    </div>
                `;
            }
        }
    }

    function ensureObserver() {
        if (preview.observer) {
            return;
        }
        preview.observer = new MutationObserver(() => {
            if (!preview.active) {
                return;
            }
            hydrateAvatars();
        });
        preview.observer.observe(document.body, { childList: true, subtree: true });
    }

    if (preview.force) {
        setActiveDemo();
    }

    document.addEventListener("DOMContentLoaded", () => {
        ensureObserver();
        if (preview.active) {
            hydrateAvatars();
        }
    });
})();





