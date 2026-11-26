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

const NAME_CHANGE_PRICE_USD = 5.0;
const ALLOWED_EMOJIS = ["🔥", "❤️", "🎮", "😮", "👍", "😂"];

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

/* ================= HELPERS D1 ================= */
async function getStoreData(env) {
  const row = await env.DB.prepare("SELECT value FROM store_state WHERE key = 'store_data'").first();
  if (row?.value) return JSON.parse(row.value);

  await env.DB.prepare("INSERT OR REPLACE INTO store_state (key, value) VALUES ('store_data', ?)")
    .bind(JSON.stringify(DEFAULT_STORE))
    .run();
  return structuredClone(DEFAULT_STORE);
}

async function getUserById(env, id) {
  return await env.DB.prepare(
    "SELECT id, name, email, COALESCE(avatar_url, '') AS avatar_url, COALESCE(bio, '') AS bio, created_at FROM users WHERE id = ?"
  ).bind(id).first();
}

async function getNewsReactionsSummary(env, newsId, currentUserId = null) {
  const { results } = await env.DB.prepare(
    "SELECT emoji, COUNT(*) AS count FROM news_reactions WHERE news_id = ? GROUP BY emoji"
  ).bind(newsId).all();

  const mySet = new Set();
  if (currentUserId) {
    const { results: mine } = await env.DB.prepare(
      "SELECT emoji FROM news_reactions WHERE news_id = ? AND user_id = ?"
    ).bind(newsId, currentUserId).all();
    for (const r of mine || []) mySet.add(r.emoji);
  }

  const reactions = {};
  for (const emoji of ALLOWED_EMOJIS) {
    const found = (results || []).find(r => r.emoji === emoji);
    reactions[emoji] = {
      count: found ? Number(found.count) : 0,
      reacted: mySet.has(emoji)
    };
  }
  return reactions;
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
      if (cleanName.length < 2 || cleanName.length > 32 || !cleanEmail.includes("@") || String(password || "").length < 4) {
        return json({ error: "Completa los datos correctamente (nombre 2-32 caracteres, contraseña mínimo 4)." }, 400);
      }

      const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
      if (existing) return json({ error: "Ese correo ya está registrado." }, 409);

      const id = "usr_" + crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      await env.DB.prepare("INSERT INTO users (id, name, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, '', '')")
        .bind(id, cleanName, cleanEmail, passwordHash)
        .run();

      const user = { id, name: cleanName, email: cleanEmail, avatar_url: "", bio: "" };
      const token = await signJwt({ sub: id, name: cleanName, email: cleanEmail, role: "user" }, secret);
      return json({ token, user }, 201);
    }

    if (method === "POST" && path === "auth/login") {
      const { email, password } = await request.json();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const row = await env.DB.prepare(
        "SELECT id, name, email, password_hash, COALESCE(avatar_url, '') AS avatar_url, COALESCE(bio, '') AS bio FROM users WHERE email = ?"
      ).bind(cleanEmail).first();

      if (!row || !(await verifyPassword(password || "", row.password_hash))) {
        return json({ error: "Correo o contraseña incorrectos." }, 401);
      }

      const user = { id: row.id, name: row.name, email: row.email, avatar_url: row.avatar_url, bio: row.bio };
      const token = await signJwt({ sub: row.id, name: row.name, email: row.email, role: "user" }, secret);
      return json({ token, user });
    }

    if (method === "GET" && path === "auth/me") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "No autenticado." }, 401);
      const user = await getUserById(env, payload.sub);
      if (!user) return json({ error: "Usuario no encontrado." }, 401);
      return json({ user });
    }

    /* 4. PERFILES DE USUARIO Y CAMBIO DE NOMBRE ($5 USD) */
    if (method === "GET" && path === "profile") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para ver tu perfil." }, 401);

      const user = await getUserById(env, payload.sub);
      if (!user) return json({ error: "Usuario no encontrado." }, 404);

      const { results: requests } = await env.DB.prepare(
        "SELECT * FROM name_change_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
      ).bind(payload.sub).all();

      return json({ user, nameChangePriceUsd: NAME_CHANGE_PRICE_USD, requests: requests || [] });
    }

    if (method === "PATCH" && path === "profile") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Debes iniciar sesión para editar tu perfil." }, 401);

      const body = await request.json();
      const current = await getUserById(env, payload.sub);
      if (!current) return json({ error: "Usuario no encontrado." }, 404);

      const nextBio = body.bio !== undefined ? String(body.bio).trim().slice(0, 240) : current.bio;
      let nextAvatar = current.avatar_url;

      if (body.avatar_url !== undefined) {
        const rawAvatar = String(body.avatar_url || "").trim();
        if (rawAvatar && !rawAvatar.startsWith("/api/media/avatars/")) {
          return json({ error: "URL de foto de perfil inválida." }, 400);
        }
        nextAvatar = rawAvatar;
      }

      await env.DB.prepare("UPDATE users SET avatar_url = ?, bio = ? WHERE id = ?")
        .bind(nextAvatar, nextBio, payload.sub)
        .run();

      const updated = await getUserById(env, payload.sub);
      return json({ user: updated });
    }

    if (method === "POST" && path === "profile/name-change") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para solicitar cambio de nombre." }, 401);

      const current = await getUserById(env, payload.sub);
      if (!current) return json({ error: "Usuario no encontrado." }, 404);

      const body = await request.json();
      const newName = String(body.newName || "").trim();
      const reference = String(body.reference || "").trim();
      const receiptUrl = String(body.receiptUrl || "").trim();

      if (newName.length < 2 || newName.length > 32) {
        return json({ error: "El nuevo nombre debe tener entre 2 y 32 caracteres." }, 400);
      }
      if (newName.toLowerCase() === current.name.toLowerCase()) {
        return json({ error: "El nuevo nombre debe ser diferente al actual." }, 400);
      }

      const nameTaken = await env.DB.prepare(
        "SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ?"
      ).bind(newName, payload.sub).first();
      if (nameTaken) {
        return json({ error: "Ese nombre ya está en uso por otro usuario." }, 409);
      }

      const pending = await env.DB.prepare(
        "SELECT id FROM name_change_requests WHERE user_id = ? AND status = 'Pendiente'"
      ).bind(payload.sub).first();
      if (pending) {
        return json({ error: "Ya tienes una solicitud de cambio de nombre pendiente de aprobación." }, 409);
      }

      const store = await getStoreData(env);
      const pay = store.payments.find(p => p.id === body.paymentId && p.active);
      if (!pay) return json({ error: "Método de pago inválido." }, 400);
      if (!reference) return json({ error: "El código de referencia es obligatorio." }, 400);
      if (!receiptUrl) return json({ error: "Debes adjuntar el comprobante de pago." }, 400);

      const priceUsd = NAME_CHANGE_PRICE_USD;
      const bsTotal = priceUsd * Number(store.config.bsRate || 1);
      const amountDisplay = pay.currency === "VES"
        ? `${bsTotal.toFixed(2)} Bs ($${priceUsd.toFixed(2)})`
        : `$${priceUsd.toFixed(2)}`;

      const id = "ncr_" + crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO name_change_requests (
          id, user_id, old_name, new_name, price_usd, amount_display,
          payment_name, reference, receipt_url, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?)
      `).bind(
        id, payload.sub, current.name, newName, priceUsd, amountDisplay,
        pay.name, reference, receiptUrl, createdAt
      ).run();

      return json({
        request: {
          id, user_id: payload.sub, old_name: current.name, new_name: newName,
          price_usd: priceUsd, amount_display: amountDisplay, payment_name: pay.name,
          reference, receipt_url: receiptUrl, status: "Pendiente", created_at: createdAt
        }
      }, 201);
    }

    /* Directorio público ligero para etiquetas @usuario y ver perfiles */
    if (method === "GET" && path === "users/public") {
      const { results } = await env.DB.prepare(
        "SELECT id, name, COALESCE(avatar_url, '') AS avatar_url, COALESCE(bio, '') AS bio FROM users ORDER BY name ASC LIMIT 500"
      ).all();
      return json({ users: results || [] });
    }

    if (method === "GET" && segments[0] === "users" && segments[1] && segments[1] !== "public") {
      const row = await env.DB.prepare(
        "SELECT id, name, COALESCE(avatar_url, '') AS avatar_url, COALESCE(bio, '') AS bio, created_at FROM users WHERE id = ?"
      ).bind(segments[1]).first();
      if (!row) return json({ error: "Perfil no encontrado." }, 404);
      return json({ user: row });
    }

    /* 5. NOTICIAS PÚBLICAS, REACCIONES Y COMENTARIOS CON MENCIONES */
    if (method === "GET" && path === "news") {
      const payload = await verifyJwt(getBearer(request), secret);
      const currentUserId = payload?.role === "user" ? payload.sub : null;

      const { results: newsRows } = await env.DB.prepare(
        "SELECT * FROM news ORDER BY pinned DESC, created_at DESC LIMIT 50"
      ).all();

      const { results: reactionRows } = await env.DB.prepare(
        "SELECT news_id, emoji, COUNT(*) AS count FROM news_reactions GROUP BY news_id, emoji"
      ).all();

      const { results: commentCounts } = await env.DB.prepare(
        "SELECT news_id, COUNT(*) AS count FROM news_comments GROUP BY news_id"
      ).all();

      const myMap = new Map();
      if (currentUserId) {
        const { results: mine } = await env.DB.prepare(
          "SELECT news_id, emoji FROM news_reactions WHERE user_id = ?"
        ).bind(currentUserId).all();
        for (const r of mine || []) {
          if (!myMap.has(r.news_id)) myMap.set(r.news_id, new Set());
          myMap.get(r.news_id).add(r.emoji);
        }
      }

      const commentMap = new Map((commentCounts || []).map(c => [c.news_id, Number(c.count)]));
      const news = (newsRows || []).map(item => {
        const reactions = {};
        const mySet = myMap.get(item.id) || new Set();
        for (const emoji of ALLOWED_EMOJIS) {
          const found = (reactionRows || []).find(r => r.news_id === item.id && r.emoji === emoji);
          reactions[emoji] = {
            count: found ? Number(found.count) : 0,
            reacted: mySet.has(emoji)
          };
        }
        return {
          ...item,
          pinned: Boolean(item.pinned),
          reactions,
          comments_count: commentMap.get(item.id) || 0
        };
      });

      return json({ news, emojis: ALLOWED_EMOJIS });
    }

    if (method === "GET" && segments[0] === "news" && segments[1] && segments[2] === "comments") {
      const newsId = segments[1];
      const { results } = await env.DB.prepare(`
        SELECT
          c.id, c.news_id, c.user_id, c.parent_id, c.reply_to_user_id, c.content, c.created_at,
          u.name AS user_name,
          COALESCE(u.avatar_url, '') AS user_avatar,
          COALESCE(u.bio, '') AS user_bio,
          ru.name AS reply_to_name
        FROM news_comments c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN users ru ON ru.id = c.reply_to_user_id
        WHERE c.news_id = ?
        ORDER BY c.created_at ASC
        LIMIT 300
      `).bind(newsId).all();

      return json({ comments: results || [] });
    }

    if (method === "POST" && segments[0] === "news" && segments[1] && segments[2] === "react") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Inicia sesión para reaccionar a las noticias." }, 401);
      }

      const newsId = segments[1];
      const { emoji } = await request.json();
      if (!ALLOWED_EMOJIS.includes(emoji)) return json({ error: "Reacción no válida." }, 400);

      const existsNews = await env.DB.prepare("SELECT id FROM news WHERE id = ?").bind(newsId).first();
      if (!existsNews) return json({ error: "Noticia no encontrada." }, 404);

      const existing = await env.DB.prepare(
        "SELECT id FROM news_reactions WHERE news_id = ? AND user_id = ? AND emoji = ?"
      ).bind(newsId, payload.sub, emoji).first();

      if (existing) {
        await env.DB.prepare("DELETE FROM news_reactions WHERE id = ?").bind(existing.id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO news_reactions (id, news_id, user_id, emoji) VALUES (?, ?, ?, ?)"
        ).bind("nrx_" + crypto.randomUUID(), newsId, payload.sub, emoji).run();
      }

      const reactions = await getNewsReactionsSummary(env, newsId, payload.sub);
      return json({ reactions });
    }

    if (method === "POST" && segments[0] === "news" && segments[1] && segments[2] === "comments") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Inicia sesión para comentar." }, 401);
      }

      const newsId = segments[1];
      const existsNews = await env.DB.prepare("SELECT id FROM news WHERE id = ?").bind(newsId).first();
      if (!existsNews) return json({ error: "Noticia no encontrada." }, 404);

      const body = await request.json();
      const content = String(body.content || "").trim();
      if (content.length < 1 || content.length > 600) {
        return json({ error: "El comentario debe tener entre 1 y 600 caracteres." }, 400);
      }

      let parentId = body.parentId ? String(body.parentId).trim() : null;
      let replyToUserId = body.replyToUserId ? String(body.replyToUserId).trim() : null;

      if (parentId) {
        const parent = await env.DB.prepare(
          "SELECT id, parent_id, user_id FROM news_comments WHERE id = ? AND news_id = ?"
        ).bind(parentId, newsId).first();
        if (!parent) return json({ error: "El comentario al que respondes no existe." }, 404);
        // Mantiene 2 niveles limpios agrupando respuestas bajo el comentario raíz
        parentId = parent.parent_id || parent.id;
        if (!replyToUserId) replyToUserId = parent.user_id;
      }

      const id = "ncm_" + crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO news_comments (id, news_id, user_id, parent_id, reply_to_user_id, content, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, newsId, payload.sub, parentId, replyToUserId, content, createdAt).run();

      const author = await getUserById(env, payload.sub);
      let replyToName = null;
      if (replyToUserId) {
        const target = await env.DB.prepare("SELECT name FROM users WHERE id = ?").bind(replyToUserId).first();
        replyToName = target?.name || null;
      }

      return json({
        comment: {
          id,
          news_id: newsId,
          user_id: payload.sub,
          parent_id: parentId,
          reply_to_user_id: replyToUserId,
          reply_to_name: replyToName,
          content,
          created_at: createdAt,
          user_name: author?.name || payload.name,
          user_avatar: author?.avatar_url || "",
          user_bio: author?.bio || ""
        }
      }, 201);
    }

    if (method === "DELETE" && segments[0] === "news" && segments[1] === "comments" && segments[2]) {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || (payload.role !== "user" && payload.role !== "admin")) {
        return json({ error: "No autorizado." }, 401);
      }

      const commentId = segments[2];
      const comment = await env.DB.prepare("SELECT id, user_id FROM news_comments WHERE id = ?").bind(commentId).first();
      if (!comment) return json({ error: "Comentario no encontrado." }, 404);

      if (payload.role !== "admin" && comment.user_id !== payload.sub) {
        return json({ error: "Solo puedes eliminar tus propios comentarios." }, 403);
      }

      await env.DB.prepare("DELETE FROM news_comments WHERE parent_id = ?").bind(commentId).run();
      await env.DB.prepare("DELETE FROM news_comments WHERE id = ?").bind(commentId).run();
      return json({ ok: true });
    }

    /* 6. SUBIDA DE IMÁGENES A R2 (COMPROBANTES, AVATARES, CATÁLOGO Y NOTICIAS) */
    if (method === "POST" && path === "upload") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || (payload.role !== "user" && payload.role !== "admin")) {
        return json({ error: "Debes iniciar sesión para subir imágenes." }, 401);
      }

      const form = await request.formData();
      const file = form.get("file");
      const reqFolder = String(form.get("folder") || "receipts");

      let folder = "receipts";
      if (payload.role === "admin" && ["catalog", "news", "receipts"].includes(reqFolder)) {
        folder = reqFolder;
      } else if (payload.role === "user" && ["avatars", "receipts"].includes(reqFolder)) {
        folder = reqFolder;
      }

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

    /* 7. CREAR PEDIDO DE RECARGA (LOGIN OBLIGATORIO + PRECIO VALIDADO EN SERVIDOR) */
    if (method === "POST" && path === "orders") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Es obligatorio iniciar sesión para poder recargar." }, 401);
      }

      const currentUser = await getUserById(env, payload.sub);
      const userName = currentUser?.name || payload.name;
      const userEmail = currentUser?.email || payload.email;

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
        id, code, payload.sub, userName, userEmail, game.id, game.name,
        playerId, zoneId, nickname, pkg.name, priceUsd,
        amountDisplay, pay.name, reference, receiptUrl, createdAt
      ).run();

      return json({
        order: {
          id, code, user_id: payload.sub, user_name: userName, user_email: userEmail,
          game_name: game.name, player_id: playerId, zone_id: zoneId, nickname,
          package_name: pkg.name, price_usd: priceUsd, amount_display: amountDisplay,
          payment_name: pay.name, reference, receipt_url: receiptUrl,
          status: "Pendiente", created_at: createdAt
        }
      }, 201);
    }

    /* 8. HISTORIAL DEL USUARIO AUTENTICADO */
    if (method === "GET" && path === "orders/mine") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para ver tu historial." }, 401);

      const { results } = await env.DB.prepare(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100"
      ).bind(payload.sub).all();

      return json({ orders: results || [] });
    }

    /* 9. LOGIN DE ADMINISTRADOR */
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

    /* 10. RUTAS PROTEGIDAS DE ADMINISTRADOR */
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

      /* Gestión de solicitudes de cambio de nombre ($5 USD) */
      if (method === "GET" && path === "admin/name-changes") {
        const { results } = await env.DB.prepare(`
          SELECT r.*, u.email AS user_email, COALESCE(u.avatar_url, '') AS user_avatar
          FROM name_change_requests r
          LEFT JOIN users u ON u.id = r.user_id
          ORDER BY CASE WHEN r.status = 'Pendiente' THEN 0 ELSE 1 END, r.created_at DESC
          LIMIT 200
        `).all();
        return json({ requests: results || [] });
      }

      if (method === "PATCH" && segments[0] === "admin" && segments[1] === "name-changes" && segments[2]) {
        const reqId = segments[2];
        const { status } = await request.json();
        if (!["Aprobado", "Rechazado"].includes(status)) {
          return json({ error: "Estado inválido (usa Aprobado o Rechazado)." }, 400);
        }

        const reqRow = await env.DB.prepare("SELECT * FROM name_change_requests WHERE id = ?").bind(reqId).first();
        if (!reqRow) return json({ error: "Solicitud no encontrada." }, 404);

        if (status === "Aprobado" && reqRow.status !== "Aprobado") {
          const taken = await env.DB.prepare(
            "SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ?"
          ).bind(reqRow.new_name, reqRow.user_id).first();
          if (taken) {
            return json({ error: "Otro usuario ya tomó ese nombre." }, 409);
          }

          await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?")
            .bind(reqRow.new_name, reqRow.user_id).run();
          await env.DB.prepare("UPDATE orders SET user_name = ? WHERE user_id = ?")
            .bind(reqRow.new_name, reqRow.user_id).run();
        }

        await env.DB.prepare("UPDATE name_change_requests SET status = ? WHERE id = ?")
          .bind(status, reqId).run();

        return json({ ok: true });
      }

      /* Gestión exclusiva de Noticias / Anuncios desde Admin */
      if (method === "POST" && path === "admin/news") {
        const body = await request.json();
        const title = String(body.title || "").trim();
        const content = String(body.content || "").trim();
        const imageUrl = String(body.image_url || "").trim();
        const tag = String(body.tag || "Anuncio").trim().slice(0, 24);
        const pinned = body.pinned ? 1 : 0;

        if (title.length < 2 || content.length < 2) {
          return json({ error: "El título y el contenido son obligatorios." }, 400);
        }

        const id = "nws_" + crypto.randomUUID();
        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO news (id, title, content, image_url, tag, pinned, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, title, content, imageUrl, tag, pinned, now, now).run();

        return json({
          news: { id, title, content, image_url: imageUrl, tag, pinned: Boolean(pinned), created_at: now, updated_at: now }
        }, 201);
      }

      if (method === "PUT" && segments[0] === "admin" && segments[1] === "news" && segments[2]) {
        const newsId = segments[2];
        const body = await request.json();
        const title = String(body.title || "").trim();
        const content = String(body.content || "").trim();
        const imageUrl = String(body.image_url || "").trim();
        const tag = String(body.tag || "Anuncio").trim().slice(0, 24);
        const pinned = body.pinned ? 1 : 0;

        if (title.length < 2 || content.length < 2) {
          return json({ error: "El título y el contenido son obligatorios." }, 400);
        }

        await env.DB.prepare(`
          UPDATE news
          SET title = ?, content = ?, image_url = ?, tag = ?, pinned = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(title, content, imageUrl, tag, pinned, newsId).run();

        return json({ ok: true });
      }

      if (method === "DELETE" && segments[0] === "admin" && segments[1] === "news" && segments[2]) {
        const newsId = segments[2];
        await env.DB.prepare("DELETE FROM news_comments WHERE news_id = ?").bind(newsId).run();
        await env.DB.prepare("DELETE FROM news_reactions WHERE news_id = ?").bind(newsId).run();
        await env.DB.prepare("DELETE FROM news WHERE id = ?").bind(newsId).run();
        return json({ ok: true });
      }

      if (method === "DELETE" && segments[0] === "admin" && segments[1] === "comments" && segments[2]) {
        const commentId = segments[2];
        await env.DB.prepare("DELETE FROM news_comments WHERE parent_id = ?").bind(commentId).run();
        await env.DB.prepare("DELETE FROM news_comments WHERE id = ?").bind(commentId).run();
        return json({ ok: true });
      }
    }

    return json({ error: "Ruta no encontrada." }, 404);
  } catch (err) {
    return json({ error: "Error interno del servidor.", detail: err.message }, 500);
  }
}
