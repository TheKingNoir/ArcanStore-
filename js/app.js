const USER_TOKEN_KEY = "arcan_user_token";
const ADMIN_TOKEN_KEY = "arcan_admin_token";

const App = {
  state: null,
  currentUser: null,
  userToken: localStorage.getItem(USER_TOKEN_KEY) || null,
  adminToken: sessionStorage.getItem(ADMIN_TOKEN_KEY) || null,
  adminTab: "games",
  selectedAdminGameId: null,
  adminOrders: [],
  pendingGameId: null,

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
    await Promise.all([this.loadStore(), this.restoreUserSession()]);
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

  esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  imgFallback(img, label) {
    img.onerror = null;
    const text = encodeURIComponent((label || "ARCAN").slice(0, 14));
    img.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230f172a'/><stop offset='100%' stop-color='%231e1b4b'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' fill='%2300e5ff' font-family='sans-serif' font-size='24' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
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
    if (viewName === "history") this.renderHistory();
    if (viewName === "admin") this.renderAdmin();
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
    btn.textContent = this.currentUser ? `👤 ${this.currentUser.name}` : "Iniciar Sesión";
  },

  openAuthModal(mode = "login", fromCheckout = false) {
    const box = document.getElementById("auth-modal-content");
    if (this.currentUser) {
      box.innerHTML = `
        <h3>Mi Cuenta</h3>
        <p class="muted" style="margin:8px 0 18px;">Sesión activa como <strong>${this.esc(this.currentUser.name)}</strong> (${this.esc(this.currentUser.email)})</p>
        <button class="btn btn-danger full-width" onclick="App.logout()">Cerrar Sesión</button>
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
          <input type="text" id="reg-name" class="input" required placeholder="Tu nombre" />
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
      this.closeModal("modal-auth");
      this.toast(`¡Bienvenido, ${data.user.name}!`);
      if (this.pendingGameId) {
        const g = this.pendingGameId;
        this.pendingGameId = null;
        this.startCheckout(g);
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
    else this.renderAdmin();
  },

  async refreshAdminOrders() {
    try {
      const { orders } = await this.api("admin/orders", { token: this.adminToken });
      this.adminOrders = orders;
      this.renderAdmin();
    } catch (err) {
      this.toast(err.message);
    }
  },

  async handleAdminImageUpload(inputEl, target, gameId = null, pkgId = null) {
    const file = inputEl.files?.[0];
    if (!file) return;
    const maxWidth = target === "background" ? 1400 : target === "game" ? 800 : 350;

    try {
      this.toast("Subiendo imagen...");
      const blob = await this.compressToBlob(file, maxWidth, 0.82);
      const url = await this.uploadImageToR2(blob, "catalog", this.adminToken);

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
