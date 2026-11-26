const USER_TOKEN_KEY = "arcan_user_token";
const ADMIN_TOKEN_KEY = "arcan_admin_token";
const NAME_CHANGE_PRICE_USD = 5.0;

const DEFAULT_LEVELS = [
  { index: 0, name: "Bronce", slug: "bronze", icon: "🥉", min: 0 },
  { index: 1, name: "Hierro", slug: "iron", icon: "🛡️", min: 50 },
  { index: 2, name: "Plata", slug: "silver", icon: "⚔️", min: 100 },
  { index: 3, name: "Oro", slug: "gold", icon: "👑", min: 150 },
  { index: 4, name: "Esmeralda", slug: "emerald", icon: "❇️", min: 200 },
  { index: 5, name: "Diamante", slug: "diamond", icon: "💎", min: 250 },
  { index: 6, name: "Rubí", slug: "ruby", icon: "❤️‍🔥", min: 300 }
];

const App = {
  state: null,
  levels: DEFAULT_LEVELS,
  currentUser: null,
  userToken: localStorage.getItem(USER_TOKEN_KEY) || null,
  adminToken: sessionStorage.getItem(ADMIN_TOKEN_KEY) || null,
  adminTab: "games",
  selectedAdminGameId: null,
  adminOrders: [],
  adminNameChanges: [],
  adminPromos: [],
  pendingGameId: null,

  /* WebSocket en tiempo real */
  ws: null,
  wsStatus: "connecting",
  wsReconnectTimer: null,
  wsPingTimer: null,
  wsBackoffMs: 1200,

  /* Notificaciones */
  notifications: [],
  unreadCount: 0,

  /* Chat de soporte IA */
  supportChat: {
    open: false,
    sending: false,
    messages: [
      {
        role: "assistant",
        content: "¡Hola! Soy el asistente de soporte de ArcanStore 🤖. Pregúntame sobre precios, tasa del día, métodos de pago, niveles o cómo hacer tu recarga."
      }
    ]
  },

  /* Noticias, comentarios y perfiles públicos */
  newsList: [],
  newsEmojis: ["🔥", "❤️", "🎮", "😮", "👍", "😂"],
  commentEmojis: ["❤️", "🔥", "😂", "😮", "👍"],
  openNewsComments: {},
  newsCommentsCache: {},
  replyState: {},
  publicUsers: [],

  /* Editor de noticias en Admin */
  newsEditor: {
    id: null,
    title: "",
    tag: "Anuncio",
    content: "",
    image_url: "",
    pinned: false,
    saving: false
  },

  /* Formulario de nuevo código de descuento / referido en Admin */
  promoForm: {
    code: "",
    owner_name: "",
    discount_type: "percent",
    discount_value: 0,
    max_uses: "",
    saving: false
  },

  /* Perfil propio */
  profileData: {
    requests: [],
    uploadingAvatar: false,
    savingProfile: false
  },

  /* Recortador de avatar con zoom y arrastre */
  cropper: {
    img: null,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    baseScale: 1,
    dragging: false,
    startX: 0,
    startY: 0,
    saving: false,
    bound: false
  },

  /* Modal de cambio de nombre ($5 USD) */
  nameChange: {
    newName: "",
    paymentId: null,
    reference: "",
    receiptBlob: null,
    receiptPreviewUrl: "",
    submitting: false,
    lastRequest: null
  },

  checkout: {
    gameId: null,
    step: 1,
    playerId: "",
    zoneId: "",
    nickname: "",
    confirmedId: false,
    packageId: null,
    paymentId: null,
    promoInput: "",
    appliedPromo: null,
    checkingPromo: false,
    reference: "",
    receiptBlob: null,
    receiptPreviewUrl: "",
    submitting: false,
    lastOrder: null
  },

  async init() {
    this.bindCropperEvents();
    this.renderSupportMessages();
    await Promise.all([this.loadStore(), this.restoreUserSession(), this.loadPublicUsers()]);
    this.applyAppearance();
    this.updateAuthButton();
    this.updateNotifUI();
    this.renderStore();

    if (this.currentUser && this.userToken) {
      this.loadNotifications();
    }
    this.connectWebSocket();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        this.connectWebSocket();
      }
    });

    // Abrir noticia compartida si el enlace trae ?news=ID
    const sharedNewsId = new URLSearchParams(window.location.search).get("news");
    if (sharedNewsId) {
      this.openSharedNews(sharedNewsId);
    }
  },

  async openSharedNews(newsId) {
    this.switchView("news");
    await this.loadNews(false);
    setTimeout(() => {
      const el = document.getElementById(`news-card-${newsId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("flash-highlight");
        setTimeout(() => el.classList.remove("flash-highlight"), 2500);
      }
    }, 180);
  },

  async api(endpoint, { method = "GET", body = null, token = null, isForm = false } = {}) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body && !isForm) headers["Content-Type"] = "application/json";

    const res = await fetch(`/api/${endpoint}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Error de conexión con el servidor.");
    return data;
  },

  async loadStore() {
    try {
      const data = await this.api("bootstrap");
      this.state = data;
      if (Array.isArray(data.levels) && data.levels.length) {
        this.levels = data.levels;
      }
      if (!this.selectedAdminGameId && this.state.games.length) {
        this.selectedAdminGameId = this.state.games[0].id;
      }
    } catch (err) {
      this.toast(err.message);
    }
  },

  async restoreUserSession() {
    if (!this.userToken) return;
    try {
      const data = await this.api("auth/me", { token: this.userToken });
      this.currentUser = data.user;
    } catch {
      this.userToken = null;
      this.currentUser = null;
      localStorage.removeItem(USER_TOKEN_KEY);
    }
  },

  async loadPublicUsers() {
    try {
      const data = await this.api("users/public");
      this.publicUsers = data.users || [];
    } catch {
      this.publicUsers = [];
    }
  },

  esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  imgFallback(img, label) {
    img.onerror = null;
    const text = encodeURIComponent((label || "ARCAN").slice(0, 14));
    img.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230f172a'/><stop offset='100%' stop-color='%231e1b4b'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' fill='%2300e5ff' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  },

  /* ================= NIVELES, INSIGNIAS Y MARCOS DE AVATAR ================= */
  getLevelInfo(levelIndex = 0) {
    const idx = Math.max(0, Math.min(this.levels.length - 1, Number(levelIndex || 0)));
    return this.levels[idx] || DEFAULT_LEVELS[0];
  },

  renderLevelBadge(levelIndex = 0, compact = false) {
    const lvl = this.getLevelInfo(levelIndex);
    return `<span class="level-badge level-${lvl.slug} ${compact ? "level-badge-sm" : ""}">${lvl.icon} ${this.esc(lvl.name)}</span>`;
  },

  renderAvatar(url, name, sizeClass = "avatar-md", levelIndex = null) {
    const initial = this.esc((name || "?").trim().charAt(0).toUpperCase() || "?");
    const inner = url
      ? `<img class="avatar ${sizeClass}" src="${this.esc(url)}" alt="${this.esc(name)}" onerror="this.outerHTML='<div class=\\'avatar avatar-fallback ${sizeClass}\\'>${initial}</div>'" />`
      : `<div class="avatar avatar-fallback ${sizeClass}">${initial}</div>`;

    if (levelIndex === null || levelIndex === undefined) {
      return inner;
    }

    const lvl = this.getLevelInfo(levelIndex);
    return `<span class="avatar-frame frame-${lvl.slug} frame-${sizeClass}" title="Nivel ${this.esc(lvl.name)}">${inner}</span>`;
  },

  toast(msg) {
    const container = document.getElementById("toast-container");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  },

  formatUsd(n) { return `$${Number(n || 0).toFixed(2)}`; },

  formatBs(usd) {
    const total = Number(usd || 0) * Number(this.state?.config?.bsRate || 1);
    return `${total.toFixed(2)} Bs`;
  },

  formatDate(iso) {
    try { return new Date(iso).toLocaleString("es-VE"); } catch { return iso; }
  },

  formatBirthday(bday) {
    if (!bday || !/^\d{4}-\d{2}-\d{2}$/.test(bday)) return "";
    const [y, m, d] = bday.split("-").map(Number);
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${d} de ${months[m - 1] || m} (${y})`;
  },

  calculateAgeLocal(bday) {
    if (!bday || !/^\d{4}-\d{2}-\d{2}$/.test(bday)) return "";
    const [y, m, d] = bday.split("-").map(Number);
    const now = new Date();
    let age = now.getFullYear() - y;
    const md = (now.getMonth() + 1) - m;
    if (md < 0 || (md === 0 && now.getDate() < d)) age--;
    return age >= 10 && age <= 120 ? age : "";
  },

  /* ================= CHAT FLOTANTE CON IA DE SOPORTE ================= */
  toggleSupportChat() {
    this.supportChat.open = !this.supportChat.open;
    const widget = document.getElementById("support-chat-widget");
    const fab = document.getElementById("support-fab");
    if (widget) widget.classList.toggle("open", this.supportChat.open);
    if (fab) fab.classList.toggle("active", this.supportChat.open);

    if (this.supportChat.open) {
      this.renderSupportMessages();
      setTimeout(() => document.getElementById("support-chat-input")?.focus(), 120);
    }
  },

  formatSupportMessage(text) {
    return this.esc(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="support-link">$1</a>')
      .replace(/\n/g, "<br>");
  },

  renderSupportMessages() {
    const box = document.getElementById("support-chat-messages");
    if (!box) return;

    const bubbles = this.supportChat.messages.map(m => `
      <div class="support-msg ${m.role === "user" ? "support-msg-user" : "support-msg-bot"}">
        <div class="support-bubble">${this.formatSupportMessage(m.content)}</div>
      </div>
    `).join("");

    const typingHtml = this.supportChat.sending
      ? `<div class="support-msg support-msg-bot"><div class="support-bubble support-typing">Escribiendo...</div></div>`
      : "";

    box.innerHTML = bubbles + typingHtml;
    box.scrollTop = box.scrollHeight;
  },

  sendQuickSupport(text) {
    if (this.supportChat.sending) return;
    const input = document.getElementById("support-chat-input");
    if (input) input.value = text;
    this.sendSupportMessage();
  },

  async sendSupportMessage(e = null) {
    if (e) e.preventDefault();
    if (this.supportChat.sending) return;

    const input = document.getElementById("support-chat-input");
    const sendBtn = document.getElementById("support-chat-send");
    const message = (input?.value || "").trim();
    if (!message) return;

    const historyToSend = this.supportChat.messages.slice(-8);
    this.supportChat.messages.push({ role: "user", content: message });
    if (input) input.value = "";
    this.supportChat.sending = true;
    if (sendBtn) sendBtn.disabled = true;
    this.renderSupportMessages();

    try {
      const { reply } = await this.api("support/chat", {
        method: "POST",
        body: { message, history: historyToSend }
      });
      this.supportChat.messages.push({
        role: "assistant",
        content: reply || "No recibí respuesta en este momento. Intenta de nuevo."
      });
    } catch (err) {
      this.supportChat.messages.push({
        role: "assistant",
        content: `Hubo un error conectando con soporte (${err.message}). Puedes escribirnos directo por WhatsApp.`
      });
    } finally {
      this.supportChat.sending = false;
      if (sendBtn) sendBtn.disabled = false;
      this.renderSupportMessages();
    }
  },

  /* ================= WEBSOCKET EN TIEMPO REAL ================= */
  setWsStatus(status) {
    this.wsStatus = status;
    const pill = document.getElementById("ws-status");
    if (!pill) return;
    pill.className = `ws-pill ws-${status}`;
    pill.textContent =
      status === "online" ? "● En vivo" :
      status === "connecting" ? "● Conectando..." :
      "● Reconectando...";
  },

  connectWebSocket() {
    clearTimeout(this.wsReconnectTimer);
    clearInterval(this.wsPingTimer);

    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.setWsStatus("connecting");

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const qs = this.userToken ? `?token=${encodeURIComponent(this.userToken)}` : "";
    const url = `${proto}//${window.location.host}/api/ws${qs}`;

    try {
      const socket = new WebSocket(url);
      this.ws = socket;

      socket.onopen = () => {
        this.wsBackoffMs = 1200;
        this.setWsStatus("online");
        this.wsPingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try { this.ws.send("ping"); } catch {}
          }
        }, 25000);
      };

      socket.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          this.handleRealtimeEvent(event);
        } catch {}
      };

      socket.onerror = () => {
        try { socket.close(); } catch {}
      };

      socket.onclose = () => {
        clearInterval(this.wsPingTimer);
        this.setWsStatus("offline");
        const wait = Math.min(this.wsBackoffMs, 15000);
        this.wsBackoffMs = Math.round(wait * 1.6);
        this.wsReconnectTimer = setTimeout(() => this.connectWebSocket(), wait);
      };
    } catch {
      this.setWsStatus("offline");
    }
  },

  handleRealtimeEvent(ev) {
    if (!ev || !ev.type || ev.type === "pong") return;

    if (ev.type === "news_reaction") {
      const item = this.newsList.find(n => n.id === ev.newsId);
      if (!item || !ev.counts) return;
      for (const emoji of this.newsEmojis) {
        if (!item.reactions[emoji]) item.reactions[emoji] = { count: 0, reacted: false };
        if (ev.counts[emoji] !== undefined) item.reactions[emoji].count = Number(ev.counts[emoji]);
      }
      const box = document.getElementById(`news-reactions-${ev.newsId}`);
      if (box) box.innerHTML = this.renderNewsReactionsHtml(item);
      return;
    }

    if (ev.type === "comment_created") {
      const { newsId, comment } = ev;
      if (!comment) return;
      const item = this.newsList.find(n => n.id === newsId);

      if (this.newsCommentsCache[newsId]) {
        const exists = this.newsCommentsCache[newsId].some(c => c.id === comment.id);
        if (!exists) {
          this.newsCommentsCache[newsId].push(comment);
          if (item) item.comments_count = this.newsCommentsCache[newsId].length;
        }
      } else if (item) {
        item.comments_count = Number(item.comments_count || 0) + 1;
      }

      const countEl = document.getElementById(`news-comment-count-${newsId}`);
      if (countEl && item) countEl.textContent = item.comments_count;

      if (this.openNewsComments[newsId]) {
        const listEl = document.getElementById(`comments-list-${newsId}`);
        if (listEl) listEl.innerHTML = this.renderCommentsListOnly(newsId);
      }
      return;
    }

    if (ev.type === "comment_deleted") {
      const { newsId, commentId } = ev;
      const item = this.newsList.find(n => n.id === newsId);
      if (this.newsCommentsCache[newsId]) {
        this.newsCommentsCache[newsId] = this.newsCommentsCache[newsId].filter(
          c => c.id !== commentId && c.parent_id !== commentId
        );
        if (item) item.comments_count = this.newsCommentsCache[newsId].length;
      } else if (item && item.comments_count > 0) {
        item.comments_count--;
      }

      const countEl = document.getElementById(`news-comment-count-${newsId}`);
      if (countEl && item) countEl.textContent = item.comments_count;

      if (this.openNewsComments[newsId]) {
        const listEl = document.getElementById(`comments-list-${newsId}`);
        if (listEl) listEl.innerHTML = this.renderCommentsListOnly(newsId);
      }
      return;
    }

    if (ev.type === "comment_reaction") {
      const { newsId, commentId, counts } = ev;
      const list = this.newsCommentsCache[newsId];
      if (!list || !counts) return;
      const comment = list.find(c => c.id === commentId);
      if (!comment) return;
      if (!comment.reactions) comment.reactions = {};
      for (const emoji of this.commentEmojis) {
        if (!comment.reactions[emoji]) comment.reactions[emoji] = { count: 0, reacted: false };
        if (counts[emoji] !== undefined) comment.reactions[emoji].count = Number(counts[emoji]);
      }
      const box = document.getElementById(`comment-reactions-${commentId}`);
      if (box) box.innerHTML = this.renderCommentReactionsHtml(comment);
      return;
    }

    if (ev.type === "news_created") {
      if (ev.news && !this.newsList.some(n => n.id === ev.news.id)) {
        if (ev.news.pinned) {
          this.newsList.unshift(ev.news);
        } else {
          const firstUnpinned = this.newsList.findIndex(n => !n.pinned);
          if (firstUnpinned === -1) this.newsList.push(ev.news);
          else this.newsList.splice(firstUnpinned, 0, ev.news);
        }

        const feed = document.getElementById("news-feed");
        if (feed && document.getElementById("view-news")?.classList.contains("active")) {
          const isTyping = document.activeElement?.tagName === "TEXTAREA";
          if (!isTyping) this.renderNewsFeed();
          else {
            const temp = document.createElement("div");
            temp.innerHTML = this.renderSingleNewsCard(ev.news);
            feed.prepend(temp.firstElementChild);
          }
        }
      }

      if (this.currentUser && this.userToken) {
        this.loadNotifications();
        this.toast(`📰 ${ev.message || "Nueva noticia publicada en ArcanStore"}`);
      }
      return;
    }

    if (ev.type === "news_updated" || ev.type === "news_deleted") {
      if (document.getElementById("view-news")?.classList.contains("active")) {
        const isTyping = document.activeElement?.tagName === "TEXTAREA";
        if (!isTyping) this.loadNews(false);
      }
      return;
    }

    if (ev.type === "notification" && ev.notification) {
      if (!this.currentUser) return;
      if (!this.notifications.some(n => n.id === ev.notification.id)) {
        this.notifications.unshift(ev.notification);
        this.unreadCount++;
      }
      this.updateNotifUI();
      this.toast(`🔔 ${ev.notification.message}`);
      if (document.getElementById("modal-notifications")?.classList.contains("open")) {
        this.renderNotificationsList();
      }
      return;
    }

    if (ev.type === "name_changed" && this.currentUser && ev.userId === this.currentUser.id) {
      this.currentUser.name = ev.newName;
      this.updateAuthButton();
      this.loadPublicUsers();
      if (document.getElementById("view-profile")?.classList.contains("active")) {
        this.renderProfile();
      }
      return;
    }

    if (ev.type === "level_updated" && this.currentUser && ev.userId === this.currentUser.id && ev.level) {
      this.currentUser.level_index = ev.level.index;
      this.currentUser.level = ev.level;
      this.updateAuthButton();
      this.loadPublicUsers();
      if (document.getElementById("view-profile")?.classList.contains("active")) {
        this.paintProfile();
      }
    }
  },

  /* ================= NOTIFICACIONES (CAMPANITA 🔔) ================= */
  async loadNotifications() {
    if (!this.currentUser || !this.userToken) {
      this.notifications = [];
      this.unreadCount = 0;
      this.updateNotifUI();
      return;
    }

    try {
      const data = await this.api("notifications", { token: this.userToken });
      this.notifications = data.notifications || [];
      this.unreadCount = Number(data.unreadCount || 0);
      this.updateNotifUI();
      if (document.getElementById("modal-notifications")?.classList.contains("open")) {
        this.renderNotificationsList();
      }
    } catch {}
  },

  updateNotifUI() {
    const btn = document.getElementById("btn-notif");
    const badge = document.getElementById("notif-badge");
    if (!btn || !badge) return;

    if (!this.currentUser) {
      btn.classList.add("hidden");
      return;
    }

    btn.classList.remove("hidden");
    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 99 ? "99+" : String(this.unreadCount);
      badge.classList.remove("hidden");
      btn.classList.add("has-unread");
    } else {
      badge.classList.add("hidden");
      btn.classList.remove("has-unread");
    }
  },

  async openNotificationsModal() {
    if (!this.currentUser || !this.userToken) {
      this.openAuthModal("login");
      return;
    }
    this.openModal("modal-notifications");
    this.renderNotificationsList();
    await this.loadNotifications();
  },

  renderNotificationsList() {
    const box = document.getElementById("notifications-list");
    if (!box) return;

    if (!this.notifications.length) {
      box.innerHTML = `<p class="muted" style="text-align:center;padding:26px 10px;">No tienes notificaciones todavía.</p>`;
      return;
    }

    const icons = {
      news: "📰",
      reply: "💬",
      mention: "🏷️",
      comment_reaction: "❤️",
      name_change: "✏️",
      level: "🏆",
      order: "✅"
    };

    box.innerHTML = this.notifications.map(n => `
      <button type="button" class="notif-item ${n.is_read ? "" : "unread"}" onclick="App.handleNotificationClick('${n.id}')">
        <div class="notif-icon">
          ${n.actor_avatar
            ? this.renderAvatar(n.actor_avatar, n.actor_name, "avatar-sm")
            : `<span class="notif-emoji-badge">${icons[n.type] || "🔔"}</span>`}
        </div>
        <div class="notif-content">
          <div class="notif-msg">${this.esc(n.message)}</div>
          <div class="muted notif-time">${this.formatDate(n.created_at)}</div>
        </div>
        ${n.is_read ? "" : `<span class="notif-dot"></span>`}
      </button>
    `).join("");
  },

  async handleNotificationClick(notifId) {
    const n = this.notifications.find(x => x.id === notifId);
    if (!n) return;

    if (!n.is_read) {
      n.is_read = 1;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateNotifUI();
      this.api("notifications/read", {
        method: "POST",
        token: this.userToken,
        body: { id: notifId }
      }).catch(() => {});
    }

    this.closeModal("modal-notifications");

    if (n.type === "name_change" || n.type === "level") {
      this.switchView("profile");
      return;
    }

    if (n.type === "order") {
      this.switchView("history");
      return;
    }

    if (n.news_id) {
      this.switchView("news");
      if (!this.newsList.some(x => x.id === n.news_id)) {
        await this.loadNews(false);
      }
      if (n.comment_id) {
        this.openNewsComments[n.news_id] = true;
        this.renderNewsFeed();
        await this.loadComments(n.news_id);
      }

      setTimeout(() => {
        const targetEl = (n.comment_id && document.getElementById(`comment-item-${n.comment_id}`))
          || document.getElementById(`news-card-${n.news_id}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.classList.add("flash-highlight");
          setTimeout(() => targetEl.classList.remove("flash-highlight"), 2200);
        }
      }, 120);
    }
  },

  async markAllNotificationsRead() {
    if (!this.userToken) return;
    try {
      await this.api("notifications/read", { method: "POST", token: this.userToken, body: {} });
      this.notifications.forEach(n => { n.is_read = 1; });
      this.unreadCount = 0;
      this.updateNotifUI();
      this.renderNotificationsList();
      this.toast("Todas marcadas como leídas.");
    } catch (err) {
      this.toast(err.message);
    }
  },

  async clearAllNotifications() {
    if (!this.userToken || !this.notifications.length) return;
    if (!confirm("¿Borrar todas tus notificaciones?")) return;
    try {
      await this.api("notifications", { method: "DELETE", token: this.userToken });
      this.notifications = [];
      this.unreadCount = 0;
      this.updateNotifUI();
      this.renderNotificationsList();
      this.toast("Notificaciones eliminadas.");
    } catch (err) {
      this.toast(err.message);
    }
  },

  /* ================= COMPRESIÓN DE IMÁGENES PARA R2 ================= */
  compressToBlob(file, maxWidth = 1100, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Imagen no válida."));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Error comprimiendo imagen."))),
            "image/webp",
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  async uploadImageToR2(blob, folder, token) {
    const form = new FormData();
    form.append("file", blob, "image.webp");
    form.append("folder", folder);
    const res = await this.api("upload", { method: "POST", body: form, token, isForm: true });
    return res.url;
  },

  applyAppearance() {
    if (!this.state) return;
    const cfg = this.state.config;
    const bgEl = document.getElementById("bg-image");
    const ovEl = document.getElementById("bg-overlay");
    document.documentElement.style.setProperty("--accent", cfg.accentColor || "#00e5ff");
    bgEl.style.backgroundImage = cfg.backgroundUrl ? `url('${cfg.backgroundUrl}')` : "none";
    bgEl.style.filter = `blur(${cfg.bgBlur || 0}px)`;
    ovEl.style.background = `radial-gradient(circle at top right, rgba(0,229,255,0.12), transparent 45%), rgba(6,9,18,${cfg.overlayOpacity ?? 0.8})`;
    document.getElementById("display-rate").textContent = `1 USD = ${Number(cfg.bsRate).toFixed(2)} Bs`;
  },

  /* ================= NAVEGACIÓN ================= */
  switchView(viewName) {
    if (viewName === "admin" && !this.adminToken) {
      this.requestAdminAccess();
      return;
    }

    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${viewName}`).classList.add("active");
    document.querySelectorAll(".nav-btn[data-view]").forEach(b => {
      b.classList.toggle("active", b.dataset.view === viewName);
    });

    if (viewName === "store") this.renderStore();
    if (viewName === "news") this.loadNews();
    if (viewName === "history") this.renderHistory();
    if (viewName === "profile") this.renderProfile();
    if (viewName === "admin") {
      this.refreshAdminData(false);
      this.renderAdmin();
    }
  },

  openModal(id) { document.getElementById(id).classList.add("open"); },
  closeModal(id) { document.getElementById(id).classList.remove("open"); },

  /* ================= TIENDA ================= */
  renderStore() {
    if (!this.state) return;
    this.applyAppearance();
    const query = (document.getElementById("search-games")?.value || "").toLowerCase().trim();
    const grid = document.getElementById("games-grid");

    const filtered = this.state.games.filter(g =>
      g.name.toLowerCase().includes(query) || g.subtitle.toLowerCase().includes(query)
    );

    if (!filtered.length) {
      grid.innerHTML = `<div class="glass" style="padding:24px;grid-column:1/-1;text-align:center;">No se encontraron juegos.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(g => {
      const minPrice = g.packages.length ? Math.min(...g.packages.map(p => Number(p.priceUsd))) : 0;
      return `
        <article class="game-card" onclick="App.startCheckout('${g.id}')">
          <div class="game-cover-wrap">
            <img src="${this.esc(g.image)}" alt="${this.esc(g.name)}" onerror="App.imgFallback(this, '${this.esc(g.name)}')" />
            ${g.tag ? `<span class="badge">${this.esc(g.tag)}</span>` : ""}
          </div>
          <div class="game-info">
            <h3>${this.esc(g.name)}</h3>
            <p>${this.esc(g.subtitle)}</p>
            <div class="game-footer">
              <span>Desde ${this.formatUsd(minPrice)}</span>
              <span>Recargar →</span>
            </div>
          </div>
        </article>
      `;
    }).join("");
  },

  /* ================= NOTICIAS EN TIEMPO REAL, COMPARTIR, REACCIONES Y COMENTARIOS ================= */
  async loadNews(showToast = false) {
    const feed = document.getElementById("news-feed");
    if (feed && !this.newsList.length) {
      feed.innerHTML = `<div class="glass" style="padding:26px;text-align:center;">Cargando noticias...</div>`;
    }
    try {
      const data = await this.api("news", { token: this.userToken });
      this.newsList = data.news || [];
      if (Array.isArray(data.emojis) && data.emojis.length) this.newsEmojis = data.emojis;
      if (Array.isArray(data.commentEmojis) && data.commentEmojis.length) this.commentEmojis = data.commentEmojis;
      if (showToast) this.toast("Noticias actualizadas.");
      this.renderNewsFeed();
      if (this.adminTab === "news" && this.adminToken) this.renderAdmin();
    } catch (err) {
      if (feed) feed.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">${this.esc(err.message)}</div>`;
    }
  },

  renderNewsReactionsHtml(n) {
    return this.newsEmojis.map(emoji => {
      const info = n.reactions?.[emoji] || { count: 0, reacted: false };
      return `
        <button type="button" class="reaction-btn ${info.reacted ? "active" : ""}" onclick="App.toggleReaction('${n.id}', '${emoji}')">
          <span>${emoji}</span>
          <span class="reaction-count">${info.count}</span>
        </button>
      `;
    }).join("");
  },

  renderSingleNewsCard(n) {
    const commentsOpen = Boolean(this.openNewsComments[n.id]);
    return `
      <article class="glass news-card" id="news-card-${n.id}">
        <div class="news-card-header">
          <div class="news-badges">
            ${n.pinned ? `<span class="badge badge-pin">📌 FIJADO</span>` : ""}
            <span class="badge">${this.esc(n.tag || "Anuncio")}</span>
          </div>
          <span class="muted news-date">${this.formatDate(n.created_at)}</span>
        </div>

        <h3 class="news-title">${this.esc(n.title)}</h3>

        ${n.image_url ? `
          <div class="news-image-wrap">
            <img src="${this.esc(n.image_url)}" alt="${this.esc(n.title)}" onerror="App.imgFallback(this, 'NOTICIA')" />
          </div>
        ` : ""}

        <div class="news-content">${this.esc(n.content).replace(/\n/g, "<br>")}</div>

        <div class="news-actions-bar">
          <div class="reactions-row" id="news-reactions-${n.id}">${this.renderNewsReactionsHtml(n)}</div>
          <div class="news-right-actions">
            <button type="button" class="btn btn-outline btn-sm" onclick="App.shareNews('${n.id}')">
              📤 Compartir
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="App.toggleComments('${n.id}')">
              💬 Comentarios (<span id="news-comment-count-${n.id}">${n.comments_count || 0}</span>)
            </button>
          </div>
        </div>

        ${commentsOpen ? `<div class="comments-section" id="comments-box-${n.id}">${this.renderCommentsSectionHtml(n.id)}</div>` : ""}
      </article>
    `;
  },

  renderNewsFeed() {
    const feed = document.getElementById("news-feed");
    if (!feed) return;

    if (!this.newsList.length) {
      feed.innerHTML = `
        <div class="glass" style="padding:30px;text-align:center;">
          <p class="muted">Todavía no hay noticias publicadas. Vuelve pronto para ver anuncios, torneos y ofertas.</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.newsList.map(n => this.renderSingleNewsCard(n)).join("");
  },

  getNewsShareData(newsId) {
    const item = this.newsList.find(n => n.id === newsId);
    if (!item) return null;
    const url = `${window.location.origin}/?news=${encodeURIComponent(newsId)}`;
    const snippet = item.content.slice(0, 120) + (item.content.length > 120 ? "..." : "");
    const text = `📰 ${item.title} — ${snippet}`;
    return { item, url, text };
  },

  async shareNews(newsId) {
    const data = this.getNewsShareData(newsId);
    if (!data) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.item.title} | ArcanStore`,
          text: data.text,
          url: data.url
        });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    this.openShareNewsModal(newsId);
  },

  openShareNewsModal(newsId) {
    const data = this.getNewsShareData(newsId);
    const box = document.getElementById("share-news-content");
    if (!data || !box) return;

    const encUrl = encodeURIComponent(data.url);
    const encText = encodeURIComponent(`${data.text}\n${data.url}`);
    const encTitle = encodeURIComponent(data.text);

    box.innerHTML = `
      <h3 style="padding-right:34px;">Compartir Noticia</h3>
      <p class="muted" style="font-size:0.86rem;margin:6px 0 14px;">${this.esc(data.item.title)}</p>

      <div class="share-grid">
        <a class="share-btn share-wa" href="https://wa.me/?text=${encText}" target="_blank" rel="noopener">💬 WhatsApp</a>
        <a class="share-btn share-tg" href="https://t.me/share/url?url=${encUrl}&text=${encTitle}" target="_blank" rel="noopener">✈️ Telegram</a>
        <a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${encUrl}" target="_blank" rel="noopener">📘 Facebook</a>
        <a class="share-btn share-x" href="https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}" target="_blank" rel="noopener">𝕏 Publicar en X</a>
      </div>

      <label class="field-label">Enlace directo de la noticia</label>
      <div class="share-copy-row">
        <input type="text" class="input" id="share-news-url" value="${this.esc(data.url)}" readonly />
        <button type="button" class="btn btn-primary btn-sm" onclick="App.copySharedNewsUrl()">Copiar</button>
      </div>
    `;
    this.openModal("modal-share-news");
  },

  copySharedNewsUrl() {
    const input = document.getElementById("share-news-url");
    if (!input) return;
    navigator.clipboard?.writeText(input.value)
      .then(() => this.toast("Enlace copiado al portapapeles."))
      .catch(() => {
        input.select();
        document.execCommand?.("copy");
        this.toast("Enlace copiado.");
      });
  },

  async toggleReaction(newsId, emoji) {
    if (!this.currentUser || !this.userToken) {
      this.toast("Inicia sesión para reaccionar a las noticias.");
      this.openAuthModal("login");
      return;
    }

    try {
      const { reactions } = await this.api(`news/${newsId}/react`, {
        method: "POST",
        token: this.userToken,
        body: { emoji }
      });
      const item = this.newsList.find(n => n.id === newsId);
      if (item) {
        item.reactions = reactions;
        const box = document.getElementById(`news-reactions-${newsId}`);
        if (box) box.innerHTML = this.renderNewsReactionsHtml(item);
      }
    } catch (err) {
      this.toast(err.message);
    }
  },

  async toggleComments(newsId) {
    const isOpen = Boolean(this.openNewsComments[newsId]);
    if (isOpen) {
      delete this.openNewsComments[newsId];
      const box = document.getElementById(`comments-box-${newsId}`);
      if (box) box.remove();
      return;
    }

    this.openNewsComments[newsId] = true;
    const card = document.getElementById(`news-card-${newsId}`);
    if (card && !document.getElementById(`comments-box-${newsId}`)) {
      const div = document.createElement("div");
      div.className = "comments-section";
      div.id = `comments-box-${newsId}`;
      div.innerHTML = this.renderCommentsSectionHtml(newsId);
      card.appendChild(div);
    }

    if (!this.publicUsers.length) await this.loadPublicUsers();
    await this.loadComments(newsId);
  },

  async loadComments(newsId) {
    try {
      const data = await this.api(`news/${newsId}/comments`, { token: this.userToken });
      this.newsCommentsCache[newsId] = data.comments || [];
      if (Array.isArray(data.commentEmojis) && data.commentEmojis.length) {
        this.commentEmojis = data.commentEmojis;
      }
      const item = this.newsList.find(n => n.id === newsId);
      if (item) item.comments_count = this.newsCommentsCache[newsId].length;

      const countEl = document.getElementById(`news-comment-count-${newsId}`);
      if (countEl && item) countEl.textContent = item.comments_count;

      const listEl = document.getElementById(`comments-list-${newsId}`);
      if (listEl) listEl.innerHTML = this.renderCommentsListOnly(newsId);
    } catch (err) {
      this.toast(err.message);
    }
  },

  formatCommentContent(text) {
    const safe = this.esc(text);
    const known = [...this.publicUsers]
      .filter(u => u.name)
      .sort((a, b) => b.name.length - a.name.length);

    if (known.length) {
      const mapByLower = new Map(known.map(u => [this.esc(u.name).toLowerCase(), u]));
      const pattern = known.map(u => this.escapeRegex(this.esc(u.name))).join("|");
      const regex = new RegExp(`@(${pattern})(?![\\wÁÉÍÓÚáéíóúÑñ])`, "gi");
      return safe
        .replace(regex, (match, captured) => {
          const found = mapByLower.get(captured.toLowerCase());
          if (!found) return match;
          return `<button type="button" class="mention-chip" onclick="App.openPublicProfile('${found.id}')">@${this.esc(found.name)}</button>`;
        })
        .replace(/\n/g, "<br>");
    }

    return safe
      .replace(/@([A-Za-z0-9_ÁÉÍÓÚáéíóúÑñ-]{2,32})/g, `<span class="mention-chip">@$1</span>`)
      .replace(/\n/g, "<br>");
  },

  renderCommentReactionsHtml(c) {
    return this.commentEmojis.map(emoji => {
      const info = c.reactions?.[emoji] || { count: 0, reacted: false };
      return `
        <button type="button" class="comment-react-btn ${info.reacted ? "active" : ""} ${info.count > 0 ? "has-count" : ""}"
          onclick="App.toggleCommentReaction('${c.news_id}', '${c.id}', '${emoji}')" title="Reaccionar con ${emoji}">
          <span>${emoji}</span>${info.count > 0 ? `<span class="comment-react-count">${info.count}</span>` : ""}
        </button>
      `;
    }).join("");
  },

  async toggleCommentReaction(newsId, commentId, emoji) {
    if (!this.currentUser || !this.userToken) {
      this.toast("Inicia sesión para reaccionar a los comentarios.");
      this.openAuthModal("login");
      return;
    }

    try {
      const { reactions } = await this.api(`news/comments/${commentId}/react`, {
        method: "POST",
        token: this.userToken,
        body: { emoji }
      });
      const list = this.newsCommentsCache[newsId] || [];
      const comment = list.find(c => c.id === commentId);
      if (comment) {
        comment.reactions = reactions;
        const box = document.getElementById(`comment-reactions-${commentId}`);
        if (box) box.innerHTML = this.renderCommentReactionsHtml(comment);
      }
    } catch (err) {
      this.toast(err.message);
    }
  },

  renderCommentItem(c, newsId, isReply = false) {
    const canDelete = Boolean(
      (this.currentUser && this.currentUser.id === c.user_id) || this.adminToken
    );
    const lvlIdx = Number(c.user_level_index || 0);

    return `
      <div class="comment-item ${isReply ? "comment-reply" : ""}" id="comment-item-${c.id}">
        <button type="button" class="avatar-btn" onclick="App.openPublicProfile('${c.user_id}')">
          ${this.renderAvatar(c.user_avatar, c.user_name, isReply ? "avatar-xs" : "avatar-sm", lvlIdx)}
        </button>
        <div class="comment-body">
          <div class="comment-meta">
            <button type="button" class="comment-author" onclick="App.openPublicProfile('${c.user_id}')">
              ${this.esc(c.user_name)}
            </button>
            ${this.renderLevelBadge(lvlIdx, true)}
            ${c.reply_to_name ? `<span class="reply-badge">↳ @${this.esc(c.reply_to_name)}</span>` : ""}
            <span class="muted comment-time">${this.formatDate(c.created_at)}</span>
          </div>
          <div class="comment-text">${this.formatCommentContent(c.content)}</div>
          <div class="comment-footer-row">
            <div class="comment-reactions-row" id="comment-reactions-${c.id}">
              ${this.renderCommentReactionsHtml(c)}
            </div>
            <div class="comment-actions">
              <button type="button" class="text-btn" onclick="App.startReply('${newsId}', '${c.id}', '${c.user_id}', '${this.esc(c.user_name).replace(/'/g, "\\'")}')">
                Responder
              </button>
              ${canDelete ? `
                <button type="button" class="text-btn text-danger" onclick="App.deleteComment('${newsId}', '${c.id}')">
                  Eliminar
                </button>
              ` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderCommentsListOnly(newsId) {
    const comments = this.newsCommentsCache[newsId];
    if (!comments) {
      return `<p class="muted" style="padding:10px 0;font-size:0.86rem;">Cargando comentarios...</p>`;
    }
    if (!comments.length) {
      return `<p class="muted" style="font-size:0.86rem;margin-bottom:4px;">Sé el primero en comentar esta noticia.</p>`;
    }

    const roots = comments.filter(c => !c.parent_id);
    const repliesMap = {};
    for (const c of comments) {
      if (c.parent_id) {
        if (!repliesMap[c.parent_id]) repliesMap[c.parent_id] = [];
        repliesMap[c.parent_id].push(c);
      }
    }

    return roots.map(root => `
      <div class="comment-thread">
        ${this.renderCommentItem(root, newsId, false)}
        ${(repliesMap[root.id] || []).map(rep => this.renderCommentItem(rep, newsId, true)).join("")}
      </div>
    `).join("");
  },

  renderReplyBannerHtml(newsId) {
    const replyTarget = this.replyState[newsId];
    if (!replyTarget) return "";
    return `
      <div class="reply-banner">
        <span>Respondiendo a <strong>@${this.esc(replyTarget.replyToName)}</strong></span>
        <button type="button" class="text-btn" onclick="App.cancelReply('${newsId}')">✕ Cancelar</button>
      </div>
    `;
  },

  renderCommentsSectionHtml(newsId) {
    const composerHtml = this.currentUser
      ? `
        <div class="comment-composer">
          <div id="reply-banner-slot-${newsId}">${this.renderReplyBannerHtml(newsId)}</div>
          <div class="mention-wrap">
            <textarea id="comment-input-${newsId}" rows="2" class="input"
              placeholder="Escribe un comentario... Usa @ para etiquetar jugadores"
              oninput="App.handleMentionInput('${newsId}', this)"></textarea>
            <div id="mention-list-${newsId}" class="mention-dropdown"></div>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <button type="button" class="btn btn-primary btn-sm" onclick="App.submitComment('${newsId}')">Publicar comentario</button>
          </div>
        </div>
      `
      : `
        <div class="comment-login-prompt">
          <span class="muted">Inicia sesión para comentar, responder y etiquetar usuarios.</span>
          <button type="button" class="btn btn-primary btn-sm" onclick="App.openAuthModal('login')">Iniciar Sesión</button>
        </div>
      `;

    return `
      <div class="comments-list" id="comments-list-${newsId}">${this.renderCommentsListOnly(newsId)}</div>
      ${composerHtml}
    `;
  },

  startReply(newsId, commentId, userId, userName) {
    if (!this.currentUser || !this.userToken) {
      this.toast("Inicia sesión para responder comentarios.");
      this.openAuthModal("login");
      return;
    }
    this.replyState[newsId] = { parentId: commentId, replyToUserId: userId, replyToName: userName };
    const slot = document.getElementById(`reply-banner-slot-${newsId}`);
    if (slot) slot.innerHTML = this.renderReplyBannerHtml(newsId);

    const input = document.getElementById(`comment-input-${newsId}`);
    if (input) {
      if (!input.value.includes(`@${userName}`)) {
        input.value = `@${userName} ${input.value}`;
      }
      input.focus();
    }
  },

  cancelReply(newsId) {
    delete this.replyState[newsId];
    const slot = document.getElementById(`reply-banner-slot-${newsId}`);
    if (slot) slot.innerHTML = "";
  },

  handleMentionInput(newsId, textarea) {
    const box = document.getElementById(`mention-list-${newsId}`);
    if (!box) return;

    const pos = textarea.selectionStart;
    const before = textarea.value.slice(0, pos);
    const match = before.match(/(?:^|\s)@([^\s@]{0,24})$/);

    if (!match) {
      box.classList.remove("open");
      box.innerHTML = "";
      return;
    }

    const query = match[1].toLowerCase();
    const matches = this.publicUsers
      .filter(u => u.name.toLowerCase().includes(query))
      .slice(0, 6);

    if (!matches.length) {
      box.classList.remove("open");
      box.innerHTML = "";
      return;
    }

    box.innerHTML = matches.map(u => `
      <button type="button" class="mention-option" onmousedown="event.preventDefault(); App.insertMention('${newsId}', '${this.esc(u.name).replace(/'/g, "\\'")}')">
        ${this.renderAvatar(u.avatar_url, u.name, "avatar-xs", Number(u.level_index || 0))}
        <span>${this.esc(u.name)}</span>
        ${this.renderLevelBadge(Number(u.level_index || 0), true)}
      </button>
    `).join("");
    box.classList.add("open");
  },

  insertMention(newsId, userName) {
    const textarea = document.getElementById(`comment-input-${newsId}`);
    const box = document.getElementById(`mention-list-${newsId}`);
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const before = textarea.value.slice(0, pos);
    const after = textarea.value.slice(pos);
    const updatedBefore = before.replace(/@([^\s@]{0,24})$/, `@${userName} `);

    textarea.value = updatedBefore + after;
    textarea.focus();
    textarea.setSelectionRange(updatedBefore.length, updatedBefore.length);
    if (box) {
      box.classList.remove("open");
      box.innerHTML = "";
    }
  },

  async submitComment(newsId) {
    if (!this.currentUser || !this.userToken) {
      this.openAuthModal("login");
      return;
    }

    const input = document.getElementById(`comment-input-${newsId}`);
    const content = (input?.value || "").trim();
    if (!content) return this.toast("Escribe un comentario antes de enviar.");

    const reply = this.replyState[newsId] || {};
    try {
      const { comment } = await this.api(`news/${newsId}/comments`, {
        method: "POST",
        token: this.userToken,
        body: {
          content,
          parentId: reply.parentId || null,
          replyToUserId: reply.replyToUserId || null
        }
      });

      if (!this.newsCommentsCache[newsId]) this.newsCommentsCache[newsId] = [];
      if (!this.newsCommentsCache[newsId].some(c => c.id === comment.id)) {
        this.newsCommentsCache[newsId].push(comment);
      }
      const item = this.newsList.find(n => n.id === newsId);
      if (item) item.comments_count = this.newsCommentsCache[newsId].length;

      const countEl = document.getElementById(`news-comment-count-${newsId}`);
      if (countEl && item) countEl.textContent = item.comments_count;

      if (input) input.value = "";
      this.cancelReply(newsId);

      const listEl = document.getElementById(`comments-list-${newsId}`);
      if (listEl) listEl.innerHTML = this.renderCommentsListOnly(newsId);
    } catch (err) {
      this.toast(err.message);
    }
  },

  async deleteComment(newsId, commentId) {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      const target = this.newsCommentsCache[newsId]?.find(c => c.id === commentId);
      const useAdmin = Boolean(this.adminToken && (!this.currentUser || target?.user_id !== this.currentUser.id));
      const endpoint = useAdmin ? `admin/comments/${commentId}` : `news/comments/${commentId}`;
      const token = useAdmin ? this.adminToken : this.userToken;

      await this.api(endpoint, { method: "DELETE", token });
      if (this.newsCommentsCache[newsId]) {
        this.newsCommentsCache[newsId] = this.newsCommentsCache[newsId].filter(
          c => c.id !== commentId && c.parent_id !== commentId
        );
      }
      const item = this.newsList.find(n => n.id === newsId);
      if (item && this.newsCommentsCache[newsId]) item.comments_count = this.newsCommentsCache[newsId].length;
      const countEl = document.getElementById(`news-comment-count-${newsId}`);
      if (countEl && item) countEl.textContent = item.comments_count;
      const listEl = document.getElementById(`comments-list-${newsId}`);
      if (listEl) listEl.innerHTML = this.renderCommentsListOnly(newsId);

      this.toast("Comentario eliminado.");
    } catch (err) {
      this.toast(err.message);
    }
  },

  async openPublicProfile(userId) {
    const box = document.getElementById("public-profile-content");
    box.innerHTML = `<p class="muted" style="text-align:center;padding:20px;">Cargando perfil...</p>`;
    this.openModal("modal-public-profile");

    try {
      const { user } = await this.api(`users/${userId}`);
      const lvlIdx = Number(user.level?.index ?? user.level_index ?? 0);
      const metaChips = [
        user.level ? `<span class="profile-chip">⚡ ${user.level.recharges} recargas</span>` : "",
        user.gender ? `<span class="profile-chip">⚧ ${this.esc(user.gender)}</span>` : "",
        user.age ? `<span class="profile-chip">🎂 ${this.esc(user.age)} años</span>` : "",
        user.birthday ? `<span class="profile-chip">📅 ${this.esc(this.formatBirthday(user.birthday))}</span>` : ""
      ].filter(Boolean).join("");

      box.innerHTML = `
        <div class="public-profile-card">
          ${this.renderAvatar(user.avatar_url, user.name, "avatar-lg", lvlIdx)}
          <h3 style="margin-top:12px;">${this.esc(user.name)}</h3>
          <div style="margin-top:6px;">${this.renderLevelBadge(lvlIdx)}</div>
          ${metaChips ? `<div class="profile-chips">${metaChips}</div>` : ""}
          <p class="public-bio">${user.bio ? this.esc(user.bio) : "<span class='muted'>Sin descripción todavía.</span>"}</p>
          <span class="muted" style="font-size:0.78rem;">Miembro desde ${this.formatDate(user.created_at)}</span>
        </div>
      `;
    } catch (err) {
      box.innerHTML = `<p class="muted" style="text-align:center;padding:20px;">${this.esc(err.message)}</p>`;
    }
  },

  /* ================= RECORTADOR DE FOTO DE PERFIL (ZOOM + ARRASTRE) ================= */
  bindCropperEvents() {
    if (this.cropper.bound) return;
    const canvas = document.getElementById("crop-canvas");
    if (!canvas) return;
    this.cropper.bound = true;

    canvas.addEventListener("pointerdown", (e) => {
      if (!this.cropper.img) return;
      this.cropper.dragging = true;
      this.cropper.startX = e.clientX - this.cropper.offsetX;
      this.cropper.startY = e.clientY - this.cropper.offsetY;
      canvas.setPointerCapture?.(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!this.cropper.dragging || !this.cropper.img) return;
      e.preventDefault();
      this.cropper.offsetX = e.clientX - this.cropper.startX;
      this.cropper.offsetY = e.clientY - this.cropper.startY;
      this.clampCropOffsets();
      this.drawAvatarCrop();
    });

    const stopDrag = () => { this.cropper.dragging = false; };
    canvas.addEventListener("pointerup", stopDrag);
    canvas.addEventListener("pointercancel", stopDrag);
    canvas.addEventListener("pointerleave", stopDrag);
  },

  openAvatarCropper(inputEl) {
    const file = inputEl.files?.[0];
    inputEl.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return this.toast("Selecciona una imagen válida.");

    const reader = new FileReader();
    reader.onerror = () => this.toast("No se pudo leer la imagen.");
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => this.toast("Imagen no válida.");
      img.onload = () => {
        const size = 280;
        const baseScale = Math.max(size / img.width, size / img.height);
        this.cropper.img = img;
        this.cropper.baseScale = baseScale;
        this.cropper.zoom = 1;
        this.cropper.offsetX = 0;
        this.cropper.offsetY = 0;
        this.cropper.saving = false;

        const slider = document.getElementById("crop-zoom");
        const val = document.getElementById("crop-zoom-val");
        const saveBtn = document.getElementById("btn-crop-save");
        if (slider) slider.value = "1";
        if (val) val.textContent = "1.0x";
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Foto ✓";
        }

        this.openModal("modal-avatar-crop");
        this.drawAvatarCrop();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  closeAvatarCropper() {
    this.cropper.img = null;
    this.cropper.dragging = false;
    this.closeModal("modal-avatar-crop");
  },

  onCropZoom(val) {
    this.cropper.zoom = parseFloat(val) || 1;
    const label = document.getElementById("crop-zoom-val");
    if (label) label.textContent = `${this.cropper.zoom.toFixed(1)}x`;
    this.clampCropOffsets();
    this.drawAvatarCrop();
  },

  clampCropOffsets() {
    const c = this.cropper;
    if (!c.img) return;
    const size = 280;
    const drawW = c.img.width * c.baseScale * c.zoom;
    const drawH = c.img.height * c.baseScale * c.zoom;
    const maxX = Math.max(0, (drawW - size) / 2);
    const maxY = Math.max(0, (drawH - size) / 2);
    c.offsetX = Math.min(maxX, Math.max(-maxX, c.offsetX));
    c.offsetY = Math.min(maxY, Math.max(-maxY, c.offsetY));
  },

  drawAvatarCrop() {
    const canvas = document.getElementById("crop-canvas");
    const c = this.cropper;
    if (!canvas || !c.img) return;

    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const drawW = c.img.width * c.baseScale * c.zoom;
    const drawH = c.img.height * c.baseScale * c.zoom;
    const dx = (size - drawW) / 2 + c.offsetX;
    const dy = (size - drawH) / 2 + c.offsetY;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#060912";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(c.img, dx, dy, drawW, drawH);
  },

  async confirmAvatarCrop() {
    const c = this.cropper;
    if (!c.img || c.saving) return;

    c.saving = true;
    const saveBtn = document.getElementById("btn-crop-save");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Subiendo...";
    }

    try {
      const outSize = 420;
      const ratio = outSize / 280;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = outSize;
      outCanvas.height = outSize;
      const ctx = outCanvas.getContext("2d");

      const drawW = c.img.width * c.baseScale * c.zoom * ratio;
      const drawH = c.img.height * c.baseScale * c.zoom * ratio;
      const dx = (outSize - drawW) / 2 + c.offsetX * ratio;
      const dy = (outSize - drawH) / 2 + c.offsetY * ratio;

      ctx.drawImage(c.img, dx, dy, drawW, drawH);

      const blob = await new Promise((resolve, reject) => {
        outCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la foto."))),
          "image/webp",
          0.88
        );
      });

      const url = await this.uploadImageToR2(blob, "avatars", this.userToken);
      const { user } = await this.api("profile", {
        method: "PATCH",
        token: this.userToken,
        body: { avatar_url: url }
      });

      this.currentUser = user;
      this.updateAuthButton();
      this.loadPublicUsers();
      this.closeAvatarCropper();
      this.paintProfile();
      this.toast("Foto de perfil actualizada.");
    } catch (err) {
      this.toast(err.message);
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Guardar Foto ✓";
      }
    } finally {
      c.saving = false;
    }
  },

  /* ================= MI PERFIL, NIVELES Y CAMBIO DE NOMBRE ($5) ================= */
  async renderProfile() {
    const box = document.getElementById("profile-container");
    if (!box) return;

    if (!this.currentUser || !this.userToken) {
      box.innerHTML = `
        <div class="glass" style="padding:28px;text-align:center;">
          <p class="muted" style="margin-bottom:14px;">Inicia sesión para ver tu nivel, marco de perfil, foto con zoom y personalización.</p>
          <button class="btn btn-primary" onclick="App.openAuthModal('login')">Iniciar Sesión</button>
        </div>
      `;
      return;
    }

    box.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">Cargando tu perfil...</div>`;

    try {
      const data = await this.api("profile", { token: this.userToken });
      this.currentUser = data.user;
      this.profileData.requests = data.requests || [];
      this.updateAuthButton();
      this.paintProfile();
    } catch (err) {
      box.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">${this.esc(err.message)}</div>`;
    }
  },

  onBirthdayInput(val) {
    const autoAge = this.calculateAgeLocal(val);
    const ageInput = document.getElementById("profile-age-input");
    if (ageInput && autoAge !== "") ageInput.value = autoAge;
  },

  renderLevelProgressCard(u) {
    const lvl = u.level || {
      ...this.getLevelInfo(u.level_index || 0),
      recharges: 0,
      baseIndex: u.level_index || 0,
      baseName: this.getLevelInfo(u.level_index || 0).name,
      nextTarget: 50,
      nextName: "Hierro",
      isPenalized: false,
      recoveryMinUsd: 5,
      daysUntilDecay: null
    };

    const recharges = Number(lvl.recharges || 0);
    const currentBaseMin = this.getLevelInfo(lvl.baseIndex ?? lvl.index).min;
    const progressPct = lvl.nextTarget
      ? Math.min(100, Math.max(0, Math.round(((recharges - currentBaseMin) / Math.max(1, lvl.nextTarget - currentBaseMin)) * 100)))
      : 100;

    return `
      <div class="glass profile-card level-card level-card-${lvl.slug}">
        <div class="level-card-header">
          <div>
            <span class="muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.6px;">Rango de Recargas</span>
            <div style="display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap;">
              ${this.renderLevelBadge(lvl.index)}
              <strong style="font-size:0.95rem;">${recharges} recargas completadas</strong>
            </div>
          </div>
          <div style="text-align:right;">
            ${lvl.nextTarget
              ? `<span class="muted" style="font-size:0.82rem;">Siguiente: <strong>${this.esc(lvl.nextName)}</strong> (${lvl.nextTarget})</span>`
              : `<span class="badge">✨ RANGO MÁXIMO</span>`}
          </div>
        </div>

        <div class="level-progress-track">
          <div class="level-progress-fill level-fill-${lvl.slug}" style="width:${progressPct}%"></div>
        </div>

        ${lvl.isPenalized ? `
          <div class="level-alert">
            ⚠️ Tu nivel bajó por pasar más de 20 días sin recargar. Completa una recarga nueva de <strong>$${Number(lvl.recoveryMinUsd || 5).toFixed(2)} USD o más</strong> para recuperar automáticamente tu rango <strong>${this.esc(lvl.baseName)}</strong> con tus ${recharges} recargas acumuladas.
          </div>
        ` : lvl.index > 0 && lvl.daysUntilDecay !== null ? `
          <p class="hint" style="margin-top:10px;">
            ⏳ Regla de actividad: mantén tu rango recargando antes de <strong>${lvl.daysUntilDecay} día${lvl.daysUntilDecay === 1 ? "" : "s"}</strong> (si bajas por inactividad, lo recuperas con una recarga de $5+ USD).
          </p>
        ` : `
          <p class="hint" style="margin-top:10px;">
            Cada recarga completada suma para desbloquear insignias y marcos exclusivos de perfil.
          </p>
        `}

        <div class="levels-roadmap">
          ${this.levels.map(r => `
            <div class="roadmap-item ${r.index === lvl.index ? "current" : ""} ${r.index <= lvl.index ? "unlocked" : ""}">
              <span class="roadmap-icon">${r.icon}</span>
              <span class="roadmap-name">${this.esc(r.name)}</span>
              <span class="roadmap-min">${r.min === 0 ? "< 50" : `${r.min}+`}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  paintProfile() {
    const box = document.getElementById("profile-container");
    const u = this.currentUser;
    if (!box || !u) return;

    const pendingReq = this.profileData.requests.find(r => r.status === "Pendiente");
    const genders = ["", "Masculino", "Femenino", "No binario", "Prefiero no decir"];
    const lvlIdx = Number(u.level?.index ?? u.level_index ?? 0);

    box.innerHTML = `
      ${this.renderLevelProgressCard(u)}

      <div class="glass profile-card">
        <div class="profile-top">
          <div class="profile-avatar-col">
            ${this.renderAvatar(u.avatar_url, u.name, "avatar-xl", lvlIdx)}
            <div style="margin-top:10px;">${this.renderLevelBadge(lvlIdx)}</div>
            <label class="btn btn-outline btn-sm" style="cursor:pointer;margin-top:10px;">
              📷 Cambiar Foto + Zoom
              <input type="file" accept="image/*" style="display:none;" onchange="App.openAvatarCropper(this)" />
            </label>
          </div>

          <div class="profile-info-col">
            <div class="profile-name-row">
              <h3>${this.esc(u.name)}</h3>
              <button class="btn btn-primary btn-sm" onclick="App.openNameChangeModal()" ${pendingReq ? "disabled" : ""}>
                ✏️ Cambiar Nombre (${this.formatUsd(NAME_CHANGE_PRICE_USD)})
              </button>
            </div>
            <p class="muted" style="font-size:0.86rem;margin-top:4px;">${this.esc(u.email)}</p>
            ${pendingReq ? `<p class="hint" style="color:var(--accent);margin-top:8px;">Tienes una solicitud pendiente para cambiar a <strong>${this.esc(pendingReq.new_name)}</strong>.</p>` : ""}

            <div class="profile-meta-grid">
              <div>
                <label class="field-label">Género</label>
                <select id="profile-gender-input" class="input">
                  ${genders.map(g => `<option value="${this.esc(g)}" ${(u.gender || "") === g ? "selected" : ""}>${g || "Sin especificar"}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="field-label">Fecha de cumpleaños</label>
                <input type="date" id="profile-birthday-input" class="input" value="${this.esc(u.birthday || "")}"
                  onchange="App.onBirthdayInput(this.value)" />
              </div>
              <div>
                <label class="field-label">Edad</label>
                <input type="number" id="profile-age-input" class="input" min="10" max="120"
                  value="${u.age ?? ""}" placeholder="Ej: 22" />
              </div>
            </div>

            <label class="field-label" style="margin-top:14px;">Descripción / Bio (Gratis, máx. 240 caracteres)</label>
            <textarea id="profile-bio-input" rows="3" maxlength="240" class="input" placeholder="Cuéntale a la comunidad qué juegos juegas o tu clan...">${this.esc(u.bio || "")}</textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:12px;">
              <button class="btn btn-primary btn-sm" onclick="App.saveProfileDetails()" ${this.profileData.savingProfile ? "disabled" : ""}>
                ${this.profileData.savingProfile ? "Guardando..." : "Guardar Perfil"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass profile-card">
        <h4 style="margin-bottom:12px;">Solicitudes de Cambio de Nombre ($5 USD)</h4>
        ${this.profileData.requests.length ? this.profileData.requests.map(r => `
          <div class="order-card" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <strong>${this.esc(r.old_name)} → ${this.esc(r.new_name)}</strong>
              <div class="muted" style="font-size:0.82rem;">
                ${this.esc(r.payment_name)} • Ref: ${this.esc(r.reference)} • ${this.esc(r.amount_display)}
              </div>
              <div class="muted" style="font-size:0.76rem;">${this.formatDate(r.created_at)}</div>
              <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                ${r.receipt_url ? `<a href="${this.esc(r.receipt_url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🧾 Ver captura</a>` : ""}
                ${r.status === "Pendiente" ? `<a href="${this.buildNameChangeWhatsAppUrl(r)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">📲 Enviar a WhatsApp</a>` : ""}
              </div>
            </div>
            <span class="status-pill status-${r.status}">${r.status}</span>
          </div>
        `).join("") : `<p class="muted" style="font-size:0.88rem;">No has solicitado cambios de nombre todavía.</p>`}
      </div>
    `;
  },

  async saveProfileDetails() {
    const bio = (document.getElementById("profile-bio-input")?.value || "").trim();
    const gender = document.getElementById("profile-gender-input")?.value || "";
    const birthday = document.getElementById("profile-birthday-input")?.value || "";
    const rawAge = (document.getElementById("profile-age-input")?.value || "").trim();
    const age = rawAge === "" ? null : parseInt(rawAge, 10);

    this.profileData.savingProfile = true;
    this.paintProfile();

    try {
      const { user } = await this.api("profile", {
        method: "PATCH",
        token: this.userToken,
        body: { bio, gender, birthday, age }
      });
      this.currentUser = user;
      this.loadPublicUsers();
      this.toast("Perfil actualizado.");
    } catch (err) {
      this.toast(err.message);
    } finally {
      this.profileData.savingProfile = false;
      this.paintProfile();
    }
  },

  openNameChangeModal() {
    if (!this.currentUser || !this.userToken) return this.openAuthModal("login");
    if (this.nameChange.receiptPreviewUrl) URL.revokeObjectURL(this.nameChange.receiptPreviewUrl);

    this.nameChange = {
      newName: "",
      paymentId: this.state?.payments?.find(p => p.active)?.id || null,
      reference: "",
      receiptBlob: null,
      receiptPreviewUrl: "",
      submitting: false,
      lastRequest: null
    };
    this.renderNameChangeModal();
    this.openModal("modal-name-change");
  },

  renderNameChangeModal() {
    const nc = this.nameChange;
    const box = document.getElementById("name-change-modal-content");
    if (!box) return;

    if (nc.lastRequest) {
      const r = nc.lastRequest;
      const waUrl = this.buildNameChangeWhatsAppUrl(r);
      box.innerHTML = `
        <div style="text-align:center;padding:6px 0;">
          <div style="font-size:2.3rem;">✅</div>
          <h3 style="margin:6px 0;">Solicitud registrada</h3>
          <p class="muted">En cuanto confirmemos tu pago de <strong>${this.esc(r.amount_display)}</strong>, tu nombre cambiará automáticamente a <strong style="color:var(--accent)">${this.esc(r.new_name)}</strong>.</p>
        </div>

        <div class="pay-details-box" style="margin-top:14px;">
          <div><strong>Nombre actual:</strong> ${this.esc(r.old_name)}</div>
          <div><strong>Nuevo nombre:</strong> ${this.esc(r.new_name)}</div>
          <div><strong>Método:</strong> ${this.esc(r.payment_name)} — Ref: <strong>${this.esc(r.reference)}</strong></div>
          <div><strong>Monto:</strong> ${this.esc(r.amount_display)}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp full-width">
            📲 Enviar comprobante a WhatsApp
          </a>
          <button class="btn btn-outline full-width" onclick="App.closeModal('modal-name-change'); App.renderProfile();">
            Volver a Mi Perfil
          </button>
        </div>
      `;
      return;
    }

    const activePayments = (this.state?.payments || []).filter(p => p.active);
    const selectedPay = activePayments.find(p => p.id === nc.paymentId) || activePayments[0];
    if (selectedPay) nc.paymentId = selectedPay.id;

    const totalDisplay = selectedPay?.currency === "VES"
      ? `${this.formatBs(NAME_CHANGE_PRICE_USD)} (${this.formatUsd(NAME_CHANGE_PRICE_USD)})`
      : this.formatUsd(NAME_CHANGE_PRICE_USD);

    box.innerHTML = `
      <h3>Solicitar Cambio de Nombre</h3>
      <p class="muted" style="font-size:0.86rem;margin-top:4px;">
        Costo único: <strong style="color:var(--accent)">${totalDisplay}</strong>. Tu nombre actual es <strong>${this.esc(this.currentUser.name)}</strong>.
      </p>

      <label class="field-label">Nuevo nombre deseado *</label>
      <input type="text" id="nc-new-name" class="input" maxlength="32" value="${this.esc(nc.newName)}"
        oninput="App.nameChange.newName = this.value" placeholder="Ej: AresNoir" />

      <label class="field-label">Método de pago</label>
      <div class="pay-methods">
        ${activePayments.map(m => `
          <button type="button" class="pay-option ${m.id === nc.paymentId ? "selected" : ""}" onclick="App.nameChange.paymentId='${m.id}'; App.renderNameChangeModal();">
            <strong>${this.esc(m.name)}</strong>
            <div class="muted" style="font-size:0.78rem;">Moneda: ${m.currency}</div>
          </button>
        `).join("")}
      </div>

      ${selectedPay ? `
        <div class="pay-details-box">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <strong>Datos para ${this.esc(selectedPay.name)}:</strong>
            <button type="button" class="btn btn-outline btn-sm" onclick="App.copyPaymentDetails('${selectedPay.id}')">Copiar datos</button>
          </div>
          <pre>${this.esc(selectedPay.details)}</pre>
        </div>
      ` : ""}

      <label class="field-label">Código de referencia del pago *</label>
      <input type="text" id="nc-reference" class="input" value="${this.esc(nc.reference)}"
        oninput="App.nameChange.reference = this.value" placeholder="Número de referencia o ID de transacción" />

      <label class="field-label">Captura de pantalla del comprobante *</label>
      <label class="upload-box">
        ${nc.receiptPreviewUrl
          ? `<img src="${nc.receiptPreviewUrl}" class="receipt-preview" alt="Comprobante" />
             <span class="muted" style="font-size:0.8rem;">Toca aquí para cambiar la captura</span>`
          : `<span style="font-size:1.5rem;">🧾</span>
             <strong>Subir captura del pago ($5)</strong>
             <span class="muted" style="font-size:0.8rem;">Selecciona la imagen desde tu galería</span>`}
        <input type="file" accept="image/*" style="display:none;" onchange="App.handleNameChangeReceipt(this)" />
      </label>

      <div class="checkout-actions">
        <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-name-change')" ${nc.submitting ? "disabled" : ""}>Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="App.submitNameChange()" ${nc.submitting ? "disabled" : ""}>
          ${nc.submitting ? "Enviando solicitud..." : "Enviar Solicitud ✓"}
        </button>
      </div>
    `;
  },

  async handleNameChangeReceipt(inputEl) {
    const file = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return this.toast("Selecciona una imagen válida.");

    try {
      const blob = await this.compressToBlob(file, 1200, 0.82);
      if (this.nameChange.receiptPreviewUrl) URL.revokeObjectURL(this.nameChange.receiptPreviewUrl);
      this.nameChange.receiptBlob = blob;
      this.nameChange.receiptPreviewUrl = URL.createObjectURL(blob);
      this.renderNameChangeModal();
      this.toast("Captura lista.");
    } catch {
      this.toast("No se pudo leer la captura.");
    }
  },

  async submitNameChange() {
    const newName = (document.getElementById("nc-new-name")?.value || this.nameChange.newName || "").trim();
    const reference = (document.getElementById("nc-reference")?.value || this.nameChange.reference || "").trim();

    if (newName.length < 2) return this.toast("Escribe tu nuevo nombre (mínimo 2 caracteres).");
    if (!reference) return this.toast("Ingresa la referencia del pago.");
    if (!this.nameChange.receiptBlob) return this.toast("Adjunta la captura del comprobante de pago.");

    this.nameChange.newName = newName;
    this.nameChange.reference = reference;
    this.nameChange.submitting = true;
    this.renderNameChangeModal();

    try {
      const receiptUrl = await this.uploadImageToR2(this.nameChange.receiptBlob, "receipts", this.userToken);
      const { request } = await this.api("profile/name-change", {
        method: "POST",
        token: this.userToken,
        body: {
          newName,
          paymentId: this.nameChange.paymentId,
          reference,
          receiptUrl
        }
      });

      this.nameChange.lastRequest = request;
      this.toast("Solicitud de cambio de nombre enviada.");
    } catch (err) {
      this.toast(err.message);
    } finally {
      this.nameChange.submitting = false;
      this.renderNameChangeModal();
    }
  },

  buildNameChangeWhatsAppUrl(r) {
    const phone = String(this.state?.config?.whatsappNumber || "584125891414").replace(/\D/g, "");
    const receiptFullUrl = r.receipt_url.startsWith("http")
      ? r.receipt_url
      : `${window.location.origin}${r.receipt_url}`;

    const text = [
      `✏️ *SOLICITUD CAMBIO DE NOMBRE - ARCANSTORE*`,
      `👤 *Nombre actual:* ${r.old_name}`,
      `✨ *Nuevo nombre:* ${r.new_name}`,
      `💳 *Método:* ${r.payment_name}`,
      `💰 *Monto:* ${r.amount_display}`,
      `🔢 *Referencia:* ${r.reference}`,
      `🧾 *Comprobante:* ${receiptFullUrl}`
    ].join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  },

  /* ================= CHECKOUT (LOGIN + CÓDIGO DESCUENTO/REFERIDO + CAPTURA + WHATSAPP) ================= */
  startCheckout(gameId) {
    if (!this.currentUser || !this.userToken) {
      this.pendingGameId = gameId;
      this.toast("Debes iniciar sesión o registrarte para recargar.");
      this.openAuthModal("login", true);
      return;
    }

    const game = this.state.games.find(g => g.id === gameId);
    if (!game) return;

    if (this.checkout.receiptPreviewUrl) URL.revokeObjectURL(this.checkout.receiptPreviewUrl);

    this.checkout = {
      gameId,
      step: 1,
      playerId: "",
      zoneId: "",
      nickname: "",
      confirmedId: false,
      packageId: game.packages[0]?.id || null,
      paymentId: this.state.payments.find(p => p.active)?.id || null,
      promoInput: "",
      appliedPromo: null,
      checkingPromo: false,
      reference: "",
      receiptBlob: null,
      receiptPreviewUrl: "",
      submitting: false,
      lastOrder: null
    };

    const banner = document.getElementById("checkout-banner");
    banner.style.backgroundImage = `linear-gradient(to top, rgba(6,9,18,0.96), rgba(6,9,18,0.55)), url('${game.image}')`;
    document.getElementById("checkout-tag").textContent = game.tag || "RECARGA";
    document.getElementById("checkout-game-title").textContent = game.name;
    document.getElementById("checkout-game-sub").textContent = game.subtitle;

    this.renderCheckoutStep();
    this.openModal("modal-checkout");
  },

  async applyPromoCode() {
    const c = this.checkout;
    const raw = (document.getElementById("chk-promo-code")?.value || c.promoInput || "").trim().toUpperCase();
    if (!raw) return this.toast("Ingresa un código primero.");

    c.promoInput = raw;
    c.checkingPromo = true;
    this.renderCheckoutStep();

    try {
      const data = await this.api("promo/validate", {
        method: "POST",
        body: {
          code: raw,
          gameId: c.gameId,
          packageId: c.packageId
        }
      });
      c.appliedPromo = data;
      if (data.discountUsd > 0) {
        this.toast(`Código ${data.code} aplicado: -${this.formatUsd(data.discountUsd)}`);
      } else {
        this.toast(`Código de referido ${data.code} aplicado ✓`);
      }
    } catch (err) {
      c.appliedPromo = null;
      this.toast(err.message);
    } finally {
      c.checkingPromo = false;
      this.renderCheckoutStep();
    }
  },

  removePromoCode() {
    this.checkout.appliedPromo = null;
    this.checkout.promoInput = "";
    this.renderCheckoutStep();
    this.toast("Código quitado.");
  },

  renderCheckoutStep() {
    const c = this.checkout;
    const game = this.state.games.find(g => g.id === c.gameId);
    const body = document.getElementById("checkout-body");

    document.querySelectorAll("#checkout-stepper .step").forEach(el => {
      el.classList.toggle("active", Number(el.dataset.step) <= c.step);
    });

    if (c.step === 1) {
      body.innerHTML = `
        <h4>Paso 1: Ingresa los datos de tu cuenta</h4>
        <p class="muted" style="font-size:0.86rem;margin-top:4px;">Verifica bien tu ID antes de continuar.</p>

        <label class="field-label">${this.esc(game.idLabel || "ID de Jugador")} *</label>
        <input type="text" id="chk-player-id" class="input" value="${this.esc(c.playerId)}" placeholder="Ej: 318948769" />

        ${game.needsZone ? `
          <label class="field-label">${this.esc(game.zoneLabel || "Zone ID")} *</label>
          <input type="text" id="chk-zone-id" class="input" value="${this.esc(c.zoneId)}" placeholder="Ej: 1002" />
        ` : ""}

        <label class="field-label">Nombre en el juego (opcional)</label>
        <input type="text" id="chk-nickname" class="input" value="${this.esc(c.nickname)}" placeholder="Tu apodo dentro del juego" />

        <label class="checkbox-card">
          <input type="checkbox" id="chk-confirm-id" ${c.confirmedId ? "checked" : ""} />
          <span>Confirmo que el ID ingresado pertenece a mi cuenta y está escrito correctamente.</span>
        </label>

        <div class="checkout-actions">
          <button class="btn btn-outline" onclick="App.closeModal('modal-checkout')">Cancelar</button>
          <button class="btn btn-primary" onclick="App.nextStepFrom1()">Elegir Paquete →</button>
        </div>
      `;
    } else if (c.step === 2) {
      body.innerHTML = `
        <h4>Paso 2: Selecciona tu paquete</h4>
        <div class="packages-grid">
          ${game.packages.map(p => `
            <div class="pkg-card ${c.packageId === p.id ? "selected" : ""}" onclick="App.selectPackage('${p.id}')">
              <img src="${this.esc(p.image)}" alt="${this.esc(p.name)}" onerror="App.imgFallback(this, '${this.esc(p.name)}')" />
              <div class="pkg-name">${this.esc(p.name)}</div>
              <div class="pkg-usd">${this.formatUsd(p.priceUsd)}</div>
              <div class="pkg-bs">${this.formatBs(p.priceUsd)}</div>
            </div>
          `).join("")}
        </div>
        <div class="checkout-actions">
          <button class="btn btn-outline" onclick="App.setCheckoutStep(1)">← Atrás</button>
          <button class="btn btn-primary" onclick="App.setCheckoutStep(3)">Ir al Pago →</button>
        </div>
      `;
    } else if (c.step === 3) {
      const pkg = game.packages.find(p => p.id === c.packageId);
      const activePayments = this.state.payments.filter(p => p.active);
      const selectedPay = activePayments.find(p => p.id === c.paymentId) || activePayments[0];
      if (selectedPay) c.paymentId = selectedPay.id;

      const origPrice = Number(pkg.priceUsd);
      const finalPrice = c.appliedPromo ? Number(c.appliedPromo.finalPriceUsd) : origPrice;
      const discountUsd = c.appliedPromo ? Number(c.appliedPromo.discountUsd) : 0;

      const totalDisplay = selectedPay?.currency === "VES"
        ? `${this.formatBs(finalPrice)} (${this.formatUsd(finalPrice)})`
        : this.formatUsd(finalPrice);

      body.innerHTML = `
        <h4>Paso 3: Realiza el pago y sube tu comprobante</h4>
        <p class="muted" style="font-size:0.86rem;">
          Paquete: <strong>${this.esc(pkg.name)}</strong> — Total:
          ${discountUsd > 0 ? `<span class="price-strike">${this.formatUsd(origPrice)}</span> ` : ""}
          <strong style="color:var(--accent)">${totalDisplay}</strong>
        </p>

        <div class="promo-box">
          <label class="field-label" style="margin-top:0;">Código de descuento o referido (opcional)</label>
          <div class="promo-input-row">
            <input type="text" id="chk-promo-code" class="input" maxlength="24"
              value="${this.esc(c.appliedPromo ? c.appliedPromo.code : c.promoInput)}"
              ${c.appliedPromo ? "readonly" : ""}
              oninput="App.checkout.promoInput = this.value.toUpperCase()"
              placeholder="Ej: ARCAN10" />
            ${c.appliedPromo
              ? `<button type="button" class="btn btn-danger btn-sm" onclick="App.removePromoCode()">Quitar</button>`
              : `<button type="button" class="btn btn-outline btn-sm" onclick="App.applyPromoCode()" ${c.checkingPromo ? "disabled" : ""}>${c.checkingPromo ? "..." : "Aplicar"}</button>`}
          </div>
          ${c.appliedPromo ? `
            <div class="promo-applied-note">
              🎟️ Código <strong>${this.esc(c.appliedPromo.code)}</strong> aplicado
              ${discountUsd > 0 ? ` — Descuento: <strong>-${this.formatUsd(discountUsd)}</strong>` : " (código de referido registrado)"}
            </div>
          ` : ""}
        </div>

        <div class="pay-methods">
          ${activePayments.map(m => `
            <button type="button" class="pay-option ${m.id === c.paymentId ? "selected" : ""}" onclick="App.selectPayment('${m.id}')">
              <strong>${this.esc(m.name)}</strong>
              <div class="muted" style="font-size:0.78rem;">Moneda: ${m.currency}</div>
            </button>
          `).join("")}
        </div>

        ${selectedPay ? `
          <div class="pay-details-box">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>Datos para ${this.esc(selectedPay.name)}:</strong>
              <button type="button" class="btn btn-outline btn-sm" onclick="App.copyPaymentDetails('${selectedPay.id}')">Copiar datos</button>
            </div>
            <pre>${this.esc(selectedPay.details)}</pre>
          </div>
        ` : ""}

        <label class="field-label">Código de referencia del pago *</label>
        <input type="text" id="chk-reference" class="input" value="${this.esc(c.reference)}"
          oninput="App.checkout.reference = this.value"
          placeholder="Número de referencia o ID de transacción" />

        <label class="field-label">Captura de pantalla del comprobante de pago *</label>
        <label class="upload-box">
          ${c.receiptPreviewUrl
            ? `<img src="${c.receiptPreviewUrl}" class="receipt-preview" alt="Comprobante" />
               <span class="muted" style="font-size:0.8rem;">Toca aquí para cambiar la captura</span>`
            : `<span style="font-size:1.5rem;">🧾</span>
               <strong>Subir captura del comprobante</strong>
               <span class="muted" style="font-size:0.8rem;">Selecciona la imagen desde tu galería</span>`}
          <input type="file" accept="image/*" style="display:none;" onchange="App.handleReceiptSelect(this)" />
        </label>

        <div class="checkout-actions">
          <button type="button" class="btn btn-outline" onclick="App.setCheckoutStep(2)" ${c.submitting ? "disabled" : ""}>← Atrás</button>
          <button type="button" class="btn btn-primary" onclick="App.submitOrder()" ${c.submitting ? "disabled" : ""}>
            ${c.submitting ? "Guardando pedido..." : "Confirmar Recarga ✓"}
          </button>
        </div>
      `;
    } else if (c.step === 4) {
      const o = c.lastOrder;
      const waUrl = this.buildWhatsAppUrl(o);
      const canNativeShare = Boolean(navigator.share && c.receiptBlob);

      body.innerHTML = `
        <div style="text-align:center;padding:6px 0;">
          <div style="font-size:2.4rem;">✅</div>
          <h3 style="margin:6px 0;">¡Recarga registrada!</h3>
          <p class="muted">Orden: <strong style="color:var(--accent)">${this.esc(o.code)}</strong></p>
        </div>

        <div class="pay-details-box" style="margin-top:14px;">
          <div><strong>Juego:</strong> ${this.esc(o.game_name)}</div>
          <div><strong>Paquete:</strong> ${this.esc(o.package_name)}</div>
          <div><strong>ID Jugador:</strong> ${this.esc(o.player_id)}${o.zone_id ? ` (Zona: ${this.esc(o.zone_id)})` : ""}</div>
          <div><strong>Pago:</strong> ${this.esc(o.payment_name)} — Ref: <strong>${this.esc(o.reference)}</strong></div>
          ${o.promo_code ? `<div><strong>Código:</strong> ${this.esc(o.promo_code)}${o.discount_usd > 0 ? ` (-${this.formatUsd(o.discount_usd)})` : ""}</div>` : ""}
          <div><strong>Monto:</strong> ${this.esc(o.amount_display)}</div>
          <div><strong>Estado:</strong> <span class="status-pill status-${o.status}">${o.status}</span></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp full-width">
            📲 Enviar datos y comprobante a WhatsApp
          </a>
          ${canNativeShare ? `
            <button class="btn btn-outline full-width" onclick="App.shareReceiptNative()">
              📎 Adjuntar imagen de captura directamente (Móvil)
            </button>
          ` : ""}
        </div>

        <div class="checkout-actions">
          <button class="btn btn-outline" onclick="App.closeModal('modal-checkout')">Cerrar</button>
          <button class="btn btn-primary" onclick="App.closeModal('modal-checkout'); App.switchView('history');">Ver Mis Recargas</button>
        </div>
      `;
    }
  },

  nextStepFrom1() {
    const game = this.state.games.find(g => g.id === this.checkout.gameId);
    const playerId = document.getElementById("chk-player-id").value.trim();
    const zoneId = game.needsZone ? document.getElementById("chk-zone-id").value.trim() : "";
    const nickname = document.getElementById("chk-nickname").value.trim();
    const confirmed = document.getElementById("chk-confirm-id").checked;

    if (!playerId) return this.toast("Ingresa tu ID de jugador.");
    if (game.needsZone && !zoneId) return this.toast("Ingresa tu Zone ID.");
    if (!confirmed) return this.toast("Confirma que tu ID está escrito correctamente.");

    this.checkout.playerId = playerId;
    this.checkout.zoneId = zoneId;
    this.checkout.nickname = nickname;
    this.checkout.confirmedId = true;
    this.checkout.step = 2;
    this.renderCheckoutStep();
  },

  setCheckoutStep(step) {
    this.checkout.step = step;
    this.renderCheckoutStep();
  },

  selectPackage(pkgId) {
    if (this.checkout.packageId !== pkgId) {
      this.checkout.packageId = pkgId;
      this.checkout.appliedPromo = null;
    }
    this.renderCheckoutStep();
  },

  selectPayment(payId) {
    this.checkout.paymentId = payId;
    this.renderCheckoutStep();
  },

  copyPaymentDetails(payId) {
    const pay = this.state.payments.find(p => p.id === payId);
    if (!pay) return;
    navigator.clipboard?.writeText(pay.details).then(() => this.toast("Datos copiados al portapapeles."));
  },

  async handleReceiptSelect(inputEl) {
    const file = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.toast("Selecciona una imagen válida.");
      return;
    }
    try {
      const blob = await this.compressToBlob(file, 1200, 0.82);
      if (this.checkout.receiptPreviewUrl) URL.revokeObjectURL(this.checkout.receiptPreviewUrl);
      this.checkout.receiptBlob = blob;
      this.checkout.receiptPreviewUrl = URL.createObjectURL(blob);
      this.renderCheckoutStep();
      this.toast("Captura lista.");
    } catch {
      this.toast("No se pudo leer la captura.");
    }
  },

  async submitOrder() {
    const ref = (document.getElementById("chk-reference")?.value || this.checkout.reference || "").trim();
    if (!ref) return this.toast("Ingresa el código de referencia del pago.");
    if (!this.checkout.receiptBlob) return this.toast("Sube la captura de pantalla del comprobante.");

    this.checkout.reference = ref;
    this.checkout.submitting = true;
    this.renderCheckoutStep();

    try {
      const receiptUrl = await this.uploadImageToR2(this.checkout.receiptBlob, "receipts", this.userToken);
      const { order } = await this.api("orders", {
        method: "POST",
        token: this.userToken,
        body: {
          gameId: this.checkout.gameId,
          packageId: this.checkout.packageId,
          paymentId: this.checkout.paymentId,
          playerId: this.checkout.playerId,
          zoneId: this.checkout.zoneId,
          nickname: this.checkout.nickname,
          promoCode: this.checkout.appliedPromo?.code || "",
          reference: ref,
          receiptUrl
        }
      });

      this.checkout.lastOrder = order;
      this.checkout.step = 4;
      this.toast("¡Recarga guardada! Ahora puedes enviarla a WhatsApp.");
    } catch (err) {
      this.toast(err.message);
    } finally {
      this.checkout.submitting = false;
      this.renderCheckoutStep();
    }
  },

  buildWhatsAppText(o) {
    const receiptFullUrl = o.receipt_url.startsWith("http")
      ? o.receipt_url
      : `${window.location.origin}${o.receipt_url}`;

    const lines = [
      `🎮 *NUEVA RECARGA - ARCANSTORE*`,
      `📋 *Orden:* ${o.code}`,
      `👤 *Usuario:* ${o.user_name}`,
      `🕹️ *Juego:* ${o.game_name}`,
      `💎 *Paquete:* ${o.package_name}`,
      `🆔 *ID de Jugador:* ${o.player_id}${o.zone_id ? ` (Zona: ${o.zone_id})` : ""}`,
      o.nickname ? `🏷️ *Nickname:* ${o.nickname}` : null,
      o.promo_code ? `🎟️ *Código:* ${o.promo_code}${Number(o.discount_usd || 0) > 0 ? ` (-${this.formatUsd(o.discount_usd)})` : ""}` : null,
      `💳 *Método:* ${o.payment_name}`,
      `💰 *Monto:* ${o.amount_display}`,
      `🔢 *Referencia:* ${o.reference}`,
      `🧾 *Comprobante:* ${receiptFullUrl}`
    ].filter(Boolean);

    return lines.join("\n");
  },

  buildWhatsAppUrl(o) {
    const phone = String(this.state?.config?.whatsappNumber || "584125891414").replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(this.buildWhatsAppText(o))}`;
  },

  async shareReceiptNative() {
    const o = this.checkout.lastOrder;
    if (!o || !this.checkout.receiptBlob || !navigator.share) return;
    try {
      const file = new File([this.checkout.receiptBlob], `comprobante-${o.code}.webp`, { type: "image/webp" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Comprobante ${o.code}`,
          text: this.buildWhatsAppText(o),
          files: [file]
        });
      } else {
        window.open(this.buildWhatsAppUrl(o), "_blank", "noopener");
      }
    } catch {
      // Cancelado por el usuario
    }
  },

  /* ================= LOGIN E HISTORIAL ================= */
  updateAuthButton() {
    const btn = document.getElementById("btn-auth");
    if (!btn) return;
    if (this.currentUser) {
      const lvlIdx = Number(this.currentUser.level?.index ?? this.currentUser.level_index ?? 0);
      btn.innerHTML = `<span class="nav-user-pill">${this.renderAvatar(this.currentUser.avatar_url, this.currentUser.name, "avatar-nav", lvlIdx)} <span>${this.esc(this.currentUser.name)}</span></span>`;
    } else {
      btn.textContent = "Iniciar Sesión";
    }
  },

  openAuthModal(mode = "login", fromCheckout = false) {
    const box = document.getElementById("auth-modal-content");
    if (this.currentUser) {
      const lvlIdx = Number(this.currentUser.level?.index ?? this.currentUser.level_index ?? 0);
      box.innerHTML = `
        <div style="text-align:center;margin-bottom:16px;">
          ${this.renderAvatar(this.currentUser.avatar_url, this.currentUser.name, "avatar-lg", lvlIdx)}
          <h3 style="margin-top:10px;">${this.esc(this.currentUser.name)}</h3>
          <div style="margin-top:6px;">${this.renderLevelBadge(lvlIdx)}</div>
          <p class="muted" style="font-size:0.86rem;margin-top:6px;">${this.esc(this.currentUser.email)}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="btn btn-primary full-width" onclick="App.closeModal('modal-auth'); App.switchView('profile');">Editar Mi Perfil</button>
          <button class="btn btn-danger full-width" onclick="App.logout()">Cerrar Sesión</button>
        </div>
      `;
    } else if (mode === "login") {
      box.innerHTML = `
        <h3>Iniciar Sesión</h3>
        ${fromCheckout ? `<p class="hint" style="color:var(--accent);margin:6px 0;">Es obligatorio iniciar sesión para realizar una recarga.</p>` : ""}
        <form onsubmit="App.handleLogin(event)">
          <label class="field-label">Correo</label>
          <input type="email" id="auth-email" class="input" required placeholder="tu@correo.com" />
          <label class="field-label">Contraseña</label>
          <input type="password" id="auth-pass" class="input" required placeholder="••••••••" />
          <button type="submit" class="btn btn-primary full-width" style="margin-top:16px;">Entrar</button>
        </form>
        <p class="hint" style="text-align:center;margin-top:14px;">
          ¿No tienes cuenta? <a href="#" style="color:var(--accent)" onclick="event.preventDefault();App.openAuthModal('register', ${fromCheckout})">Regístrate aquí</a>
        </p>
      `;
    } else {
      box.innerHTML = `
        <h3>Crear Cuenta</h3>
        ${fromCheckout ? `<p class="hint" style="color:var(--accent);margin:6px 0;">Crea tu cuenta para guardar tu historial y recargar.</p>` : ""}
        <form onsubmit="App.handleRegister(event)">
          <label class="field-label">Nombre / Gamer Tag</label>
          <input type="text" id="reg-name" class="input" required maxlength="32" placeholder="Tu nombre" />
          <label class="field-label">Correo</label>
          <input type="email" id="reg-email" class="input" required placeholder="tu@correo.com" />
          <label class="field-label">Contraseña</label>
          <input type="password" id="reg-pass" class="input" required minlength="4" placeholder="Mínimo 4 caracteres" />
          <button type="submit" class="btn btn-primary full-width" style="margin-top:16px;">Crear Cuenta</button>
        </form>
        <p class="hint" style="text-align:center;margin-top:14px;">
          ¿Ya tienes cuenta? <a href="#" style="color:var(--accent)" onclick="event.preventDefault();App.openAuthModal('login', ${fromCheckout})">Inicia sesión</a>
        </p>
      `;
    }
    this.openModal("modal-auth");
  },

  async handleRegister(e) {
    e.preventDefault();
    try {
      const data = await this.api("auth/register", {
        method: "POST",
        body: {
          name: document.getElementById("reg-name").value.trim(),
          email: document.getElementById("reg-email").value.trim(),
          password: document.getElementById("reg-pass").value
        }
      });
      this.setUserSession(data.token, data.user);
      this.loadPublicUsers();
      this.closeModal("modal-auth");
      this.toast(`¡Bienvenido, ${data.user.name}!`);
      if (this.pendingGameId) {
        const g = this.pendingGameId;
        this.pendingGameId = null;
        this.startCheckout(g);
      } else if (document.getElementById("view-news").classList.contains("active")) {
        this.loadNews();
      } else if (document.getElementById("view-profile").classList.contains("active")) {
        this.renderProfile();
      }
    } catch (err) {
      this.toast(err.message);
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    try {
      const data = await this.api("auth/login", {
        method: "POST",
        body: {
          email: document.getElementById("auth-email").value.trim(),
          password: document.getElementById("auth-pass").value
        }
      });
      this.setUserSession(data.token, data.user);
      this.closeModal("modal-auth");
      this.toast(`Hola de nuevo, ${data.user.name}`);
      if (this.pendingGameId) {
        const g = this.pendingGameId;
        this.pendingGameId = null;
        this.startCheckout(g);
      } else if (document.getElementById("view-news").classList.contains("active")) {
        this.loadNews();
      } else if (document.getElementById("view-profile").classList.contains("active")) {
        this.renderProfile();
      } else if (document.getElementById("view-history").classList.contains("active")) {
        this.renderHistory();
      }
    } catch (err) {
      this.toast(err.message);
    }
  },

  setUserSession(token, user) {
    this.userToken = token;
    this.currentUser = user;
    localStorage.setItem(USER_TOKEN_KEY, token);
    this.updateAuthButton();
    this.updateNotifUI();
    this.loadNotifications();
    this.connectWebSocket();
  },

  logout() {
    this.userToken = null;
    this.currentUser = null;
    this.notifications = [];
    this.unreadCount = 0;
    localStorage.removeItem(USER_TOKEN_KEY);
    this.updateAuthButton();
    this.updateNotifUI();
    this.connectWebSocket();
    this.closeModal("modal-auth");
    this.toast("Sesión cerrada.");
    if (document.getElementById("view-history").classList.contains("active")) this.renderHistory();
    if (document.getElementById("view-profile").classList.contains("active")) this.renderProfile();
    if (document.getElementById("view-news").classList.contains("active")) this.loadNews();
  },

  async renderHistory() {
    const list = document.getElementById("history-list");
    const sub = document.getElementById("history-subtitle");

    if (!this.currentUser || !this.userToken) {
      sub.textContent = "Debes iniciar sesión para ver tu historial de recargas.";
      list.innerHTML = `
        <div class="glass" style="padding:28px;text-align:center;">
          <p class="muted" style="margin-bottom:14px;">Inicia sesión para consultar tus pedidos guardados.</p>
          <button class="btn btn-primary" onclick="App.openAuthModal('login')">Iniciar Sesión</button>
        </div>`;
      return;
    }

    sub.textContent = `Historial guardado de ${this.currentUser.email}`;
    list.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">Cargando tus recargas...</div>`;

    try {
      const { orders } = await this.api("orders/mine", { token: this.userToken });
      if (!orders.length) {
        list.innerHTML = `<div class="glass" style="padding:26px;text-align:center;">Todavía no has realizado recargas.</div>`;
        return;
      }

      list.innerHTML = orders.map(o => `
        <div class="glass order-card">
          <div>
            <strong>${this.esc(o.game_name)} — ${this.esc(o.package_name)}</strong>
            <div class="muted" style="font-size:0.84rem;">
              ${this.esc(o.code)} • ID: ${this.esc(o.player_id)}${o.zone_id ? ` (${this.esc(o.zone_id)})` : ""} • ${this.esc(o.payment_name)} (Ref: ${this.esc(o.reference)})
              ${o.promo_code ? ` • 🎟️ ${this.esc(o.promo_code)}` : ""}
            </div>
            <div class="muted" style="font-size:0.78rem;">${this.formatDate(o.created_at)}</div>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
              ${o.receipt_url ? `<a href="${this.esc(o.receipt_url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🧾 Ver captura</a>` : ""}
              <a href="${this.buildWhatsAppUrl(o)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">📲 Enviar a WhatsApp</a>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;color:var(--accent);margin-bottom:6px;">${this.esc(o.amount_display)}</div>
            <span class="status-pill status-${o.status}">${o.status}</span>
          </div>
        </div>
      `).join("");
    } catch (err) {
      list.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">${this.esc(err.message)}</div>`;
    }
  },

  /* ================= ADMIN PROTEGIDO EN LA NUBE ================= */
  requestAdminAccess() {
    if (this.adminToken) {
      this.switchView("admin");
      return;
    }
    document.getElementById("admin-pass-input").value = "";
    this.openModal("modal-admin-login");
    setTimeout(() => document.getElementById("admin-pass-input").focus(), 100);
  },

  async submitAdminLogin(e) {
    e.preventDefault();
    try {
      const password = document.getElementById("admin-pass-input").value;
      const { adminToken } = await this.api("admin/login", { method: "POST", body: { password } });
      this.adminToken = adminToken;
      sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
      this.closeModal("modal-admin-login");
      this.switchView("admin");
      this.toast("Panel de administrador desbloqueado.");
    } catch (err) {
      this.toast(err.message);
    }
  },

  lockAdmin() {
    this.adminToken = null;
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    this.switchView("store");
    this.toast("Panel bloqueado.");
  },

  async saveStoreRemote(msg = "Cambios guardados en la nube.") {
    try {
      await this.api("admin/store", { method: "PUT", token: this.adminToken, body: this.state });
      if (msg) this.toast(msg);
    } catch (err) {
      this.toast(err.message);
    }
  },

  switchAdminTab(tab) {
    this.adminTab = tab;
    document.querySelectorAll(".admin-tabs .tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    if (tab === "orders") this.refreshAdminOrders();
    else if (tab === "namechanges") this.refreshAdminNameChanges();
    else if (tab === "promos") this.refreshAdminPromos();
    else if (tab === "news") this.loadNews();
    else this.renderAdmin();
  },

  async refreshAdminData(showToast = true) {
    if (!this.adminToken) return;
    await Promise.all([
      this.refreshAdminOrders(false),
      this.refreshAdminNameChanges(false),
      this.refreshAdminPromos(false),
      this.loadNews(false)
    ]);
    this.renderAdmin();
    if (showToast) this.toast("Datos de administración actualizados.");
  },

  async refreshAdminOrders(render = true) {
    try {
      const { orders } = await this.api("admin/orders", { token: this.adminToken });
      this.adminOrders = orders;
      if (render) this.renderAdmin();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async refreshAdminNameChanges(render = true) {
    try {
      const { requests } = await this.api("admin/name-changes", { token: this.adminToken });
      this.adminNameChanges = requests || [];
      if (render) this.renderAdmin();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async refreshAdminPromos(render = true) {
    try {
      const { promos } = await this.api("admin/promos", { token: this.adminToken });
      this.adminPromos = promos || [];
      if (render) this.renderAdmin();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async createAdminPromo(e) {
    e.preventDefault();
    const f = this.promoForm;
    if (!f.code.trim()) return this.toast("Escribe un código.");

    f.saving = true;
    this.renderAdmin();

    try {
      await this.api("admin/promos", {
        method: "POST",
        token: this.adminToken,
        body: {
          code: f.code.trim().toUpperCase(),
          owner_name: f.owner_name.trim(),
          discount_type: f.discount_type,
          discount_value: parseFloat(f.discount_value) || 0,
          max_uses: f.max_uses === "" ? null : parseInt(f.max_uses, 10)
        }
      });

      this.promoForm = {
        code: "",
        owner_name: "",
        discount_type: "percent",
        discount_value: 0,
        max_uses: "",
        saving: false
      };
      this.toast("Código creado correctamente.");
      await this.refreshAdminPromos();
    } catch (err) {
      f.saving = false;
      this.toast(err.message);
      this.renderAdmin();
    }
  },

  async toggleAdminPromo(promoId, active) {
    try {
      await this.api(`admin/promos/${promoId}`, {
        method: "PATCH",
        token: this.adminToken,
        body: { active }
      });
      this.toast(active ? "Código activado." : "Código pausado.");
      await this.refreshAdminPromos();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async deleteAdminPromo(promoId) {
    if (!confirm("¿Eliminar este código de descuento / referido?")) return;
    try {
      await this.api(`admin/promos/${promoId}`, {
        method: "DELETE",
        token: this.adminToken
      });
      this.toast("Código eliminado.");
      await this.refreshAdminPromos();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async handleAdminImageUpload(inputEl, target, gameId = null, pkgId = null) {
    const file = inputEl.files?.[0];
    if (!file) return;
    const maxWidth = target === "background" ? 1400 : target === "news" ? 1200 : target === "game" ? 800 : 350;
    const folder = target === "news" ? "news" : "catalog";

    try {
      this.toast("Subiendo imagen...");
      const blob = await this.compressToBlob(file, maxWidth, 0.82);
      const url = await this.uploadImageToR2(blob, folder, this.adminToken);

      if (target === "news") {
        this.newsEditor.image_url = url;
        this.toast("Imagen de noticia lista.");
        this.renderAdmin();
        return;
      }

      if (target === "game") {
        const g = this.state.games.find(x => x.id === gameId);
        if (g) g.image = url;
      } else if (target === "package") {
        const g = this.state.games.find(x => x.id === gameId);
        const p = g?.packages.find(x => x.id === pkgId);
        if (p) p.image = url;
      } else if (target === "background") {
        this.state.config.backgroundUrl = url;
        this.applyAppearance();
      }

      await this.saveStoreRemote("Imagen subida y guardada en R2.");
      this.renderAdmin();
    } catch (err) {
      this.toast(err.message);
    } finally {
      inputEl.value = "";
    }
  },

  resetNewsEditor() {
    this.newsEditor = {
      id: null,
      title: "",
      tag: "Anuncio",
      content: "",
      image_url: "",
      pinned: false,
      saving: false
    };
    this.renderAdmin();
  },

  editAdminNews(newsId) {
    const item = this.newsList.find(n => n.id === newsId);
    if (!item) return;
    this.newsEditor = {
      id: item.id,
      title: item.title,
      tag: item.tag || "Anuncio",
      content: item.content,
      image_url: item.image_url || "",
      pinned: Boolean(item.pinned),
      saving: false
    };
    this.renderAdmin();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  async submitAdminNews(e) {
    e.preventDefault();
    const ed = this.newsEditor;
    if (!ed.title.trim() || !ed.content.trim()) {
      return this.toast("Completa el título y el contenido de la noticia.");
    }

    ed.saving = true;
    this.renderAdmin();

    try {
      if (ed.id) {
        await this.api(`admin/news/${ed.id}`, {
          method: "PUT",
          token: this.adminToken,
          body: {
            title: ed.title.trim(),
            tag: ed.tag.trim() || "Anuncio",
            content: ed.content.trim(),
            image_url: ed.image_url.trim(),
            pinned: ed.pinned
          }
        });
        this.toast("Noticia actualizada.");
      } else {
        await this.api("admin/news", {
          method: "POST",
          token: this.adminToken,
          body: {
            title: ed.title.trim(),
            tag: ed.tag.trim() || "Anuncio",
            content: ed.content.trim(),
            image_url: ed.image_url.trim(),
            pinned: ed.pinned
          }
        });
        this.toast("Noticia publicada y notificada a los usuarios.");
      }

      this.resetNewsEditor();
      await this.loadNews();
    } catch (err) {
      ed.saving = false;
      this.toast(err.message);
      this.renderAdmin();
    }
  },

  async deleteAdminNews(newsId) {
    if (!confirm("¿Eliminar esta noticia junto con sus reacciones y comentarios?")) return;
    try {
      await this.api(`admin/news/${newsId}`, { method: "DELETE", token: this.adminToken });
      if (this.newsEditor.id === newsId) this.resetNewsEditor();
      this.toast("Noticia eliminada.");
      await this.loadNews();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async resolveNameChange(reqId, status) {
    const verb = status === "Aprobado" ? "aprobar y cambiar el nombre de este usuario" : "rechazar esta solicitud";
    if (!confirm(`¿Seguro que deseas ${verb}?`)) return;

    try {
      await this.api(`admin/name-changes/${reqId}`, {
        method: "PATCH",
        token: this.adminToken,
        body: { status }
      });
      this.toast(`Solicitud marcada como ${status}.`);
      await Promise.all([this.refreshAdminNameChanges(), this.loadPublicUsers()]);
    } catch (err) {
      this.toast(err.message);
    }
  },

  renderAdmin() {
    const box = document.getElementById("admin-tab-content");

    if (this.adminTab === "games") {
      const game = this.state.games.find(g => g.id === this.selectedAdminGameId) || this.state.games[0];
      if (game) this.selectedAdminGameId = game.id;

      box.innerHTML = `
        <div class="row-actions" style="justify-content:space-between;margin-bottom:16px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <select class="input" style="width:auto;min-width:210px;" onchange="App.selectedAdminGameId=this.value;App.renderAdmin()">
              ${this.state.games.map(g => `<option value="${g.id}" ${g.id === game?.id ? "selected" : ""}>${this.esc(g.name)}</option>`).join("")}
            </select>
            <button class="btn btn-primary btn-sm" onclick="App.addGame()">+ Nuevo Juego</button>
          </div>
          ${game ? `<button class="btn btn-danger btn-sm" onclick="App.deleteGame('${game.id}')">Eliminar Juego</button>` : ""}
        </div>

        ${game ? `
          <div class="admin-card">
            <h4>Datos e Imagen del Juego</h4>
            <div class="admin-grid-2">
              <div>
                <label class="field-label">Nombre del juego</label>
                <input class="input" value="${this.esc(game.name)}" onchange="App.updateGameField('${game.id}','name',this.value)" />
                <label class="field-label">Subtítulo</label>
                <input class="input" value="${this.esc(game.subtitle)}" onchange="App.updateGameField('${game.id}','subtitle',this.value)" />
                <label class="field-label">Etiqueta</label>
                <input class="input" value="${this.esc(game.tag)}" onchange="App.updateGameField('${game.id}','tag',this.value)" />
              </div>
              <div>
                <label class="field-label">Portada (Galería R2 o URL)</label>
                <div class="img-preview-row">
                  <img class="img-preview" src="${this.esc(game.image)}" onerror="App.imgFallback(this,'IMG')" />
                  <label class="btn btn-primary btn-sm" style="cursor:pointer;white-space:nowrap;">
                    📁 Galería
                    <input type="file" accept="image/*" style="display:none;" onchange="App.handleAdminImageUpload(this,'game','${game.id}')" />
                  </label>
                  <input class="input" value="${this.esc(game.image)}" onchange="App.updateGameField('${game.id}','image',this.value.trim())" />
                </div>
                <label class="field-label">Nombre del campo ID</label>
                <input class="input" value="${this.esc(game.idLabel)}" onchange="App.updateGameField('${game.id}','idLabel',this.value)" />
                <label class="checkbox-card" style="margin-top:12px;">
                  <input type="checkbox" ${game.needsZone ? "checked" : ""} onchange="App.updateGameField('${game.id}','needsZone',this.checked)" />
                  <span>Pedir también Zone ID / Servidor</span>
                </label>
              </div>
            </div>
          </div>

          <div class="admin-card">
            <div class="row-actions" style="justify-content:space-between;margin-bottom:12px;">
              <h4>Paquetes de ${this.esc(game.name)}</h4>
              <button class="btn btn-primary btn-sm" onclick="App.addPackage('${game.id}')">+ Agregar Paquete</button>
            </div>
            ${game.packages.map(p => `
              <div class="admin-card" style="background:rgba(255,255,255,0.02);">
                <div class="admin-grid-2">
                  <div>
                    <label class="field-label">Nombre del paquete</label>
                    <input class="input" value="${this.esc(p.name)}" onchange="App.updatePackage('${game.id}','${p.id}','name',this.value)" />
                    <label class="field-label">Precio (USD)</label>
                    <input type="number" step="0.01" class="input" value="${p.priceUsd}" onchange="App.updatePackage('${game.id}','${p.id}','priceUsd',parseFloat(this.value)||0)" />
                  </div>
                  <div>
                    <label class="field-label">Imagen del Paquete (Galería R2 o URL)</label>
                    <div class="img-preview-row">
                      <img class="img-preview" src="${this.esc(p.image)}" onerror="App.imgFallback(this,'PKG')" />
                      <label class="btn btn-primary btn-sm" style="cursor:pointer;white-space:nowrap;">
                        📁 Galería
                        <input type="file" accept="image/*" style="display:none;" onchange="App.handleAdminImageUpload(this,'package','${game.id}','${p.id}')" />
                      </label>
                      <input class="input" value="${this.esc(p.image)}" onchange="App.updatePackage('${game.id}','${p.id}','image',this.value.trim())" />
                    </div>
                    <div style="margin-top:12px;text-align:right;">
                      <button class="btn btn-danger btn-sm" onclick="App.deletePackage('${game.id}','${p.id}')">Eliminar Paquete</button>
                    </div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}
      `;
    } else if (this.adminTab === "news") {
      const ed = this.newsEditor;
      box.innerHTML = `
        <div class="admin-card">
          <div class="row-actions" style="justify-content:space-between;margin-bottom:10px;">
            <h4>${ed.id ? "Editar Noticia / Anuncio" : "Publicar Nueva Noticia / Anuncio"}</h4>
            ${ed.id ? `<button type="button" class="btn btn-outline btn-sm" onclick="App.resetNewsEditor()">Cancelar Edición</button>` : ""}
          </div>

          <form onsubmit="App.submitAdminNews(event)">
            <div class="admin-grid-2">
              <div>
                <label class="field-label">Título *</label>
                <input class="input" required value="${this.esc(ed.title)}"
                  oninput="App.newsEditor.title = this.value" placeholder="Ej: Nuevo torneo de Free Fire" />

                <label class="field-label">Etiqueta</label>
                <input class="input" maxlength="24" value="${this.esc(ed.tag)}"
                  oninput="App.newsEditor.tag = this.value" placeholder="Anuncio, Oferta, Torneo..." />

                <label class="checkbox-card" style="margin-top:12px;">
                  <input type="checkbox" ${ed.pinned ? "checked" : ""} onchange="App.newsEditor.pinned = this.checked" />
                  <span>📌 Fijar arriba de todas las noticias</span>
                </label>
              </div>

              <div>
                <label class="field-label">Imagen opcional (Galería R2 o URL)</label>
                <div class="img-preview-row">
                  ${ed.image_url ? `<img class="img-preview" src="${this.esc(ed.image_url)}" onerror="App.imgFallback(this,'NEWS')" />` : ""}
                  <label class="btn btn-primary btn-sm" style="cursor:pointer;white-space:nowrap;">
                    📁 Galería
                    <input type="file" accept="image/*" style="display:none;" onchange="App.handleAdminImageUpload(this,'news')" />
                  </label>
                  <input class="input" value="${this.esc(ed.image_url)}"
                    oninput="App.newsEditor.image_url = this.value" placeholder="Opcional: URL de imagen" />
                </div>

                <label class="field-label">Contenido del anuncio *</label>
                <textarea rows="4" class="input" required oninput="App.newsEditor.content = this.value" placeholder="Escribe los detalles de la noticia...">${this.esc(ed.content)}</textarea>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:14px;">
              <button type="submit" class="btn btn-primary" ${ed.saving ? "disabled" : ""}>
                ${ed.saving ? "Guardando..." : ed.id ? "Guardar Cambios" : "Publicar Noticia"}
              </button>
            </div>
          </form>
        </div>

        <h4 style="margin:18px 0 10px;">Noticias Publicadas (${this.newsList.length})</h4>
        ${this.newsList.length ? this.newsList.map(n => `
          <div class="admin-card order-card">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              ${n.image_url ? `<img class="img-preview" src="${this.esc(n.image_url)}" onerror="App.imgFallback(this,'NEWS')" />` : ""}
              <div>
                <strong>${n.pinned ? "📌 " : ""}${this.esc(n.title)}</strong>
                <div class="muted" style="font-size:0.8rem;">${this.esc(n.tag)} • ${this.formatDate(n.created_at)} • 💬 ${n.comments_count || 0} comentarios</div>
                <p class="muted" style="font-size:0.84rem;margin-top:6px;">${this.esc(n.content).slice(0, 140)}${n.content.length > 140 ? "..." : ""}</p>
              </div>
            </div>
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="App.editAdminNews('${n.id}')">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="App.deleteAdminNews('${n.id}')">Eliminar</button>
            </div>
          </div>
        `).join("") : `<p class="muted">Aún no has publicado noticias.</p>`}
      `;
    } else if (this.adminTab === "payments") {
      box.innerHTML = `
        <div class="admin-grid-2" style="margin-bottom:16px;">
          <div class="admin-card" style="margin:0;">
            <h4>Tasa de cambio (Bs por 1 USD)</h4>
            <input type="number" step="0.01" class="input" style="margin-top:8px;" value="${this.state.config.bsRate}"
              onchange="App.state.config.bsRate=parseFloat(this.value)||1;App.applyAppearance();App.saveStoreRemote('Tasa actualizada');" />
          </div>
          <div class="admin-card" style="margin:0;">
            <h4>WhatsApp de Recepción (sin +)</h4>
            <input type="text" class="input" style="margin-top:8px;" value="${this.esc(this.state.config.whatsappNumber || '584125891414')}"
              onchange="App.state.config.whatsappNumber=this.value.replace(/\\D/g,'');App.saveStoreRemote('WhatsApp actualizado');" />
          </div>
        </div>

        <div class="row-actions" style="justify-content:space-between;margin:16px 0 12px;">
          <h4>Métodos de Pago</h4>
          <button class="btn btn-primary btn-sm" onclick="App.addPayment()">+ Nuevo Método</button>
        </div>

        ${this.state.payments.map(m => `
          <div class="admin-card">
            <div class="admin-grid-2">
              <div>
                <label class="field-label">Nombre</label>
                <input class="input" value="${this.esc(m.name)}" onchange="App.updatePayment('${m.id}','name',this.value)" />
                <label class="field-label">Moneda</label>
                <select class="input" onchange="App.updatePayment('${m.id}','currency',this.value)">
                  <option value="VES" ${m.currency === "VES" ? "selected" : ""}>Bolívares (VES)</option>
                  <option value="USD" ${m.currency === "USD" ? "selected" : ""}>Dólares (USD)</option>
                </select>
                <label class="checkbox-card">
                  <input type="checkbox" ${m.active ? "checked" : ""} onchange="App.updatePayment('${m.id}','active',this.checked)" />
                  <span>Activo en la tienda</span>
                </label>
              </div>
              <div>
                <label class="field-label">Datos de pago que verá el cliente</label>
                <textarea rows="4" class="input" onchange="App.updatePayment('${m.id}','details',this.value)">${this.esc(m.details)}</textarea>
                <div style="margin-top:10px;text-align:right;">
                  <button class="btn btn-danger btn-sm" onclick="App.deletePayment('${m.id}')">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      `;
    } else if (this.adminTab === "promos") {
      const f = this.promoForm;
      box.innerHTML = `
        <div class="admin-card">
          <h4>Crear Código de Descuento o Referido</h4>
          <p class="hint" style="margin-bottom:10px;">El conteo de usos y ventas de cada código solo es visible aquí dentro del Panel de Administrador.</p>
          <form onsubmit="App.createAdminPromo(event)">
            <div class="admin-grid-2">
              <div>
                <label class="field-label">Código (letras/números sin espacios) *</label>
                <input class="input" required maxlength="24" value="${this.esc(f.code)}"
                  oninput="App.promoForm.code = this.value.toUpperCase()" placeholder="Ej: NOIR10" />

                <label class="field-label">Propietario / Referido (opcional)</label>
                <input class="input" maxlength="60" value="${this.esc(f.owner_name)}"
                  oninput="App.promoForm.owner_name = this.value" placeholder="Ej: Streamer Juan / Promo Navidad" />
              </div>

              <div>
                <div class="admin-grid-2" style="gap:10px;">
                  <div>
                    <label class="field-label">Tipo de descuento</label>
                    <select class="input" onchange="App.promoForm.discount_type = this.value">
                      <option value="percent" ${f.discount_type === "percent" ? "selected" : ""}>Porcentaje (%)</option>
                      <option value="fixed" ${f.discount_type === "fixed" ? "selected" : ""}>Monto fijo ($ USD)</option>
                    </select>
                  </div>
                  <div>
                    <label class="field-label">Valor (0 = solo referido)</label>
                    <input type="number" step="0.01" min="0" class="input" value="${f.discount_value}"
                      oninput="App.promoForm.discount_value = this.value" placeholder="0" />
                  </div>
                </div>

                <label class="field-label">Límite máximo de usos (vacío = ilimitado)</label>
                <input type="number" min="1" class="input" value="${this.esc(f.max_uses)}"
                  oninput="App.promoForm.max_uses = this.value" placeholder="Ilimitado" />
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:14px;">
              <button type="submit" class="btn btn-primary" ${f.saving ? "disabled" : ""}>
                ${f.saving ? "Creando..." : "+ Crear Código"}
              </button>
            </div>
          </form>
        </div>

        <h4 style="margin:18px 0 10px;">Códigos Registrados (${this.adminPromos.length})</h4>
        ${this.adminPromos.length ? this.adminPromos.map(p => {
          const discLabel = Number(p.discount_value || 0) > 0
            ? (p.discount_type === "fixed" ? `-${this.formatUsd(p.discount_value)}` : `-${Number(p.discount_value)}%`)
            : "Solo referido (0%)";
          return `
            <div class="admin-card order-card">
              <div style="flex:1;min-width:240px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <strong style="font-family:'Orbitron',sans-serif;color:var(--accent);font-size:1.05rem;">${this.esc(p.code)}</strong>
                  <span class="badge">${discLabel}</span>
                  <span class="status-pill ${p.active ? "status-Completado" : "status-Rechazado"}">${p.active ? "Activo" : "Pausado"}</span>
                </div>
                ${p.owner_name ? `<div class="muted" style="font-size:0.84rem;margin-top:4px;">Propietario: <strong>${this.esc(p.owner_name)}</strong></div>` : ""}
                <div class="promo-stats-grid">
                  <div class="promo-stat-chip"><span>Completados</span><strong>${p.completed_uses}</strong></div>
                  <div class="promo-stat-chip"><span>Pendientes</span><strong>${p.pending_uses}</strong></div>
                  <div class="promo-stat-chip"><span>Usos totales</span><strong>${p.total_uses}${p.max_uses ? ` / ${p.max_uses}` : ""}</strong></div>
                  <div class="promo-stat-chip"><span>Ventas</span><strong style="color:var(--accent)">${this.formatUsd(p.total_sales_usd)}</strong></div>
                  <div class="promo-stat-chip"><span>Descontado</span><strong>${this.formatUsd(p.total_discount_usd)}</strong></div>
                </div>
              </div>
              <div class="row-actions">
                <button class="btn btn-outline btn-sm" onclick="App.toggleAdminPromo('${p.id}', ${!p.active})">
                  ${p.active ? "Pausar" : "Activar"}
                </button>
                <button class="btn btn-danger btn-sm" onclick="App.deleteAdminPromo('${p.id}')">Eliminar</button>
              </div>
            </div>
          `;
        }).join("") : `<p class="muted">Todavía no has creado códigos de descuento o referidos.</p>`}
      `;
    } else if (this.adminTab === "orders") {
      if (!this.adminOrders.length) {
        box.innerHTML = `<p class="muted">Todavía no hay pedidos registrados en la base de datos.</p>`;
        return;
      }
      box.innerHTML = this.adminOrders.map(o => `
        <div class="admin-card order-card">
          <div>
            <strong>${this.esc(o.code)} — ${this.esc(o.game_name)} (${this.esc(o.package_name)})</strong>
            <div class="muted" style="font-size:0.84rem;">
              Cliente: ${this.esc(o.user_name)} (${this.esc(o.user_email)}) • ID: <strong>${this.esc(o.player_id)}${o.zone_id ? ` (${this.esc(o.zone_id)})` : ""}</strong>
            </div>
            <div class="muted" style="font-size:0.84rem;">
              Pago: ${this.esc(o.payment_name)} • Ref: <strong>${this.esc(o.reference)}</strong> • Total: ${this.esc(o.amount_display)}
              ${o.promo_code ? ` • 🎟️ <strong>${this.esc(o.promo_code)}</strong>${Number(o.discount_usd || 0) > 0 ? ` (-${this.formatUsd(o.discount_usd)})` : ""}` : ""}
            </div>
            <div class="muted" style="font-size:0.78rem;">${this.formatDate(o.created_at)}</div>
            ${o.receipt_url ? `<a href="${this.esc(o.receipt_url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:8px;">🧾 Ver Comprobante</a>` : ""}
          </div>
          <select class="input" style="width:auto;" onchange="App.updateOrderStatus('${o.id}',this.value)">
            ${["Pendiente", "Procesando", "Completado", "Rechazado"].map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
      `).join("");
    } else if (this.adminTab === "namechanges") {
      if (!this.adminNameChanges.length) {
        box.innerHTML = `<p class="muted">No hay solicitudes de cambio de nombre ($5 USD) todavía.</p>`;
        return;
      }
      box.innerHTML = this.adminNameChanges.map(r => `
        <div class="admin-card order-card">
          <div>
            <strong>${this.esc(r.old_name)} → <span style="color:var(--accent)">${this.esc(r.new_name)}</span></strong>
            <div class="muted" style="font-size:0.84rem;">
              Correo: ${this.esc(r.user_email || "")} • Pago: ${this.esc(r.payment_name)} • Ref: <strong>${this.esc(r.reference)}</strong> • ${this.esc(r.amount_display)}
            </div>
            <div class="muted" style="font-size:0.78rem;">${this.formatDate(r.created_at)}</div>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              ${r.receipt_url ? `<a href="${this.esc(r.receipt_url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🧾 Ver Comprobante</a>` : ""}
              <span class="status-pill status-${r.status}">${r.status}</span>
            </div>
          </div>
          ${r.status === "Pendiente" ? `
            <div class="row-actions">
              <button class="btn btn-primary btn-sm" onclick="App.resolveNameChange('${r.id}', 'Aprobado')">✓ Aprobar</button>
              <button class="btn btn-danger btn-sm" onclick="App.resolveNameChange('${r.id}', 'Rechazado')">✕ Rechazar</button>
            </div>
          ` : ""}
        </div>
      `).join("");
    } else if (this.adminTab === "appearance") {
      const cfg = this.state.config;
      box.innerHTML = `
        <div class="admin-grid-2">
          <div class="admin-card">
            <h4>Fondo de la Página</h4>
            <div class="preset-grid">
              ${this.state.backgroundPresets.map(p => `
                <button class="preset-btn" style="background-image:${p.url ? `url('${p.url}')` : "linear-gradient(135deg,#060912,#111827)"}"
                  onclick="App.setBackground('${p.url}')">${this.esc(p.name)}</button>
              `).join("")}
            </div>

            <label class="field-label">Subir fondo desde galería o pegar URL</label>
            <div class="img-preview-row">
              <label class="btn btn-primary btn-sm" style="cursor:pointer;white-space:nowrap;">
                📁 Galería
                <input type="file" accept="image/*" style="display:none;" onchange="App.handleAdminImageUpload(this,'background')" />
              </label>
              <input class="input" value="${this.esc(cfg.backgroundUrl)}" onchange="App.setBackground(this.value)" />
            </div>

            <label class="field-label">Oscuridad del fondo (${Math.round(cfg.overlayOpacity * 100)}%)</label>
            <input type="range" min="0.3" max="0.96" step="0.02" value="${cfg.overlayOpacity}" style="width:100%"
              oninput="App.state.config.overlayOpacity=parseFloat(this.value);App.applyAppearance();"
              onchange="App.saveStoreRemote('Fondo actualizado');" />

            <label class="field-label">Desenfoque / Blur (${cfg.bgBlur}px)</label>
            <input type="range" min="0" max="14" step="1" value="${cfg.bgBlur}" style="width:100%"
              oninput="App.state.config.bgBlur=parseInt(this.value,10);App.applyAppearance();"
              onchange="App.saveStoreRemote('Blur actualizado');" />

            <label class="field-label">Color Neón Principal</label>
            <input type="color" value="${cfg.accentColor}" style="height:40px;width:80px;background:none;border:none;cursor:pointer;"
              oninput="App.state.config.accentColor=this.value;App.applyAppearance();"
              onchange="App.saveStoreRemote('Color guardado');" />
          </div>

          <div class="admin-card">
            <h4>Seguridad del Administrador</h4>
            <form onsubmit="App.changeAdminPassword(event)">
              <label class="field-label">Nueva contraseña de Administrador</label>
              <input type="password" id="new-admin-pass" class="input" required minlength="4" placeholder="Escribe nueva contraseña" />
              <button type="submit" class="btn btn-primary" style="margin-top:12px;">Guardar Contraseña</button>
            </form>
            <p class="hint" style="margin-top:12px;">La contraseña se encripta con PBKDF2 y se guarda de forma segura en tu base de datos D1.</p>
          </div>
        </div>
      `;
    }
  },

  /* Acciones CRUD Admin */
  async addGame() {
    const id = "game_" + Date.now();
    this.state.games.push({
      id, name: "Nuevo Juego", subtitle: "Recarga directa", tag: "NUEVO",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      needsZone: false, idLabel: "ID de Jugador", zoneLabel: "Zone ID",
      packages: [{ id: "pkg_" + Date.now(), name: "Paquete Inicial", priceUsd: 1.99, image: "" }]
    });
    this.selectedAdminGameId = id;
    await this.saveStoreRemote("Juego creado.");
    this.renderAdmin();
  },

  async updateGameField(gameId, field, value) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g[field] = value;
    await this.saveStoreRemote();
    this.renderAdmin();
  },

  async deleteGame(gameId) {
    if (!confirm("¿Eliminar este juego y todos sus paquetes?")) return;
    this.state.games = this.state.games.filter(g => g.id !== gameId);
    this.selectedAdminGameId = this.state.games[0]?.id || null;
    await this.saveStoreRemote("Juego eliminado.");
    this.renderAdmin();
  },

  async addPackage(gameId) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g.packages.push({ id: "pkg_" + Date.now(), name: "Nuevo Paquete", priceUsd: 2.00, image: g.image });
    await this.saveStoreRemote("Paquete agregado.");
    this.renderAdmin();
  },

  async updatePackage(gameId, pkgId, field, value) {
    const g = this.state.games.find(x => x.id === gameId);
    const p = g?.packages.find(x => x.id === pkgId);
    if (!p) return;
    p[field] = value;
    await this.saveStoreRemote();
    if (field === "image") this.renderAdmin();
  },

  async deletePackage(gameId, pkgId) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g.packages = g.packages.filter(p => p.id !== pkgId);
    await this.saveStoreRemote("Paquete eliminado.");
    this.renderAdmin();
  },

  async addPayment() {
    this.state.payments.push({
      id: "pay_" + Date.now(), name: "Nuevo Método", currency: "USD",
      details: "Escribe aquí tus datos de pago", active: true
    });
    await this.saveStoreRemote("Método agregado.");
    this.renderAdmin();
  },

  async updatePayment(id, field, value) {
    const m = this.state.payments.find(x => x.id === id);
    if (!m) return;
    m[field] = value;
    await this.saveStoreRemote();
  },

  async deletePayment(id) {
    this.state.payments = this.state.payments.filter(x => x.id !== id);
    await this.saveStoreRemote("Método eliminado.");
    this.renderAdmin();
  },

  async updateOrderStatus(orderId, status) {
    try {
      await this.api(`admin/orders/${orderId}`, { method: "PATCH", token: this.adminToken, body: { status } });
      const o = this.adminOrders.find(x => x.id === orderId);
      if (o) o.status = status;
      this.refreshAdminPromos(false);
      this.toast(`Pedido actualizado → ${status}`);
    } catch (err) {
      this.toast(err.message);
    }
  },

  async setBackground(url) {
    this.state.config.backgroundUrl = url.trim();
    this.applyAppearance();
    await this.saveStoreRemote("Fondo actualizado.");
    this.renderAdmin();
  },

  async changeAdminPassword(e) {
    e.preventDefault();
    try {
      const password = document.getElementById("new-admin-pass").value.trim();
      await this.api("admin/password", { method: "POST", token: this.adminToken, body: { password } });
      document.getElementById("new-admin-pass").value = "";
      this.toast("Contraseña actualizada de forma segura.");
    } catch (err) {
      this.toast(err.message);
    }
  }
};

window.App = App;
document.addEventListener("DOMContentLoaded", () => App.init());
