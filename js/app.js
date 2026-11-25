const STORAGE_KEY = "arcanstore_state_v1";
const USERS_KEY = "arcanstore_users_v1";
const SESSION_KEY = "arcanstore_session_v1";

const App = {
  state: null,
  users: [],
  currentUser: null,
  isAdminUnlocked: false,
  adminTab: "games",
  selectedAdminGameId: null,

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
    lastOrder: null
  },

  init() {
    this.loadState();
    this.applyAppearance();
    this.updateAuthButton();
    this.renderStore();
  },

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.state = saved ? JSON.parse(saved) : structuredClone(window.ARCAN_DEFAULT_DATA);
    } catch {
      this.state = structuredClone(window.ARCAN_DEFAULT_DATA);
    }

    try {
      this.users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      this.currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      this.users = [];
      this.currentUser = null;
    }

    if (!this.selectedAdminGameId && this.state.games.length) {
      this.selectedAdminGameId = this.state.games[0].id;
    }
  },

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
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
    setTimeout(() => el.remove(), 3200);
  },

  formatUsd(n) {
    return `$${Number(n || 0).toFixed(2)}`;
  },

  formatBs(usd) {
    const total = Number(usd || 0) * Number(this.state.config.bsRate || 1);
    return `${total.toFixed(2)} Bs`;
  },

  applyAppearance() {
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
    if (viewName === "admin" && !this.isAdminUnlocked) {
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

  openModal(id) {
    document.getElementById(id).classList.add("open");
  },

  closeModal(id) {
    document.getElementById(id).classList.remove("open");
  },

  /* ================= TIENDA ================= */
  renderStore() {
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

  /* ================= CHECKOUT (4 PASOS) ================= */
  startCheckout(gameId) {
    const game = this.state.games.find(g => g.id === gameId);
    if (!game) return;

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
        <p class="muted" style="font-size:0.86rem;margin-top:4px;">Verifica bien los números antes de continuar.</p>

        <label class="field-label">${this.esc(game.idLabel || "ID de Jugador")} *</label>
        <input type="text" id="chk-player-id" class="input" value="${this.esc(c.playerId)}" placeholder="Ej: 318948769" />

        ${game.needsZone ? `
          <label class="field-label">${this.esc(game.zoneLabel || "Zone ID")} *</label>
          <input type="text" id="chk-zone-id" class="input" value="${this.esc(c.zoneId)}" placeholder="Ej: 1002" />
        ` : ""}

        <label class="field-label">Nombre en el juego (opcional, para tu tranquilidad)</label>
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
        ? this.formatBs(pkg.priceUsd)
        : this.formatUsd(pkg.priceUsd);

      body.innerHTML = `
        <h4>Paso 3: Realiza el pago</h4>
        <p class="muted" style="font-size:0.86rem;">Paquete: <strong>${this.esc(pkg.name)}</strong> — Total a pagar: <strong style="color:var(--accent)">${totalDisplay}</strong></p>

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
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>Datos para ${this.esc(selectedPay.name)}:</strong>
              <button class="btn btn-outline btn-sm" onclick="App.copyText(\`${this.esc(selectedPay.details)}\`)">Copiar datos</button>
            </div>
            <pre>${this.esc(selectedPay.details)}</pre>
          </div>
        ` : ""}

        <label class="field-label">Número de referencia / comprobante *</label>
        <input type="text" id="chk-reference" class="input" value="${this.esc(c.reference)}" placeholder="Últimos dígitos o ID de transacción" />

        ${!this.currentUser ? `<p class="hint">Inicia sesión para guardar este pedido en tu cuenta, o continúa como invitado.</p>` : ""}

        <div class="checkout-actions">
          <button class="btn btn-outline" onclick="App.setCheckoutStep(2)">← Atrás</button>
          <button class="btn btn-primary" onclick="App.submitOrder()">Confirmar Recarga ✓</button>
        </div>
      `;
    } else if (c.step === 4) {
      const o = c.lastOrder;
      body.innerHTML = `
        <div style="text-align:center;padding:10px 0;">
          <div style="font-size:2.4rem;">✅</div>
          <h3 style="margin:8px 0;">¡Pedido registrado!</h3>
          <p class="muted">Código de orden: <strong style="color:var(--accent)">${o.code}</strong></p>
        </div>
        <div class="pay-details-box" style="margin-top:14px;">
          <div><strong>Juego:</strong> ${this.esc(o.gameName)}</div>
          <div><strong>ID Cuenta:</strong> ${this.esc(o.playerId)}${o.zoneId ? ` (${this.esc(o.zoneId)})` : ""}</div>
          <div><strong>Paquete:</strong> ${this.esc(o.packageName)}</div>
          <div><strong>Método:</strong> ${this.esc(o.paymentName)} — Ref: ${this.esc(o.reference)}</div>
          <div><strong>Total:</strong> ${this.esc(o.amountDisplay)}</div>
          <div><strong>Estado:</strong> <span class="status-pill status-${o.status}">${o.status}</span></div>
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
    if (!confirmed) return this.toast("Marca la casilla de confirmación de ID.");

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

  submitOrder() {
    const ref = document.getElementById("chk-reference").value.trim();
    if (!ref) return this.toast("Ingresa el número de referencia del pago.");

    const game = this.state.games.find(g => g.id === this.checkout.gameId);
    const pkg = game.packages.find(p => p.id === this.checkout.packageId);
    const pay = this.state.payments.find(p => p.id === this.checkout.paymentId);

    const order = {
      id: "ord_" + Date.now(),
      code: "ARC-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString("es-VE"),
      userEmail: this.currentUser ? this.currentUser.email : "invitado",
      userName: this.currentUser ? this.currentUser.name : "Invitado",
      gameName: game.name,
      playerId: this.checkout.playerId,
      zoneId: this.checkout.zoneId,
      nickname: this.checkout.nickname,
      packageName: pkg.name,
      priceUsd: pkg.priceUsd,
      amountDisplay: pay.currency === "VES" ? this.formatBs(pkg.priceUsd) : this.formatUsd(pkg.priceUsd),
      paymentName: pay.name,
      reference: ref,
      status: "Pendiente"
    };

    this.state.orders.unshift(order);
    this.saveState();
    this.checkout.lastOrder = order;
    this.checkout.step = 4;
    this.renderCheckoutStep();
    this.toast("¡Recarga enviada correctamente!");
  },

  copyText(text) {
    navigator.clipboard?.writeText(text).then(() => this.toast("Datos copiados al portapapeles."));
  },

  /* ================= LOGIN Y HISTORIAL ================= */
  updateAuthButton() {
    const btn = document.getElementById("btn-auth");
    btn.textContent = this.currentUser ? `👤 ${this.currentUser.name}` : "Iniciar Sesión";
  },

  openAuthModal(mode = "login") {
    const box = document.getElementById("auth-modal-content");
    if (this.currentUser) {
      box.innerHTML = `
        <h3>Mi Cuenta</h3>
        <p class="muted" style="margin:8px 0 18px;">Sesión iniciada como <strong>${this.esc(this.currentUser.name)}</strong> (${this.esc(this.currentUser.email)})</p>
        <button class="btn btn-danger full-width" onclick="App.logout()">Cerrar Sesión</button>
      `;
    } else if (mode === "login") {
      box.innerHTML = `
        <h3>Iniciar Sesión</h3>
        <form onsubmit="App.handleLogin(event)">
          <label class="field-label">Correo</label>
          <input type="email" id="auth-email" class="input" required placeholder="tu@correo.com" />
          <label class="field-label">Contraseña</label>
          <input type="password" id="auth-pass" class="input" required placeholder="••••••••" />
          <button type="submit" class="btn btn-primary full-width" style="margin-top:16px;">Entrar</button>
        </form>
        <p class="hint" style="text-align:center;margin-top:14px;">
          ¿No tienes cuenta? <a href="#" style="color:var(--accent)" onclick="event.preventDefault();App.openAuthModal('register')">Regístrate aquí</a>
        </p>
      `;
    } else {
      box.innerHTML = `
        <h3>Crear Cuenta</h3>
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
          ¿Ya tienes cuenta? <a href="#" style="color:var(--accent)" onclick="event.preventDefault();App.openAuthModal('login')">Inicia sesión</a>
        </p>
      `;
    }
    this.openModal("modal-auth");
  },

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-pass").value;

    if (this.users.some(u => u.email === email)) {
      return this.toast("Ese correo ya está registrado.");
    }

    const user = { name, email, password };
    this.users.push(user);
    this.currentUser = { name, email };
    this.saveUsers();
    this.updateAuthButton();
    this.closeModal("modal-auth");
    this.toast(`¡Bienvenido, ${name}!`);
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim().toLowerCase();
    const password = document.getElementById("auth-pass").value;

    const found = this.users.find(u => u.email === email && u.password === password);
    if (!found) return this.toast("Correo o contraseña incorrectos.");

    this.currentUser = { name: found.name, email: found.email };
    this.saveUsers();
    this.updateAuthButton();
    this.closeModal("modal-auth");
    this.toast(`Hola de nuevo, ${found.name}`);
  },

  logout() {
    this.currentUser = null;
    this.saveUsers();
    this.updateAuthButton();
    this.closeModal("modal-auth");
    this.toast("Sesión cerrada.");
    if (document.getElementById("view-history").classList.contains("active")) {
      this.renderHistory();
    }
  },

  renderHistory() {
    const list = document.getElementById("history-list");
    const sub = document.getElementById("history-subtitle");

    const myOrders = this.currentUser
      ? this.state.orders.filter(o => o.userEmail === this.currentUser.email)
      : this.state.orders.filter(o => o.userEmail === "invitado");

    sub.textContent = this.currentUser
      ? `Mostrando recargas de ${this.currentUser.email}`
      : "Mostrando pedidos locales de invitado. Inicia sesión para asociarlos a tu cuenta.";

    if (!myOrders.length) {
      list.innerHTML = `<div class="glass" style="padding:26px;text-align:center;">Aún no tienes recargas registradas.</div>`;
      return;
    }

    list.innerHTML = myOrders.map(o => `
      <div class="glass order-card">
        <div>
          <strong>${this.esc(o.gameName)} — ${this.esc(o.packageName)}</strong>
          <div class="muted" style="font-size:0.84rem;">
            ${o.code} • ID: ${this.esc(o.playerId)}${o.zoneId ? ` (${this.esc(o.zoneId)})` : ""} • ${this.esc(o.paymentName)} (Ref: ${this.esc(o.reference)})
          </div>
          <div class="muted" style="font-size:0.78rem;">${o.date}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;color:var(--accent);margin-bottom:6px;">${this.esc(o.amountDisplay)}</div>
          <span class="status-pill status-${o.status}">${o.status}</span>
        </div>
      </div>
    `).join("");
  },

  /* ================= ADMIN PROTEGIDO ================= */
  requestAdminAccess() {
    if (this.isAdminUnlocked) {
      this.switchView("admin");
      return;
    }
    document.getElementById("admin-pass-input").value = "";
    this.openModal("modal-admin-login");
    setTimeout(() => document.getElementById("admin-pass-input").focus(), 100);
  },

  submitAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById("admin-pass-input").value;
    if (pass === this.state.config.adminPassword) {
      this.isAdminUnlocked = true;
      this.closeModal("modal-admin-login");
      this.switchView("admin");
      this.toast("Panel de administrador desbloqueado.");
    } else {
      this.toast("Contraseña incorrecta.");
    }
  },

  lockAdmin() {
    this.isAdminUnlocked = false;
    this.switchView("store");
    this.toast("Panel de administrador bloqueado.");
  },

  switchAdminTab(tab) {
    this.adminTab = tab;
    document.querySelectorAll(".admin-tabs .tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    this.renderAdmin();
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
                <label class="field-label">Etiqueta (ej: POPULAR, NUEVO)</label>
                <input class="input" value="${this.esc(game.tag)}" onchange="App.updateGameField('${game.id}','tag',this.value)" />
              </div>
              <div>
                <label class="field-label">URL Imagen de Portada</label>
                <div class="img-preview-row">
                  <img class="img-preview" src="${this.esc(game.image)}" onerror="App.imgFallback(this,'IMG')" />
                  <input class="input" value="${this.esc(game.image)}" onchange="App.updateGameField('${game.id}','image',this.value)" />
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
                    <label class="field-label">URL Imagen del Paquete</label>
                    <div class="img-preview-row">
                      <img class="img-preview" src="${this.esc(p.image)}" onerror="App.imgFallback(this,'PKG')" />
                      <input class="input" value="${this.esc(p.image)}" onchange="App.updatePackage('${game.id}','${p.id}','image',this.value)" />
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
        <div class="admin-card">
          <h4>Tasa de cambio (Bolívares por 1 USD)</h4>
          <input type="number" step="0.01" class="input" style="max-width:240px;margin-top:8px;" value="${this.state.config.bsRate}"
            onchange="App.state.config.bsRate=parseFloat(this.value)||1;App.saveState();App.applyAppearance();App.toast('Tasa actualizada');" />
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
      if (!this.state.orders.length) {
        box.innerHTML = `<p class="muted">Todavía no hay pedidos registrados.</p>`;
        return;
      }
      box.innerHTML = this.state.orders.map(o => `
        <div class="admin-card order-card">
          <div>
            <strong>${o.code} — ${this.esc(o.gameName)} (${this.esc(o.packageName)})</strong>
            <div class="muted" style="font-size:0.84rem;">
              Cliente: ${this.esc(o.userName)} (${this.esc(o.userEmail)}) • ID: <strong>${this.esc(o.playerId)}${o.zoneId ? ` (${this.esc(o.zoneId)})` : ""}</strong>
            </div>
            <div class="muted" style="font-size:0.84rem;">
              Pago: ${this.esc(o.paymentName)} • Ref: <strong>${this.esc(o.reference)}</strong> • Total: ${this.esc(o.amountDisplay)}
            </div>
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
            <label class="field-label">URL de imagen de fondo personalizada</label>
            <input class="input" value="${this.esc(cfg.backgroundUrl)}" placeholder="https://..." onchange="App.setBackground(this.value)" />

            <label class="field-label">Oscuridad del fondo (${Math.round(cfg.overlayOpacity * 100)}%)</label>
            <input type="range" min="0.3" max="0.96" step="0.02" value="${cfg.overlayOpacity}" style="width:100%"
              oninput="App.state.config.overlayOpacity=parseFloat(this.value);App.saveState();App.applyAppearance();" />

            <label class="field-label">Desenfoque / Blur (${cfg.bgBlur}px)</label>
            <input type="range" min="0" max="14" step="1" value="${cfg.bgBlur}" style="width:100%"
              oninput="App.state.config.bgBlur=parseInt(this.value,10);App.saveState();App.applyAppearance();" />

            <label class="field-label">Color Neón Principal</label>
            <input type="color" value="${cfg.accentColor}" style="height:40px;width:80px;background:none;border:none;cursor:pointer;"
              oninput="App.state.config.accentColor=this.value;App.saveState();App.applyAppearance();" />
          </div>

          <div class="admin-card">
            <h4>Seguridad y Publicación en GitHub</h4>
            <form onsubmit="App.changeAdminPassword(event)">
              <label class="field-label">Nueva contraseña de Administrador</label>
              <input type="password" id="new-admin-pass" class="input" required minlength="4" placeholder="Escribe nueva contraseña" />
              <button type="submit" class="btn btn-primary" style="margin-top:12px;">Guardar Contraseña</button>
            </form>

            <hr style="border:none;border-top:1px solid var(--border);margin:20px 0;" />
            <p class="muted" style="font-size:0.84rem;margin-bottom:10px;">
              ¿Quieres que tus cambios de precios, imágenes y fondos sean visibles para todos en GitHub Pages? Descarga el archivo actualizado y reemplaza <code>js/data.js</code> en tu repositorio.
            </p>
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="App.downloadDataJs()">⬇ Descargar data.js</button>
              <button class="btn btn-danger btn-sm" onclick="App.resetDefaults()">Restaurar valores iniciales</button>
            </div>
          </div>
        </div>
      `;
    }
  },

  /* Acciones CRUD Admin */
  addGame() {
    const id = "game_" + Date.now();
    this.state.games.push({
      id,
      name: "Nuevo Juego",
      subtitle: "Recarga directa",
      tag: "NUEVO",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "ID de Jugador",
      zoneLabel: "Zone ID",
      packages: [{ id: "pkg_" + Date.now(), name: "Paquete Inicial", priceUsd: 1.99, image: "" }]
    });
    this.selectedAdminGameId = id;
    this.saveState();
    this.renderAdmin();
    this.toast("Juego creado.");
  },

  updateGameField(gameId, field, value) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g[field] = value;
    this.saveState();
    this.renderAdmin();
  },

  deleteGame(gameId) {
    if (!confirm("¿Eliminar este juego y todos sus paquetes?")) return;
    this.state.games = this.state.games.filter(g => g.id !== gameId);
    this.selectedAdminGameId = this.state.games[0]?.id || null;
    this.saveState();
    this.renderAdmin();
    this.toast("Juego eliminado.");
  },

  addPackage(gameId) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g.packages.push({
      id: "pkg_" + Date.now(),
      name: "Nuevo Paquete",
      priceUsd: 2.00,
      image: g.image
    });
    this.saveState();
    this.renderAdmin();
  },

  updatePackage(gameId, pkgId, field, value) {
    const g = this.state.games.find(x => x.id === gameId);
    const p = g?.packages.find(x => x.id === pkgId);
    if (!p) return;
    p[field] = value;
    this.saveState();
    if (field === "image") this.renderAdmin();
  },

  deletePackage(gameId, pkgId) {
    const g = this.state.games.find(x => x.id === gameId);
    if (!g) return;
    g.packages = g.packages.filter(p => p.id !== pkgId);
    this.saveState();
    this.renderAdmin();
  },

  addPayment() {
    this.state.payments.push({
      id: "pay_" + Date.now(),
      name: "Nuevo Método",
      currency: "USD",
      details: "Escribe aquí tus datos de pago",
      active: true
    });
    this.saveState();
    this.renderAdmin();
  },

  updatePayment(id, field, value) {
    const m = this.state.payments.find(x => x.id === id);
    if (!m) return;
    m[field] = value;
    this.saveState();
  },

  deletePayment(id) {
    this.state.payments = this.state.payments.filter(x => x.id !== id);
    this.saveState();
    this.renderAdmin();
  },

  updateOrderStatus(orderId, status) {
    const o = this.state.orders.find(x => x.id === orderId);
    if (!o) return;
    o.status = status;
    this.saveState();
    this.toast(`Pedido ${o.code} → ${status}`);
  },

  setBackground(url) {
    this.state.config.backgroundUrl = url.trim();
    this.saveState();
    this.applyAppearance();
    this.renderAdmin();
  },

  changeAdminPassword(e) {
    e.preventDefault();
    const nextPass = document.getElementById("new-admin-pass").value.trim();
    if (nextPass.length < 4) return;
    this.state.config.adminPassword = nextPass;
    this.saveState();
    document.getElementById("new-admin-pass").value = "";
    this.toast("Contraseña actualizada.");
  },

  downloadDataJs() {
    const exportObj = structuredClone(this.state);
    exportObj.orders = []; // No exportar pedidos privados al archivo público
    const content = `window.ARCAN_DEFAULT_DATA = ${JSON.stringify(exportObj, null, 2)};\n`;
    const blob = new Blob([content], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(a.href);
    this.toast("Archivo data.js descargado.");
  },

  resetDefaults() {
    if (!confirm("¿Restaurar todos los juegos, precios y apariencia a los valores iniciales?")) return;
    localStorage.removeItem(STORAGE_KEY);
    this.loadState();
    this.applyAppearance();
    this.renderAdmin();
    this.toast("Valores restaurados.");
  }
};

window.App = App;
document.addEventListener("DOMContentLoaded", () => App.init());
