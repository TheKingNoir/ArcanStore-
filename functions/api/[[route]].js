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
const LEVEL_RECOVERY_MIN_USD = 5.0;
const DECAY_DAYS = 20;
const DECAY_MS = DECAY_DAYS * 24 * 60 * 60 * 1000;

const ALLOWED_EMOJIS = ["🔥", "❤️", "🎮", "😮", "👍", "😂"];
const COMMENT_EMOJIS = ["❤️", "🔥", "😂", "😮", "👍"];
const ALLOWED_GENDERS = ["", "Masculino", "Femenino", "No binario", "Prefiero no decir"];

const LEVELS = [
  { index: 0, name: "Bronce", slug: "bronze", icon: "🥉", min: 0 },
  { index: 1, name: "Hierro", slug: "iron", icon: "🛡️", min: 50 },
  { index: 2, name: "Plata", slug: "silver", icon: "⚔️", min: 100 },
  { index: 3, name: "Oro", slug: "gold", icon: "👑", min: 150 },
  { index: 4, name: "Esmeralda", slug: "emerald", icon: "❇️", min: 200 },
  { index: 5, name: "Diamante", slug: "diamond", icon: "💎", min: 250 },
  { index: 6, name: "Rubí", slug: "ruby", icon: "❤️‍🔥", min: 300 }
];

/* ================= UTILIDADES CRYPTO & JSON ================= */
const enc = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePromoCode(raw) {
  return String(raw || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
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

function calculateAgeFromBirthday(birthday) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return null;
  const [y, m, d] = birthday.split("-").map(Number);
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  const monthDiff = (now.getUTCMonth() + 1) - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < d)) age--;
  return age >= 10 && age <= 120 ? age : null;
}

/* ================= SISTEMA DE NIVELES (20 DÍAS INACTIVIDAD + RECUPERACIÓN $5) ================= */
function getBaseLevelIndex(completedRecharges) {
  let idx = 0;
  for (const lvl of LEVELS) {
    if (completedRecharges >= lvl.min) idx = lvl.index;
  }
  return idx;
}

function buildLevelPayload(effectiveIndex, baseIndex, completedRecharges, lastActivityIso = null) {
  const safeIdx = Math.max(0, Math.min(LEVELS.length - 1, Number(effectiveIndex || 0)));
  const safeBase = Math.max(0, Math.min(LEVELS.length - 1, Number(baseIndex ?? safeIdx)));
  const current = LEVELS[safeIdx];
  const baseLvl = LEVELS[safeBase];
  const nextLvl = LEVELS[safeBase + 1] || null;

  let daysUntilDecay = null;
  if (safeIdx > 0 && lastActivityIso) {
    const anchorMs = Date.parse(lastActivityIso);
    if (!Number.isNaN(anchorMs)) {
      const remainingMs = DECAY_MS - (Date.now() - anchorMs);
      daysUntilDecay = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    }
  }

  return {
    index: current.index,
    name: current.name,
    slug: current.slug,
    icon: current.icon,
    min: current.min,
    recharges: Number(completedRecharges || 0),
    baseIndex: baseLvl.index,
    baseName: baseLvl.name,
    nextTarget: nextLvl ? nextLvl.min : null,
    nextName: nextLvl ? nextLvl.name : null,
    isPenalized: safeIdx < baseLvl.index,
    recoveryMinUsd: LEVEL_RECOVERY_MIN_USD,
    daysUntilDecay
  };
}

async function syncUserLevel(env, userRow, notifyDrop = false) {
  if (!userRow) return null;

  const countRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND status = 'Completado'"
  ).bind(userRow.id).first();
  const completedCount = Number(countRow?.count || 0);
  const baseIndex = getBaseLevelIndex(completedCount);

  let penalty = Math.max(0, Number(userRow.level_penalty || 0));
  let lastRechargeAt = userRow.last_recharge_at || null;
  let lastDecayAt = userRow.last_decay_at || null;
  const prevStoredIndex = Number(userRow.level_index || 0);

  if (!lastRechargeAt && completedCount > 0) {
    const lastOrd = await env.DB.prepare(
      "SELECT created_at FROM orders WHERE user_id = ? AND status = 'Completado' ORDER BY created_at DESC LIMIT 1"
    ).bind(userRow.id).first();
    if (lastOrd?.created_at) lastRechargeAt = lastOrd.created_at;
  }

  let changed = false;
  if (baseIndex === 0) {
    if (penalty !== 0) {
      penalty = 0;
      changed = true;
    }
  } else {
    if (penalty > baseIndex) {
      penalty = baseIndex;
      changed = true;
    }

    const anchorIso = lastDecayAt || lastRechargeAt;
    if (anchorIso) {
      const anchorMs = Date.parse(anchorIso);
      const nowMs = Date.now();
      if (!Number.isNaN(anchorMs) && nowMs - anchorMs >= DECAY_MS) {
        const periods = Math.floor((nowMs - anchorMs) / DECAY_MS);
        const currentEffective = Math.max(0, baseIndex - penalty);
        if (currentEffective > 0 && periods > 0) {
          const drop = Math.min(currentEffective, periods);
          penalty += drop;
          lastDecayAt = new Date(anchorMs + periods * DECAY_MS).toISOString();
          changed = true;
        }
      }
    }
  }

  const effectiveIndex = Math.max(0, baseIndex - penalty);
  if (effectiveIndex !== prevStoredIndex || lastRechargeAt !== userRow.last_recharge_at || changed) {
    await env.DB.prepare(
      "UPDATE users SET level_index = ?, level_penalty = ?, last_recharge_at = ?, last_decay_at = ? WHERE id = ?"
    ).bind(effectiveIndex, penalty, lastRechargeAt, lastDecayAt, userRow.id).run();

    if (notifyDrop && effectiveIndex < prevStoredIndex) {
      const newLvl = LEVELS[effectiveIndex];
      await createAndPushNotification(env, {
        userId: userRow.id,
        type: "level",
        actorName: "ArcanStore",
        message: `Pasaste ${DECAY_DAYS} días sin recargar y bajaste a nivel ${newLvl.icon} ${newLvl.name}. Completa una recarga de $${LEVEL_RECOVERY_MIN_USD.toFixed(2)} o más para recuperar tu nivel ${LEVELS[baseIndex].name}.`
      });
    }
  }

  return {
    ...userRow,
    level_index: effectiveIndex,
    level_penalty: penalty,
    last_recharge_at: lastRechargeAt,
    last_decay_at: lastDecayAt,
    level: buildLevelPayload(effectiveIndex, baseIndex, completedCount, lastDecayAt || lastRechargeAt)
  };
}

async function handleOrderCompletionLevel(env, order, newStatus, prevStatus) {
  const rawUser = await env.DB.prepare(`
    SELECT id, name, level_index, level_penalty, last_recharge_at, last_decay_at
    FROM users WHERE id = ?
  `).bind(order.user_id).first();
  if (!rawUser) return;

  const syncedBefore = await syncUserLevel(env, rawUser, false);
  const prevLevel = syncedBefore.level_index;

  const countRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND status = 'Completado'"
  ).bind(order.user_id).first();
  const completedCount = Number(countRow?.count || 0);
  const baseIndex = getBaseLevelIndex(completedCount);

  let nextPenalty = Number(syncedBefore.level_penalty || 0);
  let nextLastRecharge = syncedBefore.last_recharge_at;
  let nextLastDecay = syncedBefore.last_decay_at;
  let recovered = false;

  if (newStatus === "Completado" && prevStatus !== "Completado") {
    const nowIso = new Date().toISOString();
    nextLastRecharge = nowIso;
    nextLastDecay = null;

    if (nextPenalty > 0 && Number(order.price_usd || 0) >= LEVEL_RECOVERY_MIN_USD) {
      nextPenalty = 0;
      recovered = true;
    }
  }

  if (nextPenalty > baseIndex) nextPenalty = baseIndex;
  const nextEffective = Math.max(0, baseIndex - nextPenalty);

  await env.DB.prepare(
    "UPDATE users SET level_index = ?, level_penalty = ?, last_recharge_at = ?, last_decay_at = ? WHERE id = ?"
  ).bind(nextEffective, nextPenalty, nextLastRecharge, nextLastDecay, order.user_id).run();

  const levelObj = buildLevelPayload(nextEffective, baseIndex, completedCount, nextLastDecay || nextLastRecharge);

  if (newStatus === "Completado" && prevStatus !== "Completado") {
    if (recovered && nextEffective > prevLevel) {
      await createAndPushNotification(env, {
        userId: order.user_id,
        type: "level",
        actorName: "ArcanStore",
        message: `¡Recarga completada! Recuperaste tu nivel ${levelObj.icon} ${levelObj.name} con tu historial completo (${completedCount} recargas).`
      });
    } else if (nextEffective > prevLevel) {
      await createAndPushNotification(env, {
        userId: order.user_id,
        type: "level",
        actorName: "ArcanStore",
        message: `¡Subiste a nivel ${levelObj.icon} ${levelObj.name}! Desbloqueaste su insignia y marco exclusivo de perfil.`
      });
    } else {
      await createAndPushNotification(env, {
        userId: order.user_id,
        type: "order",
        actorName: "ArcanStore",
        message: `Tu recarga ${order.code} (${order.game_name} — ${order.package_name}) fue marcada como Completada.`
      });
    }
  }

  if (nextEffective !== prevLevel || recovered) {
    await broadcastRealtime(env, {
      scope: "users",
      userIds: [order.user_id],
      event: { type: "level_updated", userId: order.user_id, level: levelObj }
    });
  }
}

/* ================= PROMO / REFERIDOS ================= */
async function evaluatePromoCode(env, rawCode, originalPriceUsd) {
  const code = normalizePromoCode(rawCode);
  if (!code) return { valid: false, error: "Escribe un código válido." };

  const promo = await env.DB.prepare("SELECT * FROM promo_codes WHERE UPPER(code) = ?").bind(code).first();
  if (!promo || !promo.active) {
    return { valid: false, error: "El código no existe o no está activo." };
  }

  if (promo.max_uses !== null && promo.max_uses !== undefined) {
    const usedRow = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM orders WHERE UPPER(promo_code) = ? AND status != 'Rechazado'"
    ).bind(code).first();
    if (Number(usedRow?.count || 0) >= Number(promo.max_uses)) {
      return { valid: false, error: "Este código alcanzó su límite máximo de usos." };
    }
  }

  const orig = Math.max(0, Number(originalPriceUsd || 0));
  const val = Math.max(0, Number(promo.discount_value || 0));
  let discountUsd = 0;

  if (promo.discount_type === "fixed") {
    discountUsd = Math.min(orig, Number(val.toFixed(2)));
  } else {
    const pct = Math.min(100, val);
    discountUsd = Math.min(orig, Number(((orig * pct) / 100).toFixed(2)));
  }

  const finalPriceUsd = Math.max(0, Number((orig - discountUsd).toFixed(2)));

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discount_type,
    discountValue: val,
    originalPriceUsd: orig,
    discountUsd,
    finalPriceUsd
  };
}

/* ================= REALTIME WEBSOCKET HUB (DURABLE OBJECT) ================= */
async function broadcastRealtime(env, payload) {
  if (!env.REALTIME) return;
  try {
    const stub = env.REALTIME.get(env.REALTIME.idFromName("global"));
    await stub.fetch("https://realtime.internal/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Nunca rompe la petición HTTP si el socket falla
  }
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

async function getUserById(env, id, includeLevelSync = true) {
  const row = await env.DB.prepare(`
    SELECT
      id, name, email,
      COALESCE(avatar_url, '') AS avatar_url,
      COALESCE(bio, '') AS bio,
      COALESCE(gender, '') AS gender,
      COALESCE(birthday, '') AS birthday,
      age,
      COALESCE(level_index, 0) AS level_index,
      COALESCE(level_penalty, 0) AS level_penalty,
      last_recharge_at,
      last_decay_at,
      created_at
    FROM users
    WHERE id = ?
  `).bind(id).first();

  if (!row) return null;
  if (!includeLevelSync) return row;
  return await syncUserLevel(env, row, true);
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
  const counts = {};
  for (const emoji of ALLOWED_EMOJIS) {
    const found = (results || []).find(r => r.emoji === emoji);
    const count = found ? Number(found.count) : 0;
    counts[emoji] = count;
    reactions[emoji] = { count, reacted: mySet.has(emoji) };
  }
  return { reactions, counts };
}

async function getCommentReactionsSummary(env, commentId, currentUserId = null) {
  const { results } = await env.DB.prepare(
    "SELECT emoji, COUNT(*) AS count FROM comment_reactions WHERE comment_id = ? GROUP BY emoji"
  ).bind(commentId).all();

  const mySet = new Set();
  if (currentUserId) {
    const { results: mine } = await env.DB.prepare(
      "SELECT emoji FROM comment_reactions WHERE comment_id = ? AND user_id = ?"
    ).bind(commentId, currentUserId).all();
    for (const r of mine || []) mySet.add(r.emoji);
  }

  const reactions = {};
  const counts = {};
  for (const emoji of COMMENT_EMOJIS) {
    const found = (results || []).find(r => r.emoji === emoji);
    const count = found ? Number(found.count) : 0;
    counts[emoji] = count;
    reactions[emoji] = { count, reacted: mySet.has(emoji) };
  }
  return { reactions, counts };
}

function emptyCommentReactions() {
  const reactions = {};
  for (const emoji of COMMENT_EMOJIS) reactions[emoji] = { count: 0, reacted: false };
  return reactions;
}

async function createAndPushNotification(env, {
  userId,
  type,
  actorId = null,
  actorName = "",
  actorAvatar = "",
  newsId = null,
  commentId = null,
  message
}) {
  if (!userId) return null;
  const id = "ntf_" + crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO notifications (
      id, user_id, type, actor_id, actor_name, actor_avatar,
      news_id, comment_id, message, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).bind(id, userId, type, actorId, actorName, actorAvatar, newsId, commentId, message, createdAt).run();

  const notification = {
    id,
    user_id: userId,
    type,
    actor_id: actorId,
    actor_name: actorName,
    actor_avatar: actorAvatar,
    news_id: newsId,
    comment_id: commentId,
    message,
    is_read: 0,
    created_at: createdAt
  };

  await broadcastRealtime(env, {
    scope: "users",
    userIds: [userId],
    event: { type: "notification", notification }
  });

  return notification;
}

/* ================= VERIFICADOR DE ID DE JUEGOS (RAPIDAPI + ROBLOX + D1 CACHE) ================= */
const GAME_ALIASES = {
  "mlbb": "mobile-legends",
  "mobile-legends": "mobile-legends",
  "mobilelegends": "mobile-legends",
  "freefire": "free-fire",
  "free-fire": "free-fire",
  "ff": "free-fire",
  "bloodstrike": "blood-strike",
  "blood-strike": "blood-strike",
  "roblox": "roblox",
  "honor-of-kings": "honor-of-kings",
  "honorofkings": "honor-of-kings",
  "hok": "honor-of-kings",
  "valorant": "valorant",
  "pubgm": "pubgm-global",
  "pubgm-global": "pubgm-global",
  "pubg": "pubgm-global",
  "pubgm-lite": "pubgm-lite",
  "pubgmlite": "pubgm-lite",
  "genshin": "genshin",
  "genshin-impact": "genshin",
  "arena-of-valor": "arena-of-valor",
  "aov": "arena-of-valor",
  "delta-force": "delta-force",
  "deltaforce": "delta-force",
  "dfm": "delta-force",
  "arena-breakout": "arena-breakout",
  "arenabreakout": "arena-breakout",
  "magic-chess": "magic-chess",
  "magicchess": "magic-chess",
  "mcgg": "magic-chess"
};

const RAPIDAPI_GAMES = {
  "blood-strike":    (id) => `/blood-strike/${encodeURIComponent(id)}`,
  "honor-of-kings":  (id) => `/honor-of-kings/${encodeURIComponent(id)}`,
  "valorant":        (id, server) => `/valorant/${encodeURIComponent(id)}/${encodeURIComponent(server)}`,
  "pubgm-global":    (id) => `/pubgm-global/${encodeURIComponent(id)}`,
  "pubgm-lite":      (id) => `/pubgm-lite/${encodeURIComponent(id)}`,
  "genshin":         (id, server) => `/genshin/${encodeURIComponent(id)}/${encodeURIComponent(server)}`,
  "arena-of-valor":  (id) => `/arena-of-valor/${encodeURIComponent(id)}`,
  "delta-force":     (id) => `/dfm-garena/${encodeURIComponent(id)}`,
  "arena-breakout":  (id) => `/arena-breakout/${encodeURIComponent(id)}`,
  "magic-chess":     (id, server) => `/mcgg/${encodeURIComponent(id)}/${encodeURIComponent(server)}`,
  "free-fire":       (id) => `/ff-global/${encodeURIComponent(id)}`,
  "mobile-legends":  (id, server) => `/mobile-legends/${encodeURIComponent(id)}/${encodeURIComponent(server)}`
};

const REQUIRES_SERVER_GAMES = new Set(["valorant", "genshin", "magic-chess", "mobile-legends"]);
const ID_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function saveIdCheckCache(env, cacheKey, username, extra, now) {
  if (!env.DB) return;
  try {
    await env.DB.prepare(`
      INSERT INTO id_check_cache (cache_key, username, extra_info, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(cache_key) DO UPDATE SET
        username = excluded.username,
        extra_info = excluded.extra_info,
        updated_at = excluded.updated_at
    `).bind(cacheKey, username, JSON.stringify(extra || {}), now).run();
  } catch {
    // No rompe la respuesta si falla el guardado en caché
  }
}

async function handleVerifyGameId(request, env) {
  const url = new URL(request.url);
  const rawGame = (url.searchParams.get("game") || "").toLowerCase().trim();
  const id = (url.searchParams.get("id") || "").trim();
  const server = (url.searchParams.get("server") || "").trim();

  if (!rawGame || !id) {
    return json({ ok: false, error: "Ingresa tu ID de jugador para verificar." }, 400);
  }

  const game = GAME_ALIASES[rawGame];
  if (!game) {
    return json({ ok: false, unsupported: true, error: "Este juego no requiere verificación automática." }, 200);
  }

  if (REQUIRES_SERVER_GAMES.has(game) && !server) {
    return json({ ok: false, error: "Este juego también requiere el Zone ID / Servidor." }, 400);
  }

  const cacheKey = `${game}:${id.toLowerCase()}:${server.toLowerCase()}`;
  const now = Date.now();

  // 1. Buscar primero en caché D1 (24 horas)
  if (env.DB) {
    const cached = await env.DB.prepare(
      "SELECT username, extra_info, updated_at FROM id_check_cache WHERE cache_key = ?"
    ).bind(cacheKey).first();

    if (cached && (now - Number(cached.updated_at)) < ID_CACHE_TTL_MS) {
      return json({
        ok: true,
        cached: true,
        username: cached.username,
        extra: cached.extra_info ? JSON.parse(cached.extra_info) : null
      });
    }
  }

  // 2. Roblox vía API oficial gratuita
  if (game === "roblox") {
    const isNumeric = /^\d+$/.test(id);
    let username = null;
    let extra = {};

    if (isNumeric) {
      const res = await fetch(`https://users.roblox.com/v1/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.name) {
          username = data.displayName && data.displayName !== data.name
            ? `${data.displayName} (@${data.name})`
            : data.name;
          extra = { id: data.id, name: data.name };
        }
      }
    } else {
      const res = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [id], excludeBannedUsers: false })
      });
      if (res.ok) {
        const data = await res.json();
        const user = data?.data?.[0];
        if (user?.name) {
          username = user.displayName && user.displayName !== user.name
            ? `${user.displayName} (@${user.name})`
            : user.name;
          extra = { id: user.id, name: user.name };
        }
      }
    }

    if (!username) {
      return json({ ok: false, error: "Usuario de Roblox no encontrado." }, 404);
    }

    await saveIdCheckCache(env, cacheKey, username, extra, now);
    return json({ ok: true, cached: false, username, extra });
  }

  // 3. Resto de juegos vía RapidAPI (NeferByte)
  if (!env.RAPIDAPI_KEY) {
    return json({ ok: false, error: "Falta configurar RAPIDAPI_KEY en Cloudflare." }, 503);
  }

  const buildPath = RAPIDAPI_GAMES[game];
  const rapidUrl = `https://id-game-checker.p.rapidapi.com${buildPath(id, server)}`;
  const res = await fetch(rapidUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "id-game-checker.p.rapidapi.com",
      "x-rapidapi-key": env.RAPIDAPI_KEY
    }
  });

  if (!res.ok) {
    return json({ ok: false, error: "No se pudo verificar el ID en este momento." }, res.status === 404 ? 404 : 502);
  }

  const data = await res.json().catch(() => null);
  if (!data || data.error || !data.data?.username) {
    return json({ ok: false, error: "ID no encontrado. Revisa que los datos sean correctos." }, 404);
  }

  const username = String(data.data.username);
  const extra = {
    region: data.data.region || null,
    is_ban: data.data.is_ban ?? null,
    level: data.data.player_info?.level || null
  };

  await saveIdCheckCache(env, cacheKey, username, extra, now);
  return json({ ok: true, cached: false, username, extra });
}

/* ================= HANDLER PRINCIPAL ================= */
export async function onRequest(context) {
  const { request, env, params } = context;
  const segments = Array.isArray(params.route) ? params.route : [params.route].filter(Boolean);
  const path = segments.join("/");
  const method = request.method;
  const secret = env.JWT_SECRET || "cambia_este_secreto_en_cloudflare_pages";

  try {
    /* 0. TÚNEL WEBSOCKET EN TIEMPO REAL (/api/ws) */
    if (method === "GET" && path === "ws") {
      if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
        return json({ error: "Se requiere conexión WebSocket." }, 426);
      }
      if (!env.REALTIME) {
        return json({ error: "Servicio WebSocket no vinculado." }, 503);
      }

      const url = new URL(request.url);
      const token = url.searchParams.get("token") || getBearer(request);
      const payload = token ? await verifyJwt(token, secret) : null;
      const userId = payload?.role === "user" ? payload.sub : "";

      const headers = new Headers(request.headers);
      headers.delete("X-User-Id");
      if (userId) headers.set("X-User-Id", userId);

      const stub = env.REALTIME.get(env.REALTIME.idFromName("global"));
      return stub.fetch(new Request(request.url, { method: "GET", headers }));
    }

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
      return json({ ...store, levels: LEVELS });
    }

    /* 2.5 IA DE SOPORTE EN VIVO (WORKERS AI) */
    if (method === "POST" && path === "support/chat") {
      const body = await request.json().catch(() => ({}));
      const userMessage = String(body.message || "").trim().slice(0, 600);
      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

      if (!userMessage) return json({ error: "Escribe un mensaje para el asistente." }, 400);

      const store = await getStoreData(env);
      const waPhone = String(store.config.whatsappNumber || "584125891414").replace(/\D/g, "");

      if (!env.AI) {
        return json({
          reply: `El asistente IA todavía no está activado en Cloudflare (falta la vinculación AI). Mientras tanto, puedes escribirnos directo por WhatsApp: https://wa.me/${waPhone}`
        });
      }

      const bsRate = Number(store.config.bsRate || 1);
      const activePayments = (store.payments || [])
        .filter(p => p.active)
        .map(p => `${p.name} (${p.currency})`)
        .join(", ");

      const catalogSummary = (store.games || [])
        .map(g => {
          const pkgs = (g.packages || [])
            .map(p => `${p.name}: $${Number(p.priceUsd).toFixed(2)} (${(Number(p.priceUsd) * bsRate).toFixed(2)} Bs)`)
            .join(" | ");
          return `- ${g.name} (${g.needsZone ? `pide ${g.idLabel} y ${g.zoneLabel}` : `pide ${g.idLabel}`}): ${pkgs}`;
        })
        .join("\n");

      const systemPrompt = [
        `Eres el asistente virtual oficial de soporte de ${store.config.storeName || "ArcanStore"} (arcanstore.app), una tienda venezolana de recargas gaming.`,
        `Responde SIEMPRE en español, de forma amable, clara, breve y directa (máximo 4-5 líneas por respuesta salvo que pidan lista de precios).`,
        `REGLAS Y DATOS ACTUALES DE LA TIENDA:`,
        `- Tasa del día: 1 USD = ${bsRate.toFixed(2)} Bs.`,
        `- Métodos de pago activos: ${activePayments || "Pago Móvil, Binance, PayPal, Zinli"}.`,
        `- Pasos para recargar: 1) Iniciar sesión o registrarse, 2) Elegir juego y colocar ID, 3) Seleccionar paquete, 4) Elegir método de pago (puede aplicar un código de descuento/referido si tiene), subir captura del comprobante y referencia, 5) Enviar los datos a WhatsApp.`,
        `- Cambio de nombre de perfil: cuesta $${NAME_CHANGE_PRICE_USD.toFixed(2)} USD (o su equivalente en Bs a la tasa del día) desde la pestaña Mi Perfil; cambiar foto, bio, género, cumpleaños y edad es gratis.`,
        `- Sistema de niveles por recargas completadas: Bronce (0-49), Hierro (50-99), Plata (100-149), Oro (150-199), Esmeralda (200-249), Diamante (250-299), Rubí (300+). Cada nivel otorga insignia y marco exclusivo de perfil.`,
        `- Inactividad de niveles: si pasas ${DECAY_DAYS} días sin recargar bajas 1 nivel, y lo recuperas completo haciendo una recarga completada de mínimo $${LEVEL_RECOVERY_MIN_USD.toFixed(2)} USD.`,
        `- WhatsApp oficial de soporte humano: https://wa.me/${waPhone} (útil si el cliente tiene un reclamo de pago, pedido demorado o problema técnico).`,
        `- CATÁLOGO ACTUAL:\n${catalogSummary}`,
        `- Nunca inventes precios, códigos de descuento ni prometas reembolsos automáticos. Si el cliente pregunta por el estado específico de un pago o tiene un problema real con una transferencia, indícale amablemente que escriba al WhatsApp oficial.`
      ].join("\n");

      const messages = [{ role: "system", content: systemPrompt }];
      for (const h of history) {
        if (h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string") {
          messages.push({ role: h.role, content: h.content.slice(0, 500) });
        }
      }
      messages.push({ role: "user", content: userMessage });

      try {
        const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages,
          max_tokens: 420,
          temperature: 0.35
        });

        const reply =
          aiRes?.response ||
          aiRes?.choices?.[0]?.message?.content ||
          `No pude procesar tu consulta ahora mismo. Escríbenos directo por WhatsApp: https://wa.me/${waPhone}`;

        return json({ reply: String(reply).trim() });
      } catch {
        return json({
          reply: `En este momento el asistente está saturado. Por favor contáctanos directo en WhatsApp: https://wa.me/${waPhone}`
        });
      }
    }

    /* 2.6 VALIDAR CÓDIGO DE DESCUENTO / REFERIDO EN CHECKOUT (SIN EXPONER CONTEOS) */
    if (method === "POST" && path === "promo/validate") {
      const body = await request.json().catch(() => ({}));
      const store = await getStoreData(env);
      const game = store.games.find(g => g.id === body.gameId);
      const pkg = game?.packages.find(p => p.id === body.packageId);

      const originalPrice = pkg ? Number(pkg.priceUsd) : Number(body.priceUsd || 0);
      if (originalPrice <= 0) return json({ error: "Selecciona un paquete primero." }, 400);

      const result = await evaluatePromoCode(env, body.code, originalPrice);
      if (!result.valid) return json({ error: result.error }, 400);

      return json({
        valid: true,
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        originalPriceUsd: result.originalPriceUsd,
        discountUsd: result.discountUsd,
        finalPriceUsd: result.finalPriceUsd
      });
    }

    /* 2.7 VERIFICAR ID DE JUGADOR EN TIEMPO REAL */
    if (method === "GET" && path === "verify-id") {
      return await handleVerifyGameId(request, env);
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
      await env.DB.prepare(
        "INSERT INTO users (id, name, email, password_hash, avatar_url, bio, gender, birthday, age, level_index, level_penalty) VALUES (?, ?, ?, ?, '', '', '', '', NULL, 0, 0)"
      ).bind(id, cleanName, cleanEmail, passwordHash).run();

      const user = await getUserById(env, id);
      const token = await signJwt({ sub: id, name: cleanName, email: cleanEmail, role: "user" }, secret);
      return json({ token, user }, 201);
    }

    if (method === "POST" && path === "auth/login") {
      const { email, password } = await request.json();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const row = await env.DB.prepare("SELECT id, password_hash FROM users WHERE email = ?").bind(cleanEmail).first();

      if (!row || !(await verifyPassword(password || "", row.password_hash))) {
        return json({ error: "Correo o contraseña incorrectos." }, 401);
      }

      const user = await getUserById(env, row.id);
      const token = await signJwt({ sub: user.id, name: user.name, email: user.email, role: "user" }, secret);
      return json({ token, user });
    }

    if (method === "GET" && path === "auth/me") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "No autenticado." }, 401);
      const user = await getUserById(env, payload.sub);
      if (!user) return json({ error: "Usuario no encontrado." }, 401);
      return json({ user });
    }

    /* 4. PERFILES DE USUARIO (AVATAR, BIO, GÉNERO, CUMPLEAÑOS, EDAD, NIVEL) Y CAMBIO DE NOMBRE ($5 USD) */
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
      const current = await getUserById(env, payload.sub, false);
      if (!current) return json({ error: "Usuario no encontrado." }, 404);

      const nextBio = body.bio !== undefined ? String(body.bio).trim().slice(0, 240) : current.bio;
      let nextAvatar = current.avatar_url;
      let nextGender = current.gender;
      let nextBirthday = current.birthday;
      let nextAge = current.age;

      if (body.avatar_url !== undefined) {
        const rawAvatar = String(body.avatar_url || "").trim();
        if (rawAvatar && !rawAvatar.startsWith("/api/media/avatars/")) {
          return json({ error: "URL de foto de perfil inválida." }, 400);
        }
        nextAvatar = rawAvatar;
      }

      if (body.gender !== undefined) {
        const g = String(body.gender || "").trim();
        if (!ALLOWED_GENDERS.includes(g)) {
          return json({ error: "Opción de género no válida." }, 400);
        }
        nextGender = g;
      }

      if (body.birthday !== undefined) {
        const b = String(body.birthday || "").trim();
        if (b && !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
          return json({ error: "Formato de fecha de cumpleaños inválido." }, 400);
        }
        nextBirthday = b;
      }

      if (body.age !== undefined) {
        if (body.age === null || body.age === "") {
          nextAge = nextBirthday ? calculateAgeFromBirthday(nextBirthday) : null;
        } else {
          const parsedAge = parseInt(body.age, 10);
          if (Number.isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
            return json({ error: "La edad debe estar entre 10 y 120 años." }, 400);
          }
          nextAge = parsedAge;
        }
      } else if (body.birthday !== undefined && nextBirthday) {
        const autoAge = calculateAgeFromBirthday(nextBirthday);
        if (autoAge !== null) nextAge = autoAge;
      }

      await env.DB.prepare(
        "UPDATE users SET avatar_url = ?, bio = ?, gender = ?, birthday = ?, age = ? WHERE id = ?"
      ).bind(nextAvatar, nextBio, nextGender, nextBirthday, nextAge, payload.sub).run();

      const updated = await getUserById(env, payload.sub);
      return json({ user: updated });
    }

    if (method === "POST" && path === "profile/name-change") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para solicitar cambio de nombre." }, 401);

      const current = await getUserById(env, payload.sub, false);
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

    /* Directorio público para etiquetas @usuario y perfiles públicos */
    if (method === "GET" && path === "users/public") {
      const { results } = await env.DB.prepare(`
        SELECT id, name,
          COALESCE(avatar_url, '') AS avatar_url,
          COALESCE(bio, '') AS bio,
          COALESCE(gender, '') AS gender,
          COALESCE(birthday, '') AS birthday,
          age,
          COALESCE(level_index, 0) AS level_index
        FROM users ORDER BY name ASC LIMIT 500
      `).all();
      return json({ users: results || [] });
    }

    if (method === "GET" && segments[0] === "users" && segments[1] && segments[1] !== "public") {
      const raw = await env.DB.prepare(`
        SELECT id, name,
          COALESCE(avatar_url, '') AS avatar_url,
          COALESCE(bio, '') AS bio,
          COALESCE(gender, '') AS gender,
          COALESCE(birthday, '') AS birthday,
          age,
          COALESCE(level_index, 0) AS level_index,
          COALESCE(level_penalty, 0) AS level_penalty,
          last_recharge_at, last_decay_at,
          created_at
        FROM users WHERE id = ?
      `).bind(segments[1]).first();
      if (!raw) return json({ error: "Perfil no encontrado." }, 404);

      const synced = await syncUserLevel(env, raw, false);
      return json({
        user: {
          id: synced.id,
          name: synced.name,
          avatar_url: synced.avatar_url,
          bio: synced.bio,
          gender: synced.gender,
          birthday: synced.birthday,
          age: synced.age,
          level_index: synced.level_index,
          level: synced.level,
          created_at: synced.created_at
        }
      });
    }

    /* 5. NOTIFICACIONES (CAMPANITA EN TIEMPO REAL) */
    if (method === "GET" && path === "notifications") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para ver tus notificaciones." }, 401);

      const { results } = await env.DB.prepare(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 40"
      ).bind(payload.sub).all();

      const unreadRow = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0"
      ).bind(payload.sub).first();

      return json({
        notifications: results || [],
        unreadCount: Number(unreadRow?.count || 0)
      });
    }

    if (method === "POST" && path === "notifications/read") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "No autorizado." }, 401);

      const body = await request.json().catch(() => ({}));
      if (body.id) {
        await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
          .bind(String(body.id), payload.sub).run();
      } else {
        await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")
          .bind(payload.sub).run();
      }

      const unreadRow = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0"
      ).bind(payload.sub).first();

      return json({ ok: true, unreadCount: Number(unreadRow?.count || 0) });
    }

    if (method === "DELETE" && path === "notifications") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "No autorizado." }, 401);

      await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(payload.sub).run();
      return json({ ok: true, unreadCount: 0 });
    }

    /* 6. NOTICIAS PÚBLICAS, REACCIONES Y COMENTARIOS EN TIEMPO REAL */
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

      return json({ news, emojis: ALLOWED_EMOJIS, commentEmojis: COMMENT_EMOJIS });
    }

    /* Reaccionar a un comentario específico */
    if (method === "POST" && segments[0] === "news" && segments[1] === "comments" && segments[2] && segments[3] === "react") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Inicia sesión para reaccionar a los comentarios." }, 401);
      }

      const commentId = segments[2];
      const { emoji } = await request.json();
      if (!COMMENT_EMOJIS.includes(emoji)) return json({ error: "Reacción no válida." }, 400);

      const comment = await env.DB.prepare(
        "SELECT id, news_id, user_id, content FROM news_comments WHERE id = ?"
      ).bind(commentId).first();
      if (!comment) return json({ error: "Comentario no encontrado." }, 404);

      const existing = await env.DB.prepare(
        "SELECT id FROM comment_reactions WHERE comment_id = ? AND user_id = ? AND emoji = ?"
      ).bind(commentId, payload.sub, emoji).first();

      let added = false;
      if (existing) {
        await env.DB.prepare("DELETE FROM comment_reactions WHERE id = ?").bind(existing.id).run();
      } else {
        added = true;
        await env.DB.prepare(
          "INSERT INTO comment_reactions (id, comment_id, user_id, emoji) VALUES (?, ?, ?, ?)"
        ).bind("crx_" + crypto.randomUUID(), commentId, payload.sub, emoji).run();
      }

      const { reactions, counts } = await getCommentReactionsSummary(env, commentId, payload.sub);

      await broadcastRealtime(env, {
        scope: "all",
        event: {
          type: "comment_reaction",
          newsId: comment.news_id,
          commentId,
          counts
        }
      });

      if (added && comment.user_id !== payload.sub) {
        const actor = await getUserById(env, payload.sub, false);
        const preview = comment.content.slice(0, 48) + (comment.content.length > 48 ? "..." : "");
        await createAndPushNotification(env, {
          userId: comment.user_id,
          type: "comment_reaction",
          actorId: payload.sub,
          actorName: actor?.name || payload.name,
          actorAvatar: actor?.avatar_url || "",
          newsId: comment.news_id,
          commentId: comment.id,
          message: `${actor?.name || payload.name} reaccionó ${emoji} a tu comentario: "${preview}"`
        });
      }

      return json({ reactions });
    }

    /* Eliminar comentario propio (o cualquier comentario si es Admin) */
    if (method === "DELETE" && segments[0] === "news" && segments[1] === "comments" && segments[2]) {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || (payload.role !== "user" && payload.role !== "admin")) {
        return json({ error: "No autorizado." }, 401);
      }

      const commentId = segments[2];
      const comment = await env.DB.prepare("SELECT id, news_id, user_id FROM news_comments WHERE id = ?").bind(commentId).first();
      if (!comment) return json({ error: "Comentario no encontrado." }, 404);

      if (payload.role !== "admin" && comment.user_id !== payload.sub) {
        return json({ error: "Solo puedes eliminar tus propios comentarios." }, 403);
      }

      await env.DB.prepare(
        "DELETE FROM comment_reactions WHERE comment_id = ? OR comment_id IN (SELECT id FROM news_comments WHERE parent_id = ?)"
      ).bind(commentId, commentId).run();
      await env.DB.prepare("DELETE FROM news_comments WHERE parent_id = ?").bind(commentId).run();
      await env.DB.prepare("DELETE FROM news_comments WHERE id = ?").bind(commentId).run();

      await broadcastRealtime(env, {
        scope: "all",
        event: { type: "comment_deleted", newsId: comment.news_id, commentId }
      });

      return json({ ok: true });
    }

    /* Obtener comentarios de una noticia (con sus reacciones y nivel del autor) */
    if (method === "GET" && segments[0] === "news" && segments[1] && segments[1] !== "comments" && segments[2] === "comments") {
      const newsId = segments[1];
      const payload = await verifyJwt(getBearer(request), secret);
      const currentUserId = payload?.role === "user" ? payload.sub : null;

      const { results: commentRows } = await env.DB.prepare(`
        SELECT
          c.id, c.news_id, c.user_id, c.parent_id, c.reply_to_user_id, c.content, c.created_at,
          u.name AS user_name,
          COALESCE(u.avatar_url, '') AS user_avatar,
          COALESCE(u.bio, '') AS user_bio,
          COALESCE(u.level_index, 0) AS user_level_index,
          ru.name AS reply_to_name
        FROM news_comments c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN users ru ON ru.id = c.reply_to_user_id
        WHERE c.news_id = ?
        ORDER BY c.created_at ASC
        LIMIT 300
      `).bind(newsId).all();

      const { results: reactCounts } = await env.DB.prepare(`
        SELECT cr.comment_id, cr.emoji, COUNT(*) AS count
        FROM comment_reactions cr
        JOIN news_comments nc ON nc.id = cr.comment_id
        WHERE nc.news_id = ?
        GROUP BY cr.comment_id, cr.emoji
      `).bind(newsId).all();

      const myMap = new Map();
      if (currentUserId) {
        const { results: mine } = await env.DB.prepare(`
          SELECT cr.comment_id, cr.emoji
          FROM comment_reactions cr
          JOIN news_comments nc ON nc.id = cr.comment_id
          WHERE nc.news_id = ? AND cr.user_id = ?
        `).bind(newsId, currentUserId).all();
        for (const r of mine || []) {
          if (!myMap.has(r.comment_id)) myMap.set(r.comment_id, new Set());
          myMap.get(r.comment_id).add(r.emoji);
        }
      }

      const comments = (commentRows || []).map(c => {
        const reactions = {};
        const mySet = myMap.get(c.id) || new Set();
        for (const emoji of COMMENT_EMOJIS) {
          const found = (reactCounts || []).find(r => r.comment_id === c.id && r.emoji === emoji);
          reactions[emoji] = {
            count: found ? Number(found.count) : 0,
            reacted: mySet.has(emoji)
          };
        }
        return { ...c, reactions };
      });

      return json({ comments, commentEmojis: COMMENT_EMOJIS });
    }

    /* Reaccionar a una noticia */
    if (method === "POST" && segments[0] === "news" && segments[1] && segments[1] !== "comments" && segments[2] === "react") {
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

      const { reactions, counts } = await getNewsReactionsSummary(env, newsId, payload.sub);

      await broadcastRealtime(env, {
        scope: "all",
        event: { type: "news_reaction", newsId, counts }
      });

      return json({ reactions });
    }

    /* Publicar comentario / respuesta / mención @ */
    if (method === "POST" && segments[0] === "news" && segments[1] && segments[1] !== "comments" && segments[2] === "comments") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Inicia sesión para comentar." }, 401);
      }

      const newsId = segments[1];
      const newsRow = await env.DB.prepare("SELECT id, title FROM news WHERE id = ?").bind(newsId).first();
      if (!newsRow) return json({ error: "Noticia no encontrada." }, 404);

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
        parentId = parent.parent_id || parent.id;
        if (!replyToUserId) replyToUserId = parent.user_id;
      }

      const id = "ncm_" + crypto.randomUUID();
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO news_comments (id, news_id, user_id, parent_id, reply_to_user_id, content, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, newsId, payload.sub, parentId, replyToUserId, content, createdAt).run();

      const author = await getUserById(env, payload.sub, false);
      let replyToName = null;
      if (replyToUserId) {
        const target = await env.DB.prepare("SELECT name FROM users WHERE id = ?").bind(replyToUserId).first();
        replyToName = target?.name || null;
      }

      const commentObj = {
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
        user_bio: author?.bio || "",
        user_level_index: Number(author?.level_index || 0),
        reactions: emptyCommentReactions()
      };

      await broadcastRealtime(env, {
        scope: "all",
        event: { type: "comment_created", newsId, comment: commentObj }
      });

      const notified = new Set([payload.sub]);
      const snippet = content.slice(0, 60) + (content.length > 60 ? "..." : "");

      if (replyToUserId && !notified.has(replyToUserId)) {
        notified.add(replyToUserId);
        await createAndPushNotification(env, {
          userId: replyToUserId,
          type: "reply",
          actorId: payload.sub,
          actorName: commentObj.user_name,
          actorAvatar: commentObj.user_avatar,
          newsId,
          commentId: id,
          message: `${commentObj.user_name} respondió a tu comentario en "${newsRow.title}": ${snippet}`
        });
      }

      if (content.includes("@")) {
        const { results: allUsers } = await env.DB.prepare("SELECT id, name FROM users LIMIT 500").all();
        const sortedUsers = (allUsers || [])
          .filter(u => u.name && !notified.has(u.id))
          .sort((a, b) => b.name.length - a.name.length);

        for (const u of sortedUsers) {
          const mentionRegex = new RegExp(`(?:^|[\\s(])@${escapeRegex(u.name)}(?![\\wÁÉÍÓÚáéíóúÑñ])`, "i");
          if (mentionRegex.test(content)) {
            notified.add(u.id);
            await createAndPushNotification(env, {
              userId: u.id,
              type: "mention",
              actorId: payload.sub,
              actorName: commentObj.user_name,
              actorAvatar: commentObj.user_avatar,
              newsId,
              commentId: id,
              message: `${commentObj.user_name} te etiquetó en "${newsRow.title}": ${snippet}`
            });
          }
        }
      }

      return json({ comment: commentObj }, 201);
    }

    /* 7. SUBIDA DE IMÁGENES A R2 */
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

    /* 8. CREAR PEDIDO DE RECARGA (CON CÓDIGO DE DESCUENTO/REFERIDO OPCIONAL) */
    if (method === "POST" && path === "orders") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") {
        return json({ error: "Es obligatorio iniciar sesión para poder recargar." }, 401);
      }

      const currentUser = await getUserById(env, payload.sub, false);
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
      const rawPromo = String(body.promoCode || "").trim();

      if (!game || !pkg || !pay) return json({ error: "Juego, paquete o método de pago inválido." }, 400);
      if (!playerId) return json({ error: "El ID de jugador es obligatorio." }, 400);
      if (game.needsZone && !zoneId) return json({ error: "El Zone ID es obligatorio." }, 400);
      if (!reference) return json({ error: "El código de referencia es obligatorio." }, 400);
      if (!receiptUrl) return json({ error: "Debes adjuntar la captura del comprobante de pago." }, 400);

      const originalPriceUsd = Number(pkg.priceUsd);
      let appliedCode = "";
      let discountUsd = 0;
      let finalPriceUsd = originalPriceUsd;

      if (rawPromo) {
        const promoEval = await evaluatePromoCode(env, rawPromo, originalPriceUsd);
        if (!promoEval.valid) return json({ error: promoEval.error }, 400);
        appliedCode = promoEval.code;
        discountUsd = promoEval.discountUsd;
        finalPriceUsd = promoEval.finalPriceUsd;
      }

      const bsTotal = finalPriceUsd * Number(store.config.bsRate || 1);
      const amountDisplay = pay.currency === "VES"
        ? `${bsTotal.toFixed(2)} Bs ($${finalPriceUsd.toFixed(2)})`
        : `$${finalPriceUsd.toFixed(2)}`;

      const id = "ord_" + crypto.randomUUID();
      const code = "ARC-" + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO orders (
          id, code, user_id, user_name, user_email, game_id, game_name,
          player_id, zone_id, nickname, package_name, price_usd,
          original_price_usd, discount_usd, promo_code,
          amount_display, payment_name, reference, receipt_url, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?)
      `).bind(
        id, code, payload.sub, userName, userEmail, game.id, game.name,
        playerId, zoneId, nickname, pkg.name, finalPriceUsd,
        originalPriceUsd, discountUsd, appliedCode,
        amountDisplay, pay.name, reference, receiptUrl, createdAt
      ).run();

      return json({
        order: {
          id, code, user_id: payload.sub, user_name: userName, user_email: userEmail,
          game_name: game.name, player_id: playerId, zone_id: zoneId, nickname,
          package_name: pkg.name, price_usd: finalPriceUsd,
          original_price_usd: originalPriceUsd, discount_usd: discountUsd, promo_code: appliedCode,
          amount_display: amountDisplay, payment_name: pay.name, reference, receipt_url: receiptUrl,
          status: "Pendiente", created_at: createdAt
        }
      }, 201);
    }

    /* 9. HISTORIAL DEL USUARIO AUTENTICADO */
    if (method === "GET" && path === "orders/mine") {
      const payload = await verifyJwt(getBearer(request), secret);
      if (!payload || payload.role !== "user") return json({ error: "Inicia sesión para ver tu historial." }, 401);

      const { results } = await env.DB.prepare(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100"
      ).bind(payload.sub).all();

      return json({ orders: results || [] });
    }

    /* 10. LOGIN DE ADMINISTRADOR */
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

    /* 11. RUTAS PROTEGIDAS DE ADMINISTRADOR */
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
        const orderId = segments[2];
        const { status } = await request.json();
        const allowed = ["Pendiente", "Procesando", "Completado", "Rechazado"];
        if (!allowed.includes(status)) return json({ error: "Estado inválido." }, 400);

        const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!order) return json({ error: "Pedido no encontrado." }, 404);

        const prevStatus = order.status;
        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, orderId).run();

        if (status !== prevStatus && (status === "Completado" || prevStatus === "Completado")) {
          await handleOrderCompletionLevel(env, order, status, prevStatus);
        }

        return json({ ok: true });
      }

      /* GESTIÓN DE CÓDIGOS DE DESCUENTO Y REFERIDOS (EXCLUSIVO ADMIN) */
      if (method === "GET" && path === "admin/promos") {
        const { results: codes } = await env.DB.prepare(
          "SELECT * FROM promo_codes ORDER BY created_at DESC"
        ).all();

        const { results: statsRows } = await env.DB.prepare(`
          SELECT
            UPPER(promo_code) AS code,
            COUNT(CASE WHEN status != 'Rechazado' THEN 1 END) AS total_uses,
            COUNT(CASE WHEN status = 'Completado' THEN 1 END) AS completed_uses,
            COUNT(CASE WHEN status IN ('Pendiente', 'Procesando') THEN 1 END) AS pending_uses,
            COALESCE(SUM(CASE WHEN status = 'Completado' THEN price_usd ELSE 0 END), 0) AS total_sales_usd,
            COALESCE(SUM(CASE WHEN status = 'Completado' THEN COALESCE(discount_usd, 0) ELSE 0 END), 0) AS total_discount_usd
          FROM orders
          WHERE COALESCE(promo_code, '') != ''
          GROUP BY UPPER(promo_code)
        `).all();

        const statsMap = new Map((statsRows || []).map(s => [s.code, s]));
        const promos = (codes || []).map(p => {
          const st = statsMap.get(String(p.code).toUpperCase()) || {};
          return {
            ...p,
            active: Boolean(p.active),
            total_uses: Number(st.total_uses || 0),
            completed_uses: Number(st.completed_uses || 0),
            pending_uses: Number(st.pending_uses || 0),
            total_sales_usd: Number(st.total_sales_usd || 0),
            total_discount_usd: Number(st.total_discount_usd || 0)
          };
        });

        return json({ promos });
      }

      if (method === "POST" && path === "admin/promos") {
        const body = await request.json();
        const code = normalizePromoCode(body.code);
        const ownerName = String(body.owner_name || "").trim().slice(0, 60);
        const discountType = body.discount_type === "fixed" ? "fixed" : "percent";
        const discountValue = Math.max(0, Number(body.discount_value || 0));
        const maxUses = body.max_uses === "" || body.max_uses === null || body.max_uses === undefined
          ? null
          : Math.max(1, parseInt(body.max_uses, 10) || 1);

        if (code.length < 2) return json({ error: "El código debe tener al menos 2 letras o números." }, 400);
        if (discountType === "percent" && discountValue > 100) {
          return json({ error: "El porcentaje de descuento no puede superar el 100%." }, 400);
        }

        const exists = await env.DB.prepare("SELECT id FROM promo_codes WHERE UPPER(code) = ?").bind(code).first();
        if (exists) return json({ error: "Ese código ya existe." }, 409);

        const id = "prm_" + crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO promo_codes (id, code, owner_name, discount_type, discount_value, max_uses, active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(id, code, ownerName, discountType, discountValue, maxUses).run();

        return json({ ok: true, id, code }, 201);
      }

      if (method === "PATCH" && segments[0] === "admin" && segments[1] === "promos" && segments[2]) {
        const promoId = segments[2];
        const body = await request.json();
        const existing = await env.DB.prepare("SELECT * FROM promo_codes WHERE id = ?").bind(promoId).first();
        if (!existing) return json({ error: "Código no encontrado." }, 404);

        const active = body.active !== undefined ? (body.active ? 1 : 0) : existing.active;
        const ownerName = body.owner_name !== undefined ? String(body.owner_name).trim().slice(0, 60) : existing.owner_name;
        const discountType = body.discount_type !== undefined
          ? (body.discount_type === "fixed" ? "fixed" : "percent")
          : existing.discount_type;
        const discountValue = body.discount_value !== undefined
          ? Math.max(0, Number(body.discount_value || 0))
          : existing.discount_value;
        const maxUses = body.max_uses !== undefined
          ? (body.max_uses === "" || body.max_uses === null ? null : Math.max(1, parseInt(body.max_uses, 10) || 1))
          : existing.max_uses;

        if (discountType === "percent" && discountValue > 100) {
          return json({ error: "El descuento porcentual no puede superar el 100%." }, 400);
        }

        await env.DB.prepare(
          "UPDATE promo_codes SET active = ?, owner_name = ?, discount_type = ?, discount_value = ?, max_uses = ? WHERE id = ?"
        ).bind(active, ownerName, discountType, discountValue, maxUses, promoId).run();

        return json({ ok: true });
      }

      if (method === "DELETE" && segments[0] === "admin" && segments[1] === "promos" && segments[2]) {
        await env.DB.prepare("DELETE FROM promo_codes WHERE id = ?").bind(segments[2]).run();
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

        const msg = status === "Aprobado"
          ? `¡Tu cambio de nombre a "${reqRow.new_name}" fue aprobado!`
          : `Tu solicitud de cambio de nombre a "${reqRow.new_name}" fue rechazada. Contáctanos por WhatsApp si necesitas ayuda.`;

        await createAndPushNotification(env, {
          userId: reqRow.user_id,
          type: "name_change",
          actorName: "ArcanStore",
          message: msg
        });

        if (status === "Aprobado") {
          await broadcastRealtime(env, {
            scope: "users",
            userIds: [reqRow.user_id],
            event: { type: "name_changed", userId: reqRow.user_id, newName: reqRow.new_name }
          });
        }

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

        const notifMsg = `Nueva noticia: ${title}`;
        await env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, actor_name, news_id, message, is_read, created_at)
          SELECT 'ntf_' || lower(hex(randomblob(8))), id, 'news', 'ArcanStore', ?, ?, 0, ?
          FROM users
        `).bind(id, notifMsg, now).run();

        const emptyNewsReactions = {};
        for (const e of ALLOWED_EMOJIS) emptyNewsReactions[e] = { count: 0, reacted: false };

        const newsObj = {
          id, title, content, image_url: imageUrl, tag,
          pinned: Boolean(pinned), created_at: now, updated_at: now,
          reactions: emptyNewsReactions, comments_count: 0
        };

        await broadcastRealtime(env, {
          scope: "all",
          event: { type: "news_created", news: newsObj, message: notifMsg }
        });

        return json({ news: newsObj }, 201);
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

        await broadcastRealtime(env, {
          scope: "all",
          event: { type: "news_updated", newsId }
        });

        return json({ ok: true });
      }

      if (method === "DELETE" && segments[0] === "admin" && segments[1] === "news" && segments[2]) {
        const newsId = segments[2];
        await env.DB.prepare(
          "DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM news_comments WHERE news_id = ?)"
        ).bind(newsId).run();
        await env.DB.prepare("DELETE FROM news_comments WHERE news_id = ?").bind(newsId).run();
        await env.DB.prepare("DELETE FROM news_reactions WHERE news_id = ?").bind(newsId).run();
        await env.DB.prepare("DELETE FROM notifications WHERE news_id = ?").bind(newsId).run();
        await env.DB.prepare("DELETE FROM news WHERE id = ?").bind(newsId).run();

        await broadcastRealtime(env, {
          scope: "all",
          event: { type: "news_deleted", newsId }
        });

        return json({ ok: true });
      }

      if (method === "DELETE" && segments[0] === "admin" && segments[1] === "comments" && segments[2]) {
        const commentId = segments[2];
        const comment = await env.DB.prepare("SELECT news_id FROM news_comments WHERE id = ?").bind(commentId).first();
        await env.DB.prepare(
          "DELETE FROM comment_reactions WHERE comment_id = ? OR comment_id IN (SELECT id FROM news_comments WHERE parent_id = ?)"
        ).bind(commentId, commentId).run();
        await env.DB.prepare("DELETE FROM news_comments WHERE parent_id = ?").bind(commentId).run();
        await env.DB.prepare("DELETE FROM news_comments WHERE id = ?").bind(commentId).run();

        if (comment?.news_id) {
          await broadcastRealtime(env, {
            scope: "all",
            event: { type: "comment_deleted", newsId: comment.news_id, commentId }
          });
        }
        return json({ ok: true });
      }
    }

    return json({ error: "Ruta no encontrada." }, 404);
  } catch (err) {
    return json({ error: "Error interno del servidor.", detail: err.message }, 500);
  }
}
