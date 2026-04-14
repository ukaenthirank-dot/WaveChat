const refs = {
  chatApp: document.getElementById("chat-app"),
  chatList: document.getElementById("chat-list"),
  chatSearch: document.getElementById("chat-search"),
  conversation: document.getElementById("conversation"),
  conversationTitle: document.getElementById("conversation-title"),
  conversationStatus: document.getElementById("conversation-status"),
  conversationAvatar: document.getElementById("conversation-avatar"),
  messages: document.getElementById("messages"),
  messagesScroller: document.getElementById("messages-scroller"),
  composer: document.getElementById("composer"),
  messageInput: document.getElementById("message-input"),
  attachmentButton: document.getElementById("attachment-btn"),
  fileInput: document.getElementById("file-input"),
  cameraInput: document.getElementById("camera-input"),
  statusFileInput: document.getElementById("status-file-input"),
  mobileBackBtn: document.getElementById("mobile-back-btn"),
  chatInfoBtn: document.getElementById("chat-info-btn"),
  chatMenu: document.getElementById("chat-menu"),
  mobileNavButtons: document.querySelectorAll("#mobile-bottom-nav [data-mobile-tab]"),
  sidebarTitle: document.getElementById("sidebar-title"),
  profilePhotoInput: document.getElementById("profile-photo-input"),
  chatsNavBadge: document.getElementById("chats-nav-badge"),
  statusNavBadge: document.getElementById("status-nav-badge"),
  callsNavBadge: document.getElementById("calls-nav-badge"),
  storyViewer: document.getElementById("story-viewer"),
  storyViewerClose: document.getElementById("story-viewer-close"),
  storyViewerAvatar: document.getElementById("story-viewer-avatar"),
  storyViewerTitle: document.getElementById("story-viewer-title"),
  storyViewerMeta: document.getElementById("story-viewer-meta"),
  storyViewerBody: document.getElementById("story-viewer-body"),
  storyReplyInput: document.getElementById("story-reply-input"),
  storySheet: document.getElementById("story-sheet"),
  storySheetBackdrop: document.getElementById("story-sheet-backdrop"),
  storySheetClose: document.getElementById("story-sheet-close"),
  storySheetActions: document.querySelectorAll(".story-sheet-action"),
  captureModal: document.getElementById("capture-modal"),
  captureStage: document.getElementById("capture-stage"),
  captureLive: document.getElementById("capture-live"),
  capturePhotoPreview: document.getElementById("capture-photo-preview"),
  captureVideoPreview: document.getElementById("capture-video-preview"),
  captureEmpty: document.getElementById("capture-empty"),
  captureFilterRail: document.getElementById("capture-filter-rail"),
  capturePhotoBtn: document.getElementById("capture-photo-btn"),
  captureVideoBtn: document.getElementById("capture-video-btn"),
  captureRecordBtn: document.getElementById("capture-record-btn"),
  captureUseBtn: document.getElementById("capture-use-btn"),
  captureCloseBtn: document.getElementById("capture-close-btn"),
  captureSwitchBtn: document.getElementById("capture-switch-btn"),
  captureDemoPill: document.getElementById("capture-demo-pill"),
  captureStatus: document.getElementById("capture-status"),
  callModalRoot: document.getElementById("call-modal-root"),
  voiceCallButton: document.getElementById("voice-call-btn"),
  videoCallButton: document.getElementById("video-call-btn"),
};

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";

const state = {
  screen: "chats",
  previousScreen: "chats",
  sidebarView: "chats",
  listTheme: "light",
  activeChatId: null,
  me: null,
  chats: [],
  messagesByChat: {},
  statuses: [],
  callLogs: [],
  useDemoData: true,
  cameraMode: "photo",
  cameraFilter: "cat-ears",
  cameraRecording: false,
  cameraStream: null,
  pollTimer: null,
  callModalState: {
    callType: "video",
    reminder: "15 minutes before",
    startDate: new Date(),
    startTime: "5:30 PM",
    endTime: "6:00 PM",
    participants: [],
  },
};

const demoData = {
  chats: [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lastMessage: "See you tomorrow! \\uD83D\\uDE0A",
      timestamp: minutesAgo(6),
      unreadCount: 0,
      online: true,
    },
    {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      lastMessage: "Thanks for the update",
      timestamp: minutesAgo(31),
      unreadCount: 0,
      online: true,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      lastMessage: "Let me check and get back to you",
      timestamp: hoursAgo(2),
      unreadCount: 0,
    },
    {
      id: "4",
      name: "Design Team",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",
      lastMessage: "Alex: Perfect! \\uD83D\\uDC4D",
      timestamp: hoursAgo(4),
      unreadCount: 0,
    },
    {
      id: "5",
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      lastMessage: "Sounds good",
      timestamp: daysAgo(1),
      unreadCount: 0,
    },
    {
      id: "6",
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      lastMessage: "Can we reschedule?",
      timestamp: daysAgo(2),
      unreadCount: 0,
    },
  ],
  messages: {
    "1": [
      {
        id: "1",
        text: "Hey! How are you?",
        sender: "other",
        timestamp: minutesAgo(60),
      },
      {
        id: "2",
        text: "I'm great! Just finished the project presentation",
        sender: "me",
        timestamp: minutesAgo(58),
        status: "read",
      },
      {
        id: "3",
        text: "That's awesome! How did it go?",
        sender: "other",
        timestamp: minutesAgo(55),
      },
      {
        id: "4",
        text: "Really well! The team loved it",
        sender: "me",
        timestamp: minutesAgo(50),
        status: "read",
      },
      {
        id: "5",
        text: "They want to implement it next quarter",
        sender: "me",
        timestamp: minutesAgo(50, 1),
        status: "read",
      },
      {
        id: "6",
        text: "Congratulations! That's amazing news \\uD83C\\uDF89",
        sender: "other",
        timestamp: minutesAgo(45),
        reactions: ["\\u2764\\uFE0F", "\\uD83C\\uDF89"],
      },
      {
        id: "7",
        text: "Thanks! Want to celebrate tomorrow?",
        sender: "me",
        timestamp: minutesAgo(40),
        status: "read",
      },
      {
        id: "8",
        text: "Check out this beautiful sunset from my office!",
        sender: "other",
        timestamp: minutesAgo(35),
        media: {
          type: "image",
          url: "https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?auto=format&fit=crop&w=1080&q=80",
        },
      },
      {
        id: "9",
        text: "Wow! That's stunning \\uD83D\\uDE0D",
        sender: "me",
        timestamp: minutesAgo(30),
        status: "read",
      },
      {
        id: "10",
        text: "Absolutely! How about lunch at that new place?",
        sender: "other",
        timestamp: minutesAgo(10),
      },
      {
        id: "11",
        text: "Perfect! 12:30 works for me",
        sender: "me",
        timestamp: minutesAgo(6),
        status: "read",
      },
      {
        id: "12",
        text: "See you tomorrow! \\uD83D\\uDE0A",
        sender: "other",
        timestamp: minutesAgo(5),
      },
    ],
  },
  statuses: [],
  callLogs: [
    {
      id: "1",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: hoursAgo(2),
      type: "incoming",
      callType: "video",
      count: 2,
    },
    {
      id: "2",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: hoursAgo(4),
      type: "missed",
      callType: "video",
      count: 0,
    },
    {
      id: "3",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: hoursAgo(6),
      type: "incoming",
      callType: "video",
      count: 3,
    },
    {
      id: "4",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: daysAgo(1),
      type: "incoming",
      callType: "video",
      count: 6,
    },
    {
      id: "5",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: daysAgo(1, 2),
      type: "incoming",
      callType: "voice",
      count: 0,
    },
    {
      id: "6",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: daysAgo(1, 6),
      type: "missed",
      callType: "video",
      count: 0,
    },
    {
      id: "7",
      name: "M-Lidiya\\u2728\\u2764\\uFE0F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      timestamp: daysAgo(1, 8),
      type: "incoming",
      callType: "video",
      count: 2,
    },
  ],
};

const cameraFilters = [
  { id: "cat-ears", label: "Cat Ears", icon: "🐱", filter: "none", gradient: "linear-gradient(135deg,#6f6f6f,#333333)", overlay: "cat-ears" },
  { id: "owl", label: "Owl", icon: "🦉", filter: "none", gradient: "linear-gradient(135deg,#5f5f5f,#2b2b2b)" },
  { id: "hearts", label: "Hearts", icon: "😍", filter: "none", gradient: "linear-gradient(135deg,#7a7a7a,#3a3a3a)" },
  { id: "glasses", label: "Shades", icon: "😎", filter: "none", gradient: "linear-gradient(135deg,#6a6a6a,#2e2e2e)" },
  { id: "cat-stache", label: "Cat Stache", icon: "😼", filter: "none", gradient: "linear-gradient(135deg,#686868,#2f2f2f)", overlay: "cat-stache" },
];

  const callQuickActions = [
  { id: "call", label: "Call", icon: "\\u260E" },
  { id: "schedule", label: "Schedule", icon: "\\uD83D\\uDCC5" },
  { id: "keypad", label: "Keypad", icon: "\\u25A3" },
  { id: "favorites", label: "Favorites", icon: "\\u2665" },
];

function minutesAgo(minutes, extraSeconds = 0) {
  const now = Date.now();
  return new Date(now - minutes * 60000 - extraSeconds * 1000);
}

function hoursAgo(hours, extraHours = 0) {
  const now = Date.now();
  return new Date(now - (hours + extraHours) * 3600000);
}

function daysAgo(days, extraHours = 0) {
  const now = Date.now();
  return new Date(now - days * 86400000 - extraHours * 3600000);
}

function escapeHtml(value) {
  let text = String(value ?? "");
  text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRelativeTime(date) {
  if (!date) return "";
  const delta = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 60) return `${minutes || 1}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d`;
}

function formatClockTime(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDayLabel() {
  return "Today";
}

function setDataset(target, key, value) {
  if (!target) return;
  target.dataset[key] = value;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 6) return phone || "";
  return `${String(phone).slice(0, 3)}****${digits.slice(-2)}`;
}

function formatLastSeen(lastSeenAt) {
  if (!lastSeenAt) return "Just now";
  const date = new Date(lastSeenAt);
  if (Number.isNaN(date.getTime())) return "Just now";
  return `Today, ${formatClockTime(date)}`;
}

function getInitials(name) {
  const safe = String(name || "").trim();
  if (!safe) return "U";
  return safe.split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase();
}

function renderProfile() {
  if (!state.me) return;
  const name = state.me.displayName || "User";
  const phone = maskPhone(state.me.phoneNumber || "");
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const avatarColor = state.me.avatarColor || "#ff1f36";
  let storedPhoto = "";
  try {
    storedPhoto = localStorage.getItem("wavechat-profile-photo") || "";
  } catch (_error) {
    storedPhoto = "";
  }
  state.me._displayAvatar = storedPhoto
    ? { type: "photo", value: storedPhoto }
    : { type: "initials", value: initial, color: avatarColor };
  state.me._displayPhone = phone;
}

function openInfoModal(title, body) {
  if (!refs.callModalRoot) return;
  refs.callModalRoot.classList.remove("hidden");
  refs.callModalRoot.setAttribute("aria-hidden", "false");
  refs.callModalRoot.innerHTML = `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>${escapeHtml(title)}</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body">
          <p>${escapeHtml(body)}</p>
        </div>
      </div>
    </div>
  `;
}

function openContactProfile(chat) {
  if (!refs.callModalRoot || !chat) return;
  const name = chat.name || "Contact";
  const phone = chat.phoneNumber ? maskPhone(chat.phoneNumber) : "Private";
  const avatar = chat.avatar
    ? `<div class="contact-profile-avatar has-image" style="background-image:url('${escapeHtml(chat.avatar)}')"></div>`
    : `<div class="contact-profile-avatar">${escapeHtml(getInitials(name))}</div>`;
  refs.callModalRoot.classList.remove("hidden");
  refs.callModalRoot.setAttribute("aria-hidden", "false");
  refs.callModalRoot.innerHTML = `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card contact-profile-card">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>Profile</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body contact-profile-body">
          ${avatar}
          <strong class="contact-profile-name">${escapeHtml(name)}</strong>
          <span class="contact-profile-phone">${escapeHtml(phone)}</span>
          <div class="contact-profile-meta">
            <div><span>Status</span><strong>${chat.online ? "Online" : "Offline"}</strong></div>
            <div><span>Last seen</span><strong>${escapeHtml(formatLastSeen(chat.lastSeenAt))}</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfileScreen() {
  if (!refs.chatList) return;
  const name = state.me?.displayName || "User";
  const phone = maskPhone(state.me?.phoneNumber || "");
  let storedPhoto = "";
  try {
    storedPhoto = localStorage.getItem("wavechat-profile-photo") || "";
  } catch (_error) {
    storedPhoto = "";
  }
  const avatarHtml = storedPhoto
    ? `<div class="profile-screen-avatar has-image" style="background-image:url('${storedPhoto}')"></div>`
    : `<div class="profile-screen-avatar">${escapeHtml(getInitials(name))}</div>`;
  refs.chatList.innerHTML = `
    <div class="profile-screen">
      <div class="profile-screen-card">
        ${avatarHtml}
        <strong class="profile-screen-name">${escapeHtml(name)}</strong>
        <span class="profile-screen-phone">${escapeHtml(phone)}</span>
      </div>
      <div class="profile-screen-details">
        <div class="profile-screen-row"><span>Login</span><strong>${escapeHtml("WaveChat Web")}</strong></div>
        <div class="profile-screen-row"><span>Status</span><strong>${escapeHtml(state.me?.isOnline ? "Online" : "Offline")}</strong></div>
        <div class="profile-screen-row"><span>Last seen</span><strong>${escapeHtml(formatLastSeen(state.me?.lastSeenAt))}</strong></div>
      </div>
      <div class="profile-screen-actions">
        <button class="primary-btn" id="profile-logout-btn" type="button">Log out</button>
      </div>
    </div>
  `;
  document.getElementById("profile-logout-btn")?.addEventListener("click", logout);
}

function applyScreenState() {
  setDataset(refs.chatApp, "activeScreen", state.screen === "chatDetail" ? "conversation" : "list");
  setDataset(refs.chatApp, "sidebarView", state.sidebarView);
  setDataset(refs.chatApp, "listTheme", state.listTheme);
  refs.mobileNavButtons.forEach((btn) => {
    const tab = btn.dataset.mobileTab;
    const active = state.screen === "chatDetail" ? "chats" : state.screen;
    const isActive = tab === active;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setSidebarTitle(text) {
  if (refs.sidebarTitle) refs.sidebarTitle.textContent = "";
}

function setScreen(nextScreen) {
  state.previousScreen = state.screen;
  state.screen = nextScreen;
  state.sidebarView = nextScreen === "chatDetail" ? "chats" : nextScreen;
  applyScreenState();
  if (nextScreen === "chats") {
    renderChatList();
  } else if (nextScreen === "status") {
    renderStatusList();
  } else if (nextScreen === "profile") {
    renderProfileScreen();
  } else if (nextScreen === "calls") {
    renderCallsScreen();
  } else if (nextScreen === "camera") {
    renderChatList();
    openCameraModal();
  } else if (nextScreen === "chatDetail") {
    renderConversation();
  }
}

function updateBadges() {
  if (refs.chatsNavBadge) refs.chatsNavBadge.style.display = "none";
  if (refs.statusNavBadge) refs.statusNavBadge.style.display = "none";
  if (refs.callsNavBadge) refs.callsNavBadge.style.display = "none";
}

function renderChatList() {
  if (!refs.chatList) return;
  const query = (refs.chatSearch?.value || "").trim().toLowerCase();
  const items = state.chats.filter((chat) => chat.name.toLowerCase().includes(query));
  refs.chatList.innerHTML = items
    .map((chat) => {
      const time = formatRelativeTime(chat.timestamp);
      const online = chat.online;
      const initials = getInitials(chat.name);
      const hasAvatar = Boolean(chat.avatar);
      return `
        <button class="chat-item" data-chat-id="${escapeHtml(chat.id)}" type="button">
          <div class="chat-avatar-wrap">
            <div class="avatar ${hasAvatar ? "has-image" : ""}" style="${hasAvatar ? `background-image:url('${escapeHtml(chat.avatar)}')` : `background-color:#ff1f36;` }">${hasAvatar ? "" : escapeHtml(initials)}</div>
            ${online ? `<span class="chat-avatar-status"></span>` : ""}
          </div>
          <div class="chat-item-content">
            <div class="chat-item-row">
              <div class="chat-item-title"><strong>${escapeHtml(chat.name)}</strong></div>
              <span class="chat-item-time">${escapeHtml(time)}</span>
            </div>
            <div class="chat-item-row">
              <span class="chat-preview">${escapeHtml(chat.lastMessage || "")}</span>
              <div class="chat-item-meta">
                ${online ? `<span class="presence-dot online"></span>` : `<span class="presence-dot"></span>`}
              </div>
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderConversation() {
  const chat = state.chats.find((item) => item.id === state.activeChatId) || state.chats[0];
  if (!chat) return;
  state.activeChatId = chat.id;
  if (refs.conversationTitle) refs.conversationTitle.textContent = chat.name;
  if (refs.conversationStatus) refs.conversationStatus.textContent = chat.online ? "Online" : "Offline";
  if (refs.conversationAvatar) {
    if (chat.avatar) {
      refs.conversationAvatar.style.backgroundImage = `url('${chat.avatar}')`;
      refs.conversationAvatar.textContent = "";
    } else {
      refs.conversationAvatar.style.backgroundImage = "";
      refs.conversationAvatar.style.backgroundColor = "#ff1f36";
      refs.conversationAvatar.textContent = getInitials(chat.name);
    }
  }

  const messages = state.messagesByChat[chat.id] || [];
  const dayLabel = formatDayLabel();
  const messageHtml = messages
    .map((message) => {
      const side = message.sender === "me" ? "self" : "other";
      const time = formatClockTime(message.timestamp);
      const reactions = message.reactions?.length
        ? `<div class="message-reactions">${message.reactions.map((r) => escapeHtml(r)).join("")}</div>`
        : "";
      const media = message.media?.url
        ? `<img class="message-image" src="${escapeHtml(message.media.url)}" alt="Media">`
        : "";
      const receipt = message.sender === "me"
        ? `<span class="message-receipt ${message.status === "read" ? "is-read" : ""}">&#10003;&#10003;</span>`
        : "";
      return `
        <div class="message-row ${side}">
          ${side === "other" ? `<div class="message-side-slot"><div class="avatar message-side-avatar" style="background-image:url('${escapeHtml(chat.avatar)}')"></div></div>` : ""}
          <div class="message-bubble">
            ${media}
            <p class="message-text">${escapeHtml(message.text || "")}</p>
            <div class="message-meta">
              <span>${escapeHtml(time)}</span>
              ${receipt}
            </div>
            ${reactions}
          </div>
        </div>
      `;
    })
    .join("");

  refs.messages.innerHTML = `
    <div class="message-day-separator">${escapeHtml(dayLabel)}</div>
    ${messageHtml}
  `;
  setTimeout(() => {
    if (refs.messagesScroller) {
      refs.messagesScroller.scrollTop = refs.messagesScroller.scrollHeight;
    }
  }, 50);
}

function mapChatFromApi(chat) {
  const avatar = chat.counterpart?.avatarUrl || chat.counterpart?.avatar_url || "";
  return {
    id: String(chat.id),
    name: chat.title || chat.counterpart?.displayName || "Contact",
    avatar: avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    phoneNumber: chat.counterpart?.phoneNumber || chat.counterpart?.phone || "",
    lastSeenAt: chat.counterpart?.lastSeenAt || chat.counterpart?.last_seen_at || null,
    lastMessage: chat.lastMessage?.plain?.text || "",
    timestamp: chat.updatedAt,
    unreadCount: chat.unreadCount || 0,
    online: true,
  };
}

async function refreshBootstrapList() {
  if (state.useDemoData) return;
  try {
    const response = await fetch("/api/bootstrap", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.chats) && data.chats.length) {
      state.chats = data.chats.map(mapChatFromApi);
    }
    if (Array.isArray(data.callHistory) && data.callHistory.length) {
      state.callLogs = data.callHistory.map(mapCallLog);
    }
    if (Array.isArray(data.statusPosts) && data.statusPosts.length) {
      state.statuses = data.statusPosts.map(mapStatusPost);
    }
    updateBadges();
    if (state.screen === "chats") renderChatList();
  } catch (_error) {
    // ignore refresh failures
  }
}

function renderStatusList() {
  if (!refs.chatList) return;
  const myStatus = state.statuses.find((status) => status.isOwn);
  const recent = state.statuses.filter((status) => !status.isOwn && !status.viewed);
  const viewed = state.statuses.filter((status) => !status.isOwn && status.viewed);

  const hasAny = Boolean(myStatus || recent.length || viewed.length);
  if (!hasAny) {
    refs.chatList.innerHTML = `
      <div class="status-section">
        <div class="status-section-title">Stories</div>
        <p class="status-empty">No stories yet.</p>
      </div>
    `;
    return;
  }

  refs.chatList.innerHTML = `
    ${myStatus ? `
      <div class="status-my-story">
        <button class="status-my-row" type="button" data-story-action="add">
          <div class="story-avatar-wrap">
            <div class="avatar status-history-avatar" style="background-image:url('${escapeHtml(myStatus.avatar)}')"></div>
            <span class="status-plus">+</span>
          </div>
          <div class="status-my-copy">
            <strong>My Story</strong>
            <span>Tap to add story</span>
          </div>
        </button>
      </div>
    ` : ""}
    <div class="status-section">
      <div class="status-section-title">Recent stories</div>
      ${recent.map((status) => buildStoryRow(status, false)).join("")}
      <div class="status-section-title">Viewed stories</div>
      ${viewed.map((status) => buildStoryRow(status, true)).join("")}
    </div>
  `;
}

function buildStoryRow(status, viewed) {
  const time = formatRelativeTime(status.timestamp);
  return `
    <button class="mobile-story-row" type="button" data-story-id="${escapeHtml(status.id)}">
      <div class="story-avatar-wrap ${viewed ? "viewed" : "fresh"}">
        <div class="avatar status-history-avatar" style="background-image:url('${escapeHtml(status.avatar)}')"></div>
      </div>
      <div class="status-history-copy">
        <strong>${escapeHtml(status.name)}</strong>
        <span>${escapeHtml(time)}</span>
      </div>
    </button>
  `;
}

function renderCallsScreen() {
  if (!refs.chatList) return;
  refs.chatList.innerHTML = `
    <div class="call-history-block">
      <h3 class="call-history-header">Recent</h3>
      <div class="call-history-list">
        ${state.callLogs.map(buildCallRow).join("")}
      </div>
    </div>
  `;
}

function buildCallRow(call) {
  const time = formatRelativeTime(call.timestamp);
  const directionClass = call.type || "incoming";
  const count = call.count ? `(${call.count})` : "";
  const callIcon = call.callType === "video"
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5L22 18V6z" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1 .3 2 .5 3 .5.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.3 21.2 2.8 13.7 2.8 4.4 2.8 3.7 3.3 3.2 4 3.2h3.2c.7 0 1.2.5 1.2 1.2 0 1 .2 2 .5 3 .1.4 0 .9-.3 1.2l-2 2.2z" fill="currentColor"/></svg>`;
  return `
    <div class="call-history-row">
      <div class="avatar call-history-avatar" style="background-image:url('${escapeHtml(call.avatar)}')"></div>
      <div class="call-history-info">
        <div class="call-history-top">
          <strong>${escapeHtml(call.name)} ${escapeHtml(count)}</strong>
        </div>
        <div class="call-history-meta">
          <span class="call-direction ${escapeHtml(directionClass)}">${escapeHtml(time)}</span>
        </div>
      </div>
      <button class="call-history-call-btn" type="button" data-call-type="${escapeHtml(call.callType || "voice")}" data-call-name="${escapeHtml(call.name)}">${callIcon}</button>
    </div>
  `;
}

function openStoryViewer(status) {
  if (!refs.storyViewer) return;
  refs.storyViewer.classList.remove("hidden");
  refs.storyViewer.setAttribute("aria-hidden", "false");
  refs.storyViewerTitle.textContent = status.name;
  refs.storyViewerMeta.textContent = formatRelativeTime(status.timestamp);
  refs.storyViewerAvatar.style.backgroundImage = `url('${status.avatar}')`;
  refs.storyViewerBody.innerHTML = status.mediaUrl
    ? `<img class="story-viewer-media" src="${escapeHtml(status.mediaUrl)}" alt="Story">`
    : `<div class="story-viewer-media"></div>`;
}

function closeStoryViewer() {
  if (!refs.storyViewer) return;
  refs.storyViewer.classList.add("hidden");
  refs.storyViewer.setAttribute("aria-hidden", "true");
}

function openStorySheet() {
  if (!refs.storySheet) return;
  refs.storySheet.classList.remove("hidden");
  refs.storySheet.setAttribute("aria-hidden", "false");
}

function closeStorySheet() {
  if (!refs.storySheet) return;
  refs.storySheet.classList.add("hidden");
  refs.storySheet.setAttribute("aria-hidden", "true");
}

function renderFilterRail() {
  if (!refs.captureFilterRail) return;
  if (!cameraFilters.length) {
    refs.captureFilterRail.innerHTML = "";
    refs.captureFilterRail.classList.add("hidden");
    return;
  }
  refs.captureFilterRail.classList.remove("hidden");
  refs.captureFilterRail.innerHTML = cameraFilters
    .map((filter) => {
      const active = filter.id === state.cameraFilter ? "active" : "";
      return `
        <button type="button" class="capture-filter-btn ${active}" data-filter-id="${filter.id}">
          <span class="filter-emoji">${escapeHtml(filter.icon)}</span>
        </button>
      `;
    })
    .join("");
}

function applyCameraFilter(filterId) {
  if (!cameraFilters.length) {
    state.cameraFilter = "none";
    if (refs.captureStage) refs.captureStage.style.background = "#000000";
    if (refs.captureLive) refs.captureLive.style.filter = "none";
    if (refs.capturePhotoPreview) refs.capturePhotoPreview.style.filter = "none";
    if (document.getElementById("capture-filter-overlay")) {
      document.getElementById("capture-filter-overlay").className = "capture-filter-overlay";
    }
    renderFilterRail();
    return;
  }
  const nextFilter = cameraFilters.find((filter) => filter.id === filterId) || cameraFilters[0];
  state.cameraFilter = nextFilter.id;
  if (refs.captureStage) refs.captureStage.style.background = nextFilter.gradient;
  if (refs.captureLive) refs.captureLive.style.filter = nextFilter.filter;
  if (refs.capturePhotoPreview) refs.capturePhotoPreview.style.filter = nextFilter.filter;
  const overlay = document.getElementById("capture-filter-overlay");
  if (overlay) {
    overlay.className = "capture-filter-overlay";
    if (nextFilter.overlay) {
      overlay.classList.add(`filter-${nextFilter.overlay}`);
    }
  }
  renderFilterRail();
}

async function openCameraModal() {
  if (!refs.captureModal) return;
  renderFilterRail();
  applyCameraFilter(state.cameraFilter);
  refs.capturePhotoBtn.classList.toggle("active", state.cameraMode === "photo");
  refs.captureVideoBtn.classList.toggle("active", state.cameraMode === "video");
  try {
    if (refs.captureModal.showModal) {
      refs.captureModal.showModal();
    } else {
      refs.captureModal.setAttribute("open", "true");
    }
  } catch (error) {
    refs.captureModal.setAttribute("open", "true");
  }
  await startCameraStream();
}

function closeCameraModal() {
  if (!refs.captureModal) return;
  if (refs.captureModal.open) refs.captureModal.close();
  stopCameraStream();
  if (state.previousScreen !== "camera") {
    setScreen(state.previousScreen || "chats");
  } else {
    setScreen("chats");
  }
}

async function startCameraStream() {
  if (!refs.captureLive || !navigator.mediaDevices?.getUserMedia) {
    showCameraFallback();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    state.cameraStream = stream;
    refs.captureLive.srcObject = stream;
    refs.captureLive.classList.remove("hidden");
    refs.captureEmpty.classList.add("hidden");
  } catch (error) {
    showCameraFallback();
  }
}

function stopCameraStream() {
  if (!state.cameraStream) return;
  state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
}

function showCameraFallback() {
  if (!refs.captureEmpty) return;
  refs.captureEmpty.classList.remove("hidden");
  refs.captureLive?.classList.add("hidden");
  refs.captureEmpty.innerHTML = `
    <div>
      <h3>Camera unavailable</h3>
      <p>Use your device camera to take a photo or video.</p>
      <button type="button" class="primary-btn" id="capture-fallback-btn">Use device camera</button>
    </div>
  `;
  const fallbackBtn = document.getElementById("capture-fallback-btn");
  fallbackBtn?.addEventListener("click", () => {
    refs.cameraInput?.click();
  });
}

function toggleCameraMode(mode) {
  state.cameraMode = mode;
  refs.capturePhotoBtn.classList.toggle("active", mode === "photo");
  refs.captureVideoBtn.classList.toggle("active", mode === "video");
  refs.captureRecordBtn.classList.toggle("recording", false);
  state.cameraRecording = false;
  refs.captureUseBtn.setAttribute("disabled", "true");
  refs.captureStatus.textContent = mode === "photo" ? "Demo Mode" : "Video ready";
}

function captureAction() {
  if (state.cameraMode === "photo") {
    if (refs.capturePhotoPreview) {
      refs.capturePhotoPreview.classList.remove("hidden");
    }
    refs.captureUseBtn.removeAttribute("disabled");
    refs.captureStatus.textContent = "Photo ready to send";
  } else {
    state.cameraRecording = !state.cameraRecording;
    refs.captureRecordBtn.classList.toggle("recording", state.cameraRecording);
    refs.captureUseBtn.removeAttribute("disabled");
    refs.captureStatus.textContent = state.cameraRecording ? "Recording..." : "Video ready";
  }
}

function openCallModal(type) {
  if (!refs.callModalRoot) return;
  refs.callModalRoot.classList.remove("hidden");
  refs.callModalRoot.setAttribute("aria-hidden", "false");
  if (type === "schedule") {
    refs.callModalRoot.innerHTML = buildScheduleModal();
  } else if (type === "keypad") {
    refs.callModalRoot.innerHTML = buildKeypadModal();
  } else if (type === "favorites") {
    refs.callModalRoot.innerHTML = buildFavoritesModal();
  } else if (type === "participants") {
    refs.callModalRoot.innerHTML = buildContactsModal();
  } else if (type === "reminder") {
    refs.callModalRoot.innerHTML = buildReminderModal();
  } else if (type === "callType") {
    refs.callModalRoot.innerHTML = buildCallTypeModal();
  } else if (type === "activeCall") {
    refs.callModalRoot.innerHTML = buildActiveCallModal();
  } else {
    refs.callModalRoot.innerHTML = buildContactsModal();
  }
}

function buildActiveCallModal(callType = "voice", name = "") {
  const contactName = name || state.chats.find((chat) => chat.id === state.activeChatId)?.name || "Contact";
  const typeLabel = callType === "video" ? "Video Call" : "Voice Call";
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card call-modal-active">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>${escapeHtml(typeLabel)}</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body call-modal-active-body">
          <div class="call-active-avatar">${escapeHtml(contactName.charAt(0).toUpperCase())}</div>
          <strong class="call-active-name">${escapeHtml(contactName)}</strong>
          <span class="call-active-status">Calling...</span>
        </div>
        <div class="call-modal-footer">
          <button class="call-cut-btn" type="button" data-modal-close aria-label="End call">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.5 15.5c0 .6-.5 1.1-1.1 1.1h-2.7c-.5 0-1-.3-1.2-.8l-.7-1.8c-1 .4-2 .6-3.1.6-1 0-2.1-.2-3.1-.6l-.7 1.8c-.2.5-.7.8-1.2.8H3.6c-.6 0-1.1-.5-1.1-1.1v-2c0-.4.2-.8.5-1 1.3-.9 3.5-1.9 5.9-1.9h6.2c2.4 0 4.6 1 5.9 1.9.3.2.5.6.5 1v2z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function closeCallModal() {
  if (!refs.callModalRoot) return;
  refs.callModalRoot.classList.add("hidden");
  refs.callModalRoot.setAttribute("aria-hidden", "true");
  refs.callModalRoot.innerHTML = "";
}

function buildScheduleModal() {
  const dateLabel = state.callModalState.startDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card call-modal-schedule">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>Schedule call</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body">
          <div class="call-field">
            <span>Ukaenthiran's call</span>
            <input type="text" value="Description (Optional)" readonly>
          </div>
          <div class="call-field call-field-row">
            <div>
              <span>${escapeHtml(dateLabel)}</span>
              <input type="text" value="${escapeHtml(state.callModalState.startTime)}" readonly data-modal-action="date">
            </div>
            <div>
              <span>${escapeHtml(dateLabel)}</span>
              <input type="text" value="${escapeHtml(state.callModalState.endTime)}" readonly data-modal-action="time">
            </div>
          </div>
          <div class="call-field">
            <span>Remove end time</span>
            <input type="text" value="" readonly>
          </div>
          <div class="call-field">
            <span>Call type</span>
            <input type="text" value="${escapeHtml(capitalize(state.callModalState.callType))}" readonly data-modal-action="callType">
          </div>
          <div class="call-field">
            <span>Reminder</span>
            <input type="text" value="${escapeHtml(state.callModalState.reminder)}" readonly data-modal-action="reminder">
          </div>
          <div class="call-field">
            <span>Participants</span>
            <input type="text" value="${state.callModalState.participants.length ? `${state.callModalState.participants.length} selected` : "Tap to add participants"}" readonly data-modal-action="participants">
          </div>
        </div>
        <div class="call-modal-footer">
          <button class="primary-btn" type="button" data-modal-close data-schedule-submit></button>
        </div>
      </div>
    </div>
  `;
}

function buildCallTypeModal() {
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>Select Call Type</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body">
          <button class="call-modal-quick-item" type="button" data-select-call-type="voice">
            <div class="call-modal-quick-icon">&#9742;</div>
            Voice Call
          </button>
          <button class="call-modal-quick-item" type="button" data-select-call-type="video">
            <div class="call-modal-quick-icon">&#9654;</div>
            Video Call
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildReminderModal() {
  const reminders = [
    "At time of event",
    "5 minutes before",
    "15 minutes before",
    "30 minutes before",
    "1 hour before",
    "1 day before",
  ];
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>Select Reminder</h2>
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
        </header>
        <div class="call-modal-body">
          ${reminders
            .map(
              (item) => `
                <button class="call-modal-quick-item" type="button" data-select-reminder="${escapeHtml(item)}">
                  ${escapeHtml(item)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function buildContactsModal() {
  const contacts = state.chats;
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&times;</button>
          <h2>Select Contacts</h2>
          <button class="call-modal-icon" type="button" data-modal-close data-contacts-done>Done (${state.callModalState.participants.length})</button>
        </header>
        <div class="call-modal-body">
          <div class="call-modal-hint">Tap to add participants</div>
          ${contacts
            .map((contact) => {
              const checked = state.callModalState.participants.includes(contact.id);
              return `
                <button class="call-contact-row" type="button" data-select-contact="${escapeHtml(contact.id)}">
                  <div class="avatar call-history-avatar" style="background-image:url('${escapeHtml(contact.avatar)}')"></div>
                  <div class="call-history-info">
                    <div class="call-history-top"><strong>${escapeHtml(contact.name)}</strong></div>
                  </div>
                  <span class="call-contact-radio" style="${checked ? "border-color: var(--wave-red); background: var(--wave-red);" : ""}"></span>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function buildKeypadModal() {
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card call-modal-keypad">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&#8592;</button>
          <h2>Keypad</h2>
          <button class="call-modal-icon" type="button" data-modal-close>+</button>
        </header>
        <div class="call-modal-body keypad-body">
          <div class="keypad-display"></div>
          <div class="keypad-match"></div>
          <div class="keypad-grid">
            ${buildKeypadButtons().join("")}
          </div>
          <div class="keypad-actions">
            <button class="keypad-action" type="button">&#9003;</button>
            <button class="keypad-action primary" type="button">&#9742;</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildKeypadButtons() {
  const keys = [
    ["1", ""],
    ["2", "ABC"],
    ["3", "DEF"],
    ["4", "GHI"],
    ["5", "JKL"],
    ["6", "MNO"],
    ["7", "PQRS"],
    ["8", "TUV"],
    ["9", "WXYZ"],
    ["*", ""],
    ["0", "+"],
    ["#", ""],
  ];
  return keys.map(
    ([digit, letters]) => `
      <button class="keypad-key" type="button">
        <strong>${digit}</strong>
        <small>${letters}</small>
      </button>
    `
  );
}

function buildFavoritesModal() {
  const favorites = state.chats.slice(0, 6);
  return `
    <div class="call-modal-overlay" data-modal-overlay>
      <div class="call-modal-card call-modal-favorites">
        <header class="call-modal-header">
          <button class="call-modal-icon" type="button" data-modal-close>&#8592;</button>
          <h2>Favorites</h2>
          <button class="call-modal-icon" type="button" data-modal-close>+</button>
        </header>
        <div class="call-modal-body">
          <div class="favorite-grid">
            ${favorites
              .map(
                (contact) => `
                  <div class="favorite-card">
                    <div class="favorite-avatar-wrap">
                      <div class="avatar call-history-avatar" style="background-image:url('${escapeHtml(contact.avatar)}')"></div>
                    </div>
                    <strong>${escapeHtml(contact.name.split(" ")[0])}</strong>
                    <div class="favorite-actions">
                      <button type="button" class="favorite-call-btn">&#9742;</button>
                      <button type="button" class="favorite-call-btn">&#9654;</button>
                    </div>
                  </div>
                `
              )
              .join("")}
            <div class="favorite-card add-card">
              <div class="favorite-add">+</div>
              <strong>Add</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

async function loadBootstrap() {
  try {
    const response = await fetch("/api/bootstrap", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Bootstrap failed");
    const data = await response.json();
    if (data.me) {
      state.me = data.me;
      renderProfile();
    }
    if (Array.isArray(data.chats) && data.chats.length) {
      state.useDemoData = false;
      state.chats = data.chats.map(mapChatFromApi);
      state.callLogs = Array.isArray(data.callHistory) && data.callHistory.length ? data.callHistory.map(mapCallLog) : demoData.callLogs;
      state.statuses = Array.isArray(data.statusPosts) && data.statusPosts.length ? data.statusPosts.map(mapStatusPost) : demoData.statuses;
      await loadMessagesForChat(state.chats[0]?.id);
      return;
    }
  } catch (error) {
    state.useDemoData = true;
  }

  state.chats = demoData.chats;
  state.messagesByChat = demoData.messages;
  state.statuses = [];
  state.callLogs = demoData.callLogs;
  state.me = {
    displayName: "User",
    phoneNumber: "+1 0000000000",
    avatarColor: "#ff1f36",
    isOnline: true,
    lastSeenAt: null,
  };
  renderProfile();
}

function mapCallLog(log) {
  return {
    id: String(log.id),
    name: log.name || "Contact",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    timestamp: log.createdAt,
    type: log.outcome === "missed" ? "missed" : log.direction || "incoming",
    callType: log.callType || "voice",
    count: log.count || 0,
  };
}

function mapStatusPost(post) {
  return {
    id: String(post.id),
    name: post.user?.displayName || "Contact",
    avatar: post.user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    timestamp: post.createdAt,
    viewed: false,
    isOwn: post.isOwn,
    mediaUrl: post.mediaUrl,
    mediaType: post.mimeType?.startsWith("video") ? "video" : "image",
  };
}

async function loadMessagesForChat(chatId) {
  if (!chatId || state.useDemoData) return;
  try {
    const response = await fetch(`/api/chats/${chatId}/messages`, { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.messages)) return;
    state.messagesByChat[chatId] = data.messages.map((message) => ({
      id: String(message.id),
      text: message.plain?.text || "",
      sender: message.fromSelf ? "me" : "other",
      timestamp: message.createdAt,
      status: message.status,
      media: message.mediaUrl ? { type: "image", url: message.mediaUrl } : null,
    }));
    const lastMessage = data.messages[data.messages.length - 1];
    const chat = state.chats.find((item) => item.id === chatId);
    if (chat && lastMessage) {
      chat.lastMessage = lastMessage.plain?.text || "";
      chat.timestamp = lastMessage.createdAt;
      chat.unreadCount = 0;
    }
  } catch (error) {
    state.messagesByChat[chatId] = state.messagesByChat[chatId] || [];
  }
}

async function sendMessage(text) {
  if (!text || !state.activeChatId) return;
  const payload = {
    chatId: Number(state.activeChatId),
    clientMessageId: `local-${Date.now()}`,
    text,
  };
  try {
    await fetch("/api/messages/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // keep local bubble even if send fails
  }
}

function appendLocalMessage(text) {
  const chatId = state.activeChatId;
  if (!chatId) return;
  const message = {
    id: `local-${Date.now()}`,
    text,
    sender: "me",
    timestamp: new Date(),
    status: "read",
  };
  if (!state.messagesByChat[chatId]) state.messagesByChat[chatId] = [];
  state.messagesByChat[chatId].push(message);
  const chat = state.chats.find((item) => item.id === chatId);
  if (chat) {
    chat.lastMessage = text;
    chat.timestamp = message.timestamp;
    chat.unreadCount = 0;
    state.chats = [chat, ...state.chats.filter((item) => item.id !== chatId)];
  }
  updateBadges();
  if (state.screen === "chats") renderChatList();
  renderConversation();
}

function toggleChatMenu() {
  if (!refs.chatMenu) return;
  refs.chatMenu.classList.toggle("hidden");
}

function closeChatMenu() {
  if (!refs.chatMenu) return;
  refs.chatMenu.classList.add("hidden");
}

function handleChatMenuAction(action) {
  if (!action) return;
  if (action === "mute") {
    openInfoModal("Muted", "Notifications for this chat are muted.");
    return;
  }
  if (action === "profile") {
    const chat = state.chats.find((item) => item.id === state.activeChatId);
    openContactProfile(chat);
    return;
  }
  if (action === "delete") {
    if (!state.activeChatId) return;
    state.chats = state.chats.filter((chat) => chat.id !== state.activeChatId);
    delete state.messagesByChat[state.activeChatId];
    state.activeChatId = state.chats[0]?.id || null;
    setScreen("chats");
    updateBadges();
    renderChatList();
    return;
  }
  if (action === "clear") {
    if (!state.activeChatId) return;
    state.messagesByChat[state.activeChatId] = [];
    renderConversation();
    return;
  }
}


async function logout() {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      headers: { "X-CSRFToken": csrfToken },
      credentials: "same-origin",
    });
  } catch (_error) {
    // ignore
  }
  try {
    localStorage.removeItem("wavechat-profile-photo");
    localStorage.removeItem("wavechat-profile-name");
  } catch (_error) {
    // ignore
  }
  window.location.href = "/login";
}

function bindEvents() {
  refs.mobileNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.mobileTab;
      if (!tab) return;
      if (tab === "chats") setScreen("chats");
      if (tab === "status") setScreen("status");
      if (tab === "profile") setScreen("profile");
      if (tab === "camera") setScreen("camera");
      if (tab === "calls") setScreen("calls");
    });
  });

  refs.chatSearch?.addEventListener("input", () => {
    if (state.screen === "chats") renderChatList();
  });

  refs.chatList?.addEventListener("click", (event) => {
    const callButton = event.target.closest(".call-history-call-btn");
    if (callButton) {
      const callType = callButton.dataset.callType || "voice";
      const callName = callButton.dataset.callName || "";
      refs.callModalRoot.classList.remove("hidden");
      refs.callModalRoot.setAttribute("aria-hidden", "false");
      refs.callModalRoot.innerHTML = buildActiveCallModal(callType, callName);
      setTimeout(() => {
        const status = refs.callModalRoot.querySelector(".call-active-status");
        if (status) status.textContent = "Connected";
      }, 1200);
      return;
    }
    const target = event.target.closest("[data-chat-id], [data-story-id], [data-story-action], [data-call-action]");
    if (!target) return;
    if (target.dataset.chatId) {
      state.activeChatId = target.dataset.chatId;
      const activeChat = state.chats.find((chat) => chat.id === state.activeChatId);
      if (activeChat) {
        activeChat.unreadCount = 0;
      }
      updateBadges();
      if (state.screen === "chats") renderChatList();
      setScreen("chatDetail");
      renderConversation();
      loadMessagesForChat(state.activeChatId).then(() => {
        renderConversation();
      });
    } else if (target.dataset.storyId) {
      const status = state.statuses.find((item) => item.id === target.dataset.storyId);
      if (status) openStoryViewer(status);
    } else if (target.dataset.storyAction === "add") {
      openStorySheet();
    } else if (target.dataset.callAction) {
      const action = target.dataset.callAction;
      if (action === "schedule") openCallModal("schedule");
      else if (action === "keypad") openCallModal("keypad");
      else if (action === "favorites") openCallModal("favorites");
      else openCallModal("contacts");
    }
  });

  refs.mobileBackBtn?.addEventListener("click", () => {
    setScreen("chats");
  });

  refs.chatInfoBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleChatMenu();
  });

  refs.chatMenu?.addEventListener("click", (event) => {
    const item = event.target.closest("[data-chat-menu-action]");
    if (!item) return;
    handleChatMenuAction(item.dataset.chatMenuAction);
    closeChatMenu();
  });

  document.addEventListener("click", () => {
    closeChatMenu();
  });

  refs.storyViewerClose?.addEventListener("click", closeStoryViewer);
  refs.storySheetBackdrop?.addEventListener("click", closeStorySheet);
  refs.storySheetClose?.addEventListener("click", closeStorySheet);
  refs.storySheetActions?.forEach((action) => {
    action.addEventListener("click", () => {
      closeStorySheet();
      openCameraModal();
    });
  });

  refs.captureCloseBtn?.addEventListener("click", closeCameraModal);
  refs.capturePhotoBtn?.addEventListener("click", () => toggleCameraMode("photo"));
  refs.captureVideoBtn?.addEventListener("click", () => toggleCameraMode("video"));
  refs.captureRecordBtn?.addEventListener("click", captureAction);
  refs.captureUseBtn?.addEventListener("click", () => {
    closeCameraModal();
  });
  refs.captureFilterRail?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-id]");
    if (!button) return;
    applyCameraFilter(button.dataset.filterId);
  });

  // Profile panel removed from header
  refs.profilePhotoInput?.addEventListener("change", () => {
    const file = refs.profilePhotoInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem("wavechat-profile-photo", String(reader.result || ""));
      } catch (_error) {
        // ignore
      }
      renderProfile();
      if (state.screen === "profile") renderProfileScreen();
    };
    reader.readAsDataURL(file);
  });

  refs.composer?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = refs.messageInput.value.trim();
    if (!text) return;
    refs.messageInput.value = "";
    appendLocalMessage(text);
    sendMessage(text);
  });

  refs.attachmentButton?.addEventListener("click", () => {
    refs.fileInput?.click();
  });

  refs.fileInput?.addEventListener("change", () => {
    if (!refs.fileInput.files?.length) return;
    appendLocalMessage("Sent a document");
    refs.fileInput.value = "";
  });

  refs.voiceCallButton?.addEventListener("click", () => {
    const name = state.chats.find((chat) => chat.id === state.activeChatId)?.name || "";
    if (!refs.callModalRoot) return;
    refs.callModalRoot.classList.remove("hidden");
    refs.callModalRoot.setAttribute("aria-hidden", "false");
    refs.callModalRoot.innerHTML = buildActiveCallModal("voice", name);
    setTimeout(() => {
      const status = refs.callModalRoot.querySelector(".call-active-status");
      if (status) status.textContent = "Connected";
    }, 1200);
  });
  refs.videoCallButton?.addEventListener("click", () => {
    const name = state.chats.find((chat) => chat.id === state.activeChatId)?.name || "";
    if (!refs.callModalRoot) return;
    refs.callModalRoot.classList.remove("hidden");
    refs.callModalRoot.setAttribute("aria-hidden", "false");
    refs.callModalRoot.innerHTML = buildActiveCallModal("video", name);
    setTimeout(() => {
      const status = refs.callModalRoot.querySelector(".call-active-status");
      if (status) status.textContent = "Connected";
    }, 1200);
  });

  refs.callModalRoot?.addEventListener("click", (event) => {
    const overlay = event.target.closest("[data-modal-overlay]");
    const closeBtn = event.target.closest("[data-modal-close]");
    if (overlay && event.target === overlay) closeCallModal();
    if (closeBtn) closeCallModal();
    const selectContact = event.target.closest("[data-select-contact]");
    if (selectContact) {
      const id = selectContact.dataset.selectContact;
      if (!id) return;
      if (state.callModalState.participants.includes(id)) {
        state.callModalState.participants = state.callModalState.participants.filter((pid) => pid !== id);
      } else {
        state.callModalState.participants.push(id);
      }
      openCallModal("participants");
    }
    const selectReminder = event.target.closest("[data-select-reminder]");
    if (selectReminder) {
      state.callModalState.reminder = selectReminder.dataset.selectReminder;
      openCallModal("schedule");
    }
    const selectCallType = event.target.closest("[data-select-call-type]");
    if (selectCallType) {
      state.callModalState.callType = selectCallType.dataset.selectCallType;
      openCallModal("schedule");
    }
    const scheduleAction = event.target.closest("[data-modal-action]");
    if (scheduleAction) {
      const action = scheduleAction.dataset.modalAction;
      if (action === "callType") openCallModal("callType");
      if (action === "reminder") openCallModal("reminder");
      if (action === "participants") openCallModal("participants");
    }
  });
}

function startRealtimePolling() {
  if (state.pollTimer) return;
  state.pollTimer = window.setInterval(() => {
    if (state.activeChatId) {
      loadMessagesForChat(state.activeChatId).then(() => {
        if (state.screen === "chatDetail") renderConversation();
      });
    }
    if (state.screen === "chats") {
      refreshBootstrapList();
    }
  }, 2500);
}

async function init() {
  document.body.classList.add("wavechat-preview-active");
  applyScreenState();
  await loadBootstrap();
  state.activeChatId = state.chats[0]?.id || null;
  applyScreenState();
  updateBadges();
  renderChatList();
  bindEvents();
  startRealtimePolling();
}

init();
