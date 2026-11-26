ALTER TABLE users ADD COLUMN level_index INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN level_penalty INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_recharge_at TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN last_decay_at TEXT DEFAULT NULL;

ALTER TABLE orders ADD COLUMN promo_code TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN original_price_usd REAL DEFAULT NULL;
ALTER TABLE orders ADD COLUMN discount_usd REAL DEFAULT 0;

CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  owner_name TEXT DEFAULT '',
  discount_type TEXT DEFAULT 'percent',
  discount_value REAL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_promo ON orders(promo_code);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
