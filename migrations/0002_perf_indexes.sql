-- Mejora rendimiento de queries filtradas por published (homepage, Layout nav)
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published, title);
