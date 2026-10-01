CREATE TABLE albums (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by      UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT,
    destination_id  UUID REFERENCES destinations(id) ON DELETE SET NULL,
    experience_id   UUID REFERENCES experiences(id) ON DELETE SET NULL,
    cover_photo_id  UUID,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_albums_updated_at
BEFORE UPDATE ON albums
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_albums_status ON albums(status);
CREATE INDEX idx_albums_destination ON albums(destination_id);

CREATE TABLE photos (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id               UUID REFERENCES albums(id) ON DELETE SET NULL,
    destination_id         UUID REFERENCES destinations(id) ON DELETE SET NULL,
    attraction_id          UUID REFERENCES attractions(id) ON DELETE SET NULL,
    experience_id          UUID REFERENCES experiences(id) ON DELETE SET NULL,
    category_id            UUID REFERENCES categories(id) ON DELETE SET NULL,

    title                  VARCHAR(255) NOT NULL,
    slug                   VARCHAR(280) NOT NULL UNIQUE,
    description            TEXT,

    original_storage_key   TEXT NOT NULL,
    preview_storage_key    TEXT,
    thumbnail_storage_key  TEXT,
    watermark_storage_key  TEXT,

    mime_type              VARCHAR(100),
    width                  INTEGER,
    height                 INTEGER,
    file_size_bytes        BIGINT,

    price                  NUMERIC(12,2) NOT NULL,
    currency               CHAR(3) NOT NULL DEFAULT 'USD',

    status                 VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    captured_at            TIMESTAMPTZ,

    created_by             UUID NOT NULL REFERENCES users(id),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_photos_updated_at
BEFORE UPDATE ON photos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_photos_status ON photos(status);
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_photos_destination ON photos(destination_id);
CREATE INDEX idx_photos_experience ON photos(experience_id);
CREATE INDEX idx_photos_category ON photos(category_id);
CREATE INDEX idx_photos_price ON photos(price);

-- Full text search index
CREATE INDEX idx_photos_title_fts
ON photos USING gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

CREATE TABLE tags (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE photo_tags (
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_id   UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (photo_id, tag_id)
);

ALTER TABLE albums
    ADD CONSTRAINT fk_albums_cover_photo
    FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

    