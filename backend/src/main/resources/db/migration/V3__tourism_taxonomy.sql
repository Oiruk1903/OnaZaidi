CREATE TABLE destinations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    description     TEXT,
    region          VARCHAR(150),
    country         VARCHAR(100) NOT NULL DEFAULT 'Tanzania',
    cover_image_key TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    seo_title       VARCHAR(255),
    seo_description TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_destinations_updated_at
BEFORE UPDATE ON destinations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_destinations_status ON destinations(status);

CREATE TABLE attractions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(180) NOT NULL UNIQUE,
    description    TEXT,
    status         VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_attractions_updated_at
BEFORE UPDATE ON attractions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_attractions_destination ON attractions(destination_id);

CREATE TABLE experiences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    status      VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_experiences_updated_at
BEFORE UPDATE ON experiences
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    status      VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();