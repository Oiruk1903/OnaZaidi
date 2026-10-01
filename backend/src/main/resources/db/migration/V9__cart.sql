CREATE TABLE carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE cart_items (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id   UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    photo_id  UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, photo_id)
);

CREATE INDEX idx_cart_items_cart  ON cart_items(cart_id);
CREATE INDEX idx_cart_items_photo ON cart_items(photo_id);
