ALTER TABLE pages ADD COLUMN show_in_nav INTEGER NOT NULL DEFAULT 0;

CREATE TABLE datos_secciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE datos_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seccion_id INTEGER NOT NULL REFERENCES datos_secciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  valor TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
