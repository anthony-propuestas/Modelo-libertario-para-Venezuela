ALTER TABLE blocks RENAME TO blocks_old;
CREATE TABLE blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK(type IN ('heading','text','image','video','table')),
  content TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO blocks SELECT * FROM blocks_old;
DROP TABLE blocks_old;
CREATE INDEX idx_blocks_section ON blocks(section_id, order_index);
CREATE INDEX idx_blocks_page ON blocks(page_id, order_index);
