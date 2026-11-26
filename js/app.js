const USER_TOKEN_KEY = "arcan_user_token";
const ADMIN_TOKEN_KEY = "arcan_admin_token";
const NAME_CHANGE_PRICE_USD = 5.0;

const App = {
  state: null,
  currentUser: null,
  userToken: localStorage.getItem(USER_TOKEN_KEY) || null,
  adminToken: sessionStorage.getItem(ADMIN_TOKEN_KEY) || null,
  adminTab: "games",
  selectedAdminGameId: null,
  adminOrders: [],
  adminNameChanges: [],
  pendingGameId: null,

  /* Noticias, comentarios y perfiles públicos */
  newsList: [],
  newsEmojis: ["🔥", "❤️", "🎮", "😮", "👍", "😂"],
  openNewsComments: {},
  newsCommentsCache: {},
  replyState: {},
  publicUsers: [],
  mentionState: {},

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

  /* Perfil propio */
  profileData: {
    requests: [],
    uploadingAvatar: false,
    savingBio: false
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
    reference: "",
    receiptBlob: null,
    receiptPreviewUrl: "",
    submitting: false,
    lastOrder: null
  },

  async init() {
    await Promise.all([this.loadStore(), this.restoreUserSession(), this.loadPublicUsers()]);
    this.applyAppearance();
    this.updateAuthButton();
    this.renderStore();
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
      this.state = await this.api("bootstrap");
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

  renderAvatar(url, name, sizeClass = "avatar-md") {
    const initial = this.esc((name || "?").trim().charAt(0).toUpperCase() || "?");
    if (url) {
      return `<img class="avatar ${sizeClass}" src="${this.esc(url)}" alt="${this.esc(name)}" onerror="this.outerHTML='<div class=\\'avatar avatar-fallback ${sizeClass}\\'>${initial}</div>'" />`;
    }
    return `<div class="avatar avatar-fallback ${sizeClass}">${initial}</div>`;
  },

  toast(msg) {
    const container = document.getElementById("toast-container");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  },

  formatUsd(n) { return `$${Number(n || 0).toFixed(2)}`; },

  formatBs(usd) {
    const total = Number(usd || 0) * Number(this.state?.config?.bsRate || 1);
    return `${total.toFixed(2)} Bs`;
  },

  formatDate(iso) {
    try { return new Date(iso).toLocaleString("es-VE"); } catch { return iso; }
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

  /* ================= NOTICIAS PÚBLICAS, REACCIONES Y COMENTARIOS ================= */
  async loadNews(showToast = false) {
    const feed = document.getElementById("news-feed");
    if (feed && !this.newsList.length) {
      feed.innerHTML = `<div class="glass" style="padding:26px;text-align:center;">Cargando noticias...</div>`;
    }
    try {
      const data = await this.api("news", { token: this.userToken });
      this.newsList = data.news || [];
      if (Array.isArray(data.emojis) && data.emojis.length) this.newsEmojis = data.emojis;
      if (showToast) this.toast("Noticias actualizadas.");
      this.renderNewsFeed();
      if (this.adminTab === "news" && this.adminToken) this.renderAdmin();
    } catch (err) {
      if (feed) feed.innerHTML = `<div class="glass" style="padding:24px;text-align:center;">${this.esc(err.message)}</div>`;
    }
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

    feed.innerHTML = this.newsList.map(n => {
      const commentsOpen = Boolean(this.openNewsComments[n.id]);
      const reactionsHtml = this.newsEmojis.map(emoji => {
        const info = n.reactions?.[emoji] || { count: 0, reacted: false };
        return `
          <button class="reaction-btn ${info.reacted ? "active" : ""}" onclick="App.toggleReaction('${n.id}', '${emoji}')">
            <span>${emoji}</span>
            <span class="reaction-count">${info.count}</span>
          </button>
        `;
      }).join("");

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
            <div class="reactions-row">${reactionsHtml}</div>
            <button class="btn btn-outline btn-sm" onclick="App.toggleComments('${n.id}')">
              💬 Comentarios (${n.comments_count || 0})
            </button>
          </div>

          ${commentsOpen ? `<div class="comments-section" id="comments-box-${n.id}">${this.renderCommentsHtml(n.id)}</div>` : ""}
        </article>
      `;
    }).join("");
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
      if (item) item.reactions = reactions;
      this.renderNewsFeed();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async toggleComments(newsId) {
    const isOpen = Boolean(this.openNewsComments[newsId]);
    if (isOpen) {
      delete this.openNewsComments[newsId];
      this.renderNewsFeed();
      return;
    }

    this.openNewsComments[newsId] = true;
    this.renderNewsFeed();

    if (!this.publicUsers.length) await this.loadPublicUsers();
    await this.loadComments(newsId);
  },

  async loadComments(newsId) {
    try {
      const { comments } = await this.api(`news/${newsId}/comments`);
      this.newsCommentsCache[newsId] = comments || [];
      const item = this.newsList.find(n => n.id === newsId);
      if (item) item.comments_count = (comments || []).length;
      this.renderNewsFeed();
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

  renderCommentItem(c, newsId, isReply = false) {
    const canDelete = Boolean(
      (this.currentUser && this.currentUser.id === c.user_id) || this.adminToken
    );

    return `
      <div class="comment-item ${isReply ? "comment-reply" : ""}">
        <button type="button" class="avatar-btn" onclick="App.openPublicProfile('${c.user_id}')">
          ${this.renderAvatar(c.user_avatar, c.user_name, isReply ? "avatar-xs" : "avatar-sm")}
        </button>
        <div class="comment-body">
          <div class="comment-meta">
            <button type="button" class="comment-author" onclick="App.openPublicProfile('${c.user_id}')">
              ${this.esc(c.user_name)}
            </button>
            ${c.reply_to_name ? `<span class="reply-badge">↳ @${this.esc(c.reply_to_name)}</span>` : ""}
            <span class="muted comment-time">${this.formatDate(c.created_at)}</span>
          </div>
          <div class="comment-text">${this.formatCommentContent(c.content)}</div>
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
    `;
  },

  renderCommentsHtml(newsId) {
    const comments = this.newsCommentsCache[newsId];
    if (!comments) {
      return `<p class="muted" style="padding:10px 0;font-size:0.86rem;">Cargando comentarios...</p>`;
    }

    const roots = comments.filter(c => !c.parent_id);
    const repliesMap = {};
    for (const c of comments) {
      if (c.parent_id) {
        if (!repliesMap[c.parent_id]) repliesMap[c.parent_id] = [];
        repliesMap[c.parent_id].push(c);
      }
    }

    const replyTarget = this.replyState[newsId];
    const listHtml = roots.length
      ? roots.map(root => `
          <div class="comment-thread">
            ${this.renderCommentItem(root, newsId, false)}
            ${(repliesMap[root.id] || []).map(rep => this.renderCommentItem(rep, newsId, true)).join("")}
          </div>
        `).join("")
      : `<p class="muted" style="font-size:0.86rem;margin-bottom:12px;">Sé el primero en comentar esta noticia.</p>`;

    const composerHtml = this.currentUser
      ? `
        <div class="comment-composer">
          ${replyTarget ? `
            <div class="reply-banner">
              <span>Respondiendo a <strong>@${this.esc(replyTarget.replyToName)}</strong></span>
              <button type="button" class="text-btn" onclick="App.cancelReply('${newsId}')">✕ Cancelar</button>
            </div>
          ` : ""}
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
      <div class="comments-list">${listHtml}</div>
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
    this.renderNewsFeed();
    setTimeout(() => {
      const input = document.getElementById(`comment-input-${newsId}`);
      if (input) {
        if (!input.value.includes(`@${userName}`)) {
          input.value = `@${userName} ${input.value}`;
        }
        input.focus();
      }
    }, 30);
  },

  cancelReply(newsId) {
    delete this.replyState[newsId];
    this.renderNewsFeed();
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
        ${this.renderAvatar(u.avatar_url, u.name, "avatar-xs")}
        <span>${this.esc(u.name)}</span>
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
      this.newsCommentsCache[newsId].push(comment);
      const item = this.newsList.find(n => n.id === newsId);
      if (item) item.comments_count = (item.comments_count || 0) + 1;
      delete this.replyState[newsId];
      this.renderNewsFeed();
      this.toast("Comentario publicado.");
    } catch (err) {
      this.toast(err.message);
    }
  },

  async deleteComment(newsId, commentId) {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      const useAdmin = Boolean(this.adminToken && (!this.currentUser || this.newsCommentsCache[newsId]?.find(c => c.id === commentId)?.user_id !== this.currentUser.id));
      const endpoint = useAdmin ? `admin/comments/${commentId}` : `news/comments/${commentId}`;
      const token = useAdmin ? this.adminToken : this.userToken;

      await this.api(endpoint, { method: "DELETE", token });
      await this.loadComments(newsId);
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
      box.innerHTML = `
        <div class="public-profile-card">
          ${this.renderAvatar(user.avatar_url, user.name, "avatar-lg")}
          <h3 style="margin-top:12px;">${this.esc(user.name)}</h3>
          <p class="public-bio">${user.bio ? this.esc(user.bio) : "<span class='muted'>Sin descripción todavía.</span>"}</p>
          <span class="muted" style="font-size:0.78rem;">Miembro desde ${this.formatDate(user.created_at)}</span>
        </div>
      `;
    } catch (err) {
      box.innerHTML = `<p class="muted" style="text-align:center;padding:20px;">${this.esc(err.message)}</p>`;
    }
  },

  /* ================= MI PERFIL Y CAMBIO DE NOMBRE ($5 USD) ================= */
  async renderProfile() {
    const box = document.getElementById("profile-container");
    if (!box) return;

    if (!this.currentUser || !this.userToken) {
      box.innerHTML = `
        <div class="glass" style="padding:28px;text-align:center;">
          <p class="muted" style="margin-bottom:14px;">Inicia sesión para personalizar tu foto de perfil, tu descripción y tu nombre.</p>
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

  paintProfile() {
    const box = document.getElementById("profile-container");
    const u = this.currentUser;
    if (!box || !u) return;

    const pendingReq = this.profileData.requests.find(r => r.status === "Pendiente");

    box.innerHTML = `
      <div class="glass profile-card">
        <div class="profile-top">
          <div class="profile-avatar-col">
            ${this.renderAvatar(u.avatar_url, u.name, "avatar-xl")}
            <label class="btn btn-outline btn-sm" style="cursor:pointer;margin-top:10px;">
              ${this.profileData.uploadingAvatar ? "Subiendo..." : "📷 Cambiar Foto (Gratis)"}
              <input type="file" accept="image/*" style="display:none;" onchange="App.handleAvatarUpload(this)" ${this.profileData.uploadingAvatar ? "disabled" : ""} />
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

            <label class="field-label" style="margin-top:16px;">Descripción / Bio (Gratis, máx. 240 caracteres)</label>
            <textarea id="profile-bio-input" rows="3" maxlength="240" class="input" placeholder="Cuéntale a la comunidad qué juegos juegas o tu clan...">${this.esc(u.bio || "")}</textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:10px;">
              <button class="btn btn-primary btn-sm" onclick="App.saveProfileBio()" ${this.profileData.savingBio ? "disabled" : ""}>
                ${this.profileData.savingBio ? "Guardando..." : "Guardar Descripción"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass profile-card" style="margin-top:18px;">
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

  async handleAvatarUpload(inputEl) {
    const file = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return this.toast("Selecciona una imagen válida.");

    this.profileData.uploadingAvatar = true;
    this.paintProfile();

    try {
      const blob = await this.compressToBlob(file, 450, 0.85);
      const url = await this.uploadImageToR2(blob, "avatars", this.userToken);
      const { user } = await this.api("profile", {
        method: "PATCH",
        token: this.userToken,
        body: { avatar_url: url }
      });
      this.currentUser = user;
      this.updateAuthButton();
      this.loadPublicUsers();
      this.toast("Foto de perfil actualizada.");
    } catch (err) {
      this.toast(err.message);
    } finally {
      this.profileData.uploadingAvatar = false;
      inputEl.value = "";
      this.paintProfile();
    }
  },

  async saveProfileBio() {
    const bio = (document.getElementById("profile-bio-input")?.value || "").trim();
    this.profileData.savingBio = true;
    this.paintProfile();

    try {
      const { user } = await this.api("profile", {
        method: "PATCH",
        token: this.userToken,
        body: { bio }
      });
      this.currentUser = user;
      this.loadPublicUsers();
      this.toast("Descripción guardada.");
    } catch (err) {
      this.toast(err.message);
    } finally {
      this.profileData.savingBio = false;
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

  /* ================= CHECKOUT (LOGIN OBLIGATORIO + CAPTURA + WHATSAPP) ================= */
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

      const totalDisplay = selectedPay?.currency === "VES"
        ? `${this.formatBs(pkg.priceUsd)} (${this.formatUsd(pkg.priceUsd)})`
        : this.formatUsd(pkg.priceUsd);

      body.innerHTML = `
        <h4>Paso 3: Realiza el pago y sube tu comprobante</h4>
        <p class="muted" style="font-size:0.86rem;">Paquete: <strong>${this.esc(pkg.name)}</strong> — Total: <strong style="color:var(--accent)">${totalDisplay}</strong></p>

        <div class="pay-methods">
          ${activePayments.map(m => `
            <button class="pay-option ${m.id === c.paymentId ? "selected" : ""}" onclick="App.selectPayment('${m.id}')">
              <strong>${this.esc(m.name)}</strong>
              <div class="muted" style="font-size:0.78rem;">Moneda: ${m.currency}</div>
            </button>
          `).join("")}
        </div>

        ${selectedPay ? `
          <div class="pay-details-box">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>Datos para ${this.esc(selectedPay.name)}:</strong>
              <button class="btn btn-outline btn-sm" onclick="App.copyPaymentDetails('${selectedPay.id}')">Copiar datos</button>
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
          <button class="btn btn-outline" onclick="App.setCheckoutStep(2)" ${c.submitting ? "disabled" : ""}>← Atrás</button>
          <button class="btn btn-primary" onclick="App.submitOrder()" ${c.submitting ? "disabled" : ""}>
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
    this.checkout.packageId = pkgId;
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
      btn.innerHTML = `<span class="nav-user-pill">${this.renderAvatar(this.currentUser.avatar_url, this.currentUser.name, "avatar-nav")} <span>${this.esc(this.currentUser.name)}</span></span>`;
    } else {
      btn.textContent = "Iniciar Sesión";
    }
  },

  openAuthModal(mode = "login", fromCheckout = false) {
    const box = document.getElementById("auth-modal-content");
    if (this.currentUser) {
      box.innerHTML = `
        <div style="text-align:center;margin-bottom:16px;">
          ${this.renderAvatar(this.currentUser.avatar_url, this.currentUser.name, "avatar-lg")}
          <h3 style="margin-top:10px;">${this.esc(this.currentUser.name)}</h3>
          <p class="muted" style="font-size:0.86rem;">${this.esc(this.currentUser.email)}</p>
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
  },

  logout() {
    this.userToken = null;
    this.currentUser = null;
    localStorage.removeItem(USER_TOKEN_KEY);
    this.updateAuthButton();
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
    else if (tab === "news") this.loadNews();
    else this.renderAdmin();
  },

  async refreshAdminData(showToast = true) {
    if (!this.adminToken) return;
    await Promise.all([
      this.refreshAdminOrders(false),
      this.refreshAdminNameChanges(false),
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
        this.toast("Noticia publicada.");
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
