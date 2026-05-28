export interface Page {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  published: number;
  created_at: string;
}

export interface Section {
  id: number;
  page_id: number;
  title: string;
  slug: string;
  order_index: number;
  created_at: string;
}

export interface Block {
  id: number;
  page_id: number;
  section_id: number | null;
  type: 'heading' | 'text' | 'image' | 'video' | 'table';
  content: string;
  order_index: number;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

export const pages = {
  listPublished: (db: DB) =>
    db.prepare('SELECT * FROM pages WHERE published=1 ORDER BY title').all() as Promise<{ results: Page[] }>,

  listAll: (db: DB) =>
    db.prepare('SELECT * FROM pages ORDER BY created_at DESC').all() as Promise<{ results: Page[] }>,

  getBySlug: (db: DB, slug: string) =>
    db.prepare('SELECT * FROM pages WHERE slug=?').bind(slug).first() as Promise<Page | null>,

  getPublishedBySlug: (db: DB, slug: string) =>
    db.prepare('SELECT * FROM pages WHERE slug=? AND published=1').bind(slug).first() as Promise<Page | null>,

  create: (db: DB, slug: string, title: string, description: string | null) =>
    db.prepare('INSERT INTO pages (slug, title, description) VALUES (?,?,?) RETURNING *')
      .bind(slug, title, description).first() as Promise<Page>,

  update: (db: DB, id: number, title: string, description: string | null, published: number) =>
    db.prepare('UPDATE pages SET title=?, description=?, published=? WHERE id=?')
      .bind(title, description, published, id).run(),

  updateWithSlug: (db: DB, id: number, slug: string, title: string, description: string | null, published: number) =>
    db.prepare('UPDATE pages SET slug=?, title=?, description=?, published=? WHERE id=?')
      .bind(slug, title, description, published, id).run(),

  delete: (db: DB, id: number) =>
    db.prepare('DELETE FROM pages WHERE id=?').bind(id).run(),
};

export const sections = {
  listByPage: (db: DB, pageId: number) =>
    db.prepare('SELECT * FROM sections WHERE page_id=? ORDER BY order_index').bind(pageId).all() as Promise<{ results: Section[] }>,

  getById: (db: DB, id: number) =>
    db.prepare('SELECT * FROM sections WHERE id=?').bind(id).first() as Promise<Section | null>,

  create: (db: DB, pageId: number, title: string, slug: string, orderIndex: number) =>
    db.prepare('INSERT INTO sections (page_id, title, slug, order_index) VALUES (?,?,?,?) RETURNING *')
      .bind(pageId, title, slug, orderIndex).first() as Promise<Section>,

  update: (db: DB, id: number, title: string, slug: string, orderIndex: number) =>
    db.prepare('UPDATE sections SET title=?, slug=?, order_index=? WHERE id=?')
      .bind(title, slug, orderIndex, id).run(),

  delete: (db: DB, id: number) =>
    db.prepare('DELETE FROM sections WHERE id=?').bind(id).run(),
};

export const blocks = {
  listBySection: (db: DB, sectionId: number) =>
    db.prepare('SELECT * FROM blocks WHERE section_id=? ORDER BY order_index').bind(sectionId).all() as Promise<{ results: Block[] }>,

  listByPage: (db: DB, pageId: number) =>
    db.prepare('SELECT * FROM blocks WHERE page_id=? ORDER BY section_id, order_index').bind(pageId).all() as Promise<{ results: Block[] }>,

  getById: (db: DB, id: number) =>
    db.prepare('SELECT * FROM blocks WHERE id=?').bind(id).first() as Promise<Block | null>,

  create: (db: DB, pageId: number, sectionId: number | null, type: string, content: string, orderIndex: number) =>
    db.prepare('INSERT INTO blocks (page_id, section_id, type, content, order_index) VALUES (?,?,?,?,?) RETURNING *')
      .bind(pageId, sectionId, type, content, orderIndex).first() as Promise<Block>,

  update: (db: DB, id: number, content: string, orderIndex: number) =>
    db.prepare('UPDATE blocks SET content=?, order_index=? WHERE id=?')
      .bind(content, orderIndex, id).run(),

  delete: (db: DB, id: number) =>
    db.prepare('DELETE FROM blocks WHERE id=?').bind(id).run(),
};
