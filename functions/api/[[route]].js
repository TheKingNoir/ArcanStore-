const DEFAULT_STORE = {
  config: {
    storeName: "ArcanStore",
    bsRate: 45.5,
    whatsappNumber: "584125891414",
    backgroundUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
    overlayOpacity: 0.82,
    bgBlur: 4,
    accentColor: "#00e5ff"
  },
  backgroundPresets: [
    { name: "Cyber Arena", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80" },
    { name: "Neón Púrpura", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80" },
    { name: "Setup Oscuro", url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1600&q=80" },
    { name: "Fondo Sólido", url: "" }
  ],
  payments: [
    {
      id: "pagomovil",
      name: "Pago Móvil",
      currency: "VES",
      details: "Banco: Venezuela (0102)\nC.I: 30.160.921\nTLF: 04125891414",
      active: true
    },
    {
      id: "binance",
      name: "Binance Pay",
      currency: "USD",
      details: "Binance ID: 582632586\nMoneda: USDT",
      active: true
    },
    {
      id: "paypal",
      name: "PayPal",
      currency: "USD",
      details: "Enlace: https://paypal.me/noir0221\nUsuario: paypal.me/noir0221",
      active: true
    },
    {
      id: "zinli",
      name: "Zinli",
      currency: "USD",
      details: "Correo Zinli: ero02sennin21@gmail.com",
      active: true
    }
  ],
  games: [
    {
      id: "mlbb",
      name: "Mobile Legends",
      subtitle: "Bang Bang • Diamantes Directos",
      tag: "POPULAR",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      needsZone: true,
      idLabel: "User ID",
      zoneLabel: "Zone ID",
      packages: [
        { id: "ml1", name: "86 Diamantes", priceUsd: 1.80, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml2", name: "172 Diamantes", priceUsd: 3.50, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml3", name: "257 Diamantes", priceUsd: 5.20, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml4", name: "Pase Semanal", priceUsd: 2.20, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "freefire",
      name: "Free Fire",
      subtitle: "Garena • Diamantes por ID",
      tag: "TOP VENTAS",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "ID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "ff1", name: "100 + 10 Diamantes", priceUsd: 1.20, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff2", name: "310 + 31 Diamantes", priceUsd: 3.40, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff3", name: "520 + 52 Diamantes", priceUsd: 5.50, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff4", name: "Tarjeta Semanal", priceUsd: 2.10, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "codm",
      name: "COD Mobile",
      subtitle: "Activision • CP Oficiales",
      tag: "RÁPIDO",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "UID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "cod1", name: "80 CP", priceUsd: 1.30, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "cod2", name: "420 CP", priceUsd: 5.40, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "cod3", name: "880 CP", priceUsd: 10.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "bloodstrike",
      name: "Blood Strike",
      subtitle: "NetEase • Oro Directo",
      tag: "NUEVO",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "ID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "bs1", name: "100 Oro", priceUsd: 1.25, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "bs2", name: "300 + 20 Oro", priceUsd: 3.60, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "bs3", name: "500 + 40 Oro", priceUsd: 5.80, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "roblox",
      name: "Roblox",
      subtitle: "Tarjetas & Robux",
      tag: "FAVORITO",
      image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "Usuario de Roblox",
      zoneLabel: "",
      packages: [
        { id: "rb1", name: "400 Robux", priceUsd: 5.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "rb2", name: "800 Robux", priceUsd: 10.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "rb3", name: "1700 Robux", priceUsd: 21.00, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    }
  ]
};

/* ================= UTILIDADES CRYPTO & JSON ================= */
const enc = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function toBase64Url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function hashPassword(password, saltHex = null) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 60000, hash: "SHA-256" },
    key,
    256
  );
  return `${toHex(salt)}:${toHex(new Uint8Array(bits))}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  const candidate = await hashPassword(password, saltHex);
  return candidate === stored;
}

async function signJwt(payload, secret, ttlSeconds = 60 * 60 * 24 * 7) {
  const header = toBase64Url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(enc.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${toBase64Url(new Uint8Array(sig))}`;
}

async function verifyJwt(token, secret) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(sig), enc.encode(`${header}.${body}`));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBearer(request) {
  const auth = request.headers.get("Authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
}

/* ================= STORE STATE EN D1 ================= */
async function getStoreData(env) {
  const row = await env.DB.prepare("SELECT value FROM store_state WHERE key = 'store_data'").first();
  if (row?.value) return JSON.parse(row.value);

  await env.DB.prepare("INSERT OR REPLACE INTO store_state (key, value) VALUES ('store_data', ?)")
    .bind(JSON.stringify(DEFAULT_STORE))
    .run();
  return structuredClone(DEFAULT_STORE);
}

/* ================= HANDLER PRINCIPAL ================= */
export async function onRequest(context) {
  const { request, env, params } = context;
  const segments = Array.isArray(params.route) ? params.route : [params.route].filter(Boolean);
  const path = segments.join("/");
  const method = request.method;
  const secret = env.JWT_SECRET || "cambia_este_secreto_en_cloudflare_pages";

  try {
    /* 1. SERVIR IMÁGENES DESDE R2 (/api/media/...) */
    if (method === "GET" && segments[0] === "media") {
      const key = segments.slice(1).join("/");
      if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
      const obj = await env.BUCKET.get(key);
      if (!obj) return new Response("Not found", { status: 404 });
      const headers = new Headers();
      obj.writeHttpMetadata(headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(obj.body, { headers });
    }

    /* 2. CARGA INICIAL DE LA TIENDA */
    if (method === "GET" && path === "bootstrap") {
      const store = await getStoreData(env);
      return json(store);
    }

    /* 3. AUTENTICACIÓN DE USUARIOS */
    if (method === "POST" && path === "auth/register") {
      const { name, email, password } = await request.json();
      const cleanName = String(name || "").trim();
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (cleanName.length < 2 || !cleanEmail.includes("@") || String(password || "").length < 4) {
        return json({ error: "Completa los datos correctamente (contraseña mínimo 4 caracteres)." }, 400);
      }

      const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
      if (existing) return json({ error: "Ese correo ya está registrado." }, 409);

      const id = "usr_" + crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      await env.DB.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)")
        .bind(id, cleanName, cleanEmail, passwordHash)
        .run();

      const user = { id, name: cleanName, email: cleanEmail };
      const token = await signJwt({ sub: id, name: cleanName, email: cleanEmail, role: "user" }, secret);
      return json({ token, user }, 201);
    }

    if (method === "POST" && path === "auth/login") {
      const { email, password } = await request.json();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const row = await env.DB.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?")
        .bind(cleanEmail)
        .first();

      if (!row || !(await verifyPassword(password || "", row.password_hash))) {
        return json({ error: "Correo o contraseña incorrectos." }, 401);
      }

      const user = { id: row.id, name: row.name, email: row.email };
      const token = await signJwt({ sub: row.id, name: row.name, email: row.email, role: "user" }, secret);
      return json({ token, user });
    }

    if (method === "GET" && path === "auth/me") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "No autenticado." }, 401);
      return json({ user: { id: payload.sub, name: payload.name, email: payload.email } });
    }

    /* 4. SUBIDA DE COMPROBANTE DE PAGO A R2 (REQUIERE LOGIN DE USUARIO) */
    if (method === "POST" && path === "upload") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || (payload.role !== "user" && payload.role !== "admin")) {
        return json({ error: "Debes iniciar sesión para subir comprobantes." }, 401);
      }

      const form = await request.formData();
      const file = form.get("file");
      const folder = payload.role === "admin" && form.get("folder") === "catalog" ? "catalog" : "receipts";

      if (!file || typeof file === "string") return json({ error: "Archivo inválido." }, 400);
      if (!file.type.startsWith("image/")) return json({ error: "Solo se permiten imágenes." }, 400);
      if (file.size > 4 * 1024 * 1024) return json({ error: "La imagen supera los 4 MB." }, 400);

      const ext = file.type.includes("webp") ? "webp" : file.type.includes("png") ? "png" : "jpg";
      const key = `${folder}/${crypto.randomUUID()}.${ext}`;

      await env.BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
      });

      return json({ url: `/api/media/${key}` }, 201);
    }

    /* 5. CREAR PEDIDO DE RECARGA (LOGIN OBLIGATORIO + PRECIO VALIDADO EN SERVIDOR) */
    if (method === "POST" && path === "orders") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Es obligatorio iniciar sesión para poder recargar." }, 401);
      }

      const body = await request.json();
      const store = await getStoreData(env);

      const game = store.games.find(g => g.id === body.gameId);
      const pkg = game?.packages.find(p => p.id === body.packageId);
      const pay = store.payments.find(p => p.id === body.paymentId && p.active);

      const playerId = String(body.playerId || "").trim();
      const zoneId = String(body.zoneId || "").trim();
      const nickname = String(body.nickname || "").trim();
      const reference = String(body.reference || "").trim();
      const receiptUrl = String(body.receiptUrl || "").trim();

      if (!game || !pkg || !pay) return json({ error: "Juego, paquete o método de pago inválido." }, 400);
      if (!playerId) return json({ error: "El ID de jugador es obligatorio." }, 400);
      if (game.needsZone && !zoneId) return json({ error: "El Zone ID es obligatorio." }, 400);
      if (!reference) return json({ error: "El código de referencia es obligatorio." }, 400);
      if (!receiptUrl) return json({ error: "Debes adjuntar la captura del comprobante de pago." }, 400);

      const priceUsd = Number(pkg.priceUsd);
      const bsTotal = priceUsd * Number(store.config.bsRate || 1);
      const amountDisplay = pay.currency === "VES"
        ? `${bsTotal.toFixed(2)} Bs ($${priceUsd.toFixed(2)})`
        : `$${priceUsd.toFixed(2)}`;

      const id = "ord_" + crypto.randomUUID();
      const code = "ARC-" + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO orders (
          id, code, user_id, user_name, user_email, game_id, game_name,
          player_id, zone_id, nickname, package_name, price_usd,
          amount_display, payment_name, reference, receipt_url, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?)
      `).bind(
        id, code, payload.sub, payload.name, payload.email, game.id, game.name,
        playerId, zoneId, nickname, pkg.name, priceUsd,
        amountDisplay, pay.name, reference, receiptUrl, createdAt
      ).run();

      return json({
        order: {
          id, code, user_id: payload.sub, user_name: payload.name, user_email: payload.email,
          game_name: game.name, player_id: playerId, zone_id: zoneId, nickname,
          package_name: pkg.name, price_usd: priceUsd, amount_display: amountDisplay,
          payment_name: pay.name, reference, receipt_url: receiptUrl,
          status: "Pendiente", created_at: createdAt
        }
      }, 201);
    }

    /* 6. HISTORIAL DEL USUARIO AUTENTICADO */
    if (method === "GET" && path === "orders/mine") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para ver tu historial." }, 401);

      const { results } = await env.DB.prepare(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100"
      ).bind(payload.sub).all();

      return json({ orders: results || [] });
    }

    /* 7. LOGIN DE ADMINISTRADOR */
    if (method === "POST" && path === "admin/login") {
      const { password } = await request.json();
      const storedHash = await env.DB.prepare("SELECT value FROM store_state WHERE key = 'admin_pass_hash'").first();

      let valid = false;
      if (storedHash?.value) {
        valid = await verifyPassword(password || "", storedHash.value);
      } else {
        const expected = env.ADMIN_PASSWORD || "arcan2026";
        valid = password === expected;
      }

      if (!valid) return json({ error: "Contraseña de administrador incorrecta." }, 401);

      const adminToken = await signJwt({ sub: "admin", role: "admin" }, secret, 60 * 60 * 12);
      return json({ adminToken });
    }

    /* 8. RUTAS PROTEGIDAS DE ADMINISTRADOR */
    if (path.startsWith("admin/")) {
      const adminPayload = await verifyJwt(getBearer(request), secret);
      if (!adminPayload || adminPayload.role !== "admin") {
        return json({ error: "Acceso de administrador requerido." }, 401);
      }

      if (method === "PUT" && path === "admin/store") {
        const nextStore = await request.json();
        await env.DB.prepare("INSERT OR REPLACE INTO store_state (key, value, updated_at) VALUES ('store_data', ?, CURRENT_TIMESTAMP)")
          .bind(JSON.stringify(nextStore))
          .run();
        return json({ ok: true });
      }

      if (method === "POST" && path === "admin/password") {
        const { password } = await request.json();
        if (String(password || "").length < 4) return json({ error: "Mínimo 4 caracteres." }, 400);
        const hash = await hashPassword(password);
        await env.DB.prepare("INSERT OR REPLACE INTO store_state (key, value, updated_at) VALUES ('admin_pass_hash', ?, CURRENT_TIMESTAMP)")
          .bind(hash)
          .run();
        return json({ ok: true });
      }

      if (method === "GET" && path === "admin/orders") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM orders ORDER BY created_at DESC LIMIT 200"
        ).all();
        return json({ orders: results || [] });
      }

      if (method === "PATCH" && segments[0] === "admin" && segments[1] === "orders" && segments[2]) {
        const { status } = await request.json();
        const allowed = ["Pendiente", "Procesando", "Completado", "Rechazado"];
        if (!allowed.includes(status)) return json({ error: "Estado inválido." }, 400);
        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, segments[2]).run();
        return json({ ok: true });
      }
    }

    return json({ error: "Ruta no encontrada." }, 404);
  } catch (err) {
    return json({ error: "Error interno del servidor.", detail: err.message }, 500);
  }
}
