CREATE TABLE download_entitlements (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id         UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    photo_id              UUID NOT NULL REFERENCES photos(id),

    status                VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    download_count        INTEGER NOT NULL DEFAULT 0,
    max_downloads         INTEGER NOT NULL DEFAULT 10,
    last_downloaded_at    TIMESTAMPTZ,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entitlements_user ON download_entitlements(user_id);
CREATE INDEX idx_entitlements_photo ON download_entitlements(photo_id);
CREATE INDEX idx_entitlements_order_item ON download_entitlements(order_item_id);

CREATE TABLE downloads (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entitlement_id   UUID NOT NULL REFERENCES download_entitlements(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES users(id),
    photo_id         UUID NOT NULL REFERENCES photos(id),
    ip_address       VARCHAR(64),
    user_agent       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_entitlement ON downloads(entitlement_id);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(100) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    metadata    JSONB,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);