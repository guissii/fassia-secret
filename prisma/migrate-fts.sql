-- ============================================
-- PostgreSQL Full-Text Search Migration
-- ============================================
-- Execute this SQL on your PostgreSQL database:
-- psql -U postgres -d fassia_secret -f prisma/migrate-fts.sql

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Add tsvector column if not exists
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON "Product" USING GIN("searchVector");

-- 4. Create function to auto-update searchVector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION products_search_update()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('french', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('french', unaccent(coalesce(NEW.brand, ''))), 'A') ||
    setweight(to_tsvector('french', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('french', unaccent(coalesce(array_to_string(NEW.tags, ' '), ''))), 'C') ||
    setweight(to_tsvector('french', unaccent(coalesce(array_to_string(NEW.concerns, ' '), ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger
DROP TRIGGER IF EXISTS tsvectorupdate ON "Product";
CREATE TRIGGER tsvectorupdate
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION products_search_update();

-- 6. Populate existing data
UPDATE "Product" SET "searchVector" = 
  setweight(to_tsvector('french', unaccent(coalesce(name, ''))), 'A') ||
  setweight(to_tsvector('french', unaccent(coalesce(brand, ''))), 'A') ||
  setweight(to_tsvector('french', unaccent(coalesce(description, ''))), 'B') ||
  setweight(to_tsvector('french', unaccent(coalesce(array_to_string(tags, ' '), ''))), 'C') ||
  setweight(to_tsvector('french', unaccent(coalesce(array_to_string(concerns, ' '), ''))), 'C');

-- 7. Create a simpler ILIKE index for fallback search (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON "Product" USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON "Product" USING GIN (brand gin_trgm_ops);
