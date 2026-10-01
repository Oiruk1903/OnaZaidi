CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number      VARCHAR(50) NOT NULL UNIQUE,
    customer_id       UUID NOT NULL REFERENCES users(id),

    subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,

    currency          CHAR(3) NOT NULL DEFAULT 'USD',
    status            VARCHAR(40) NOT NULL DEFAULT 'CREATED',

    customer_email    VARCHAR(255) NOT NULL,
    customer_name     VARCHAR(255) NOT NULL,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    photo_id       UUID NOT NULL REFERENCES photos(id),

    product_name   VARCHAR(255) NOT NULL,
    license_type   VARCHAR(50),
    unit_price     NUMERIC(12,2) NOT NULL,
    quantity       INTEGER NOT NULL DEFAULT 1,
    subtotal       NUMERIC(12,2) NOT NULL,

    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_photo ON order_items(photo_id);

CREATE TABLE payments (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    provider             VARCHAR(50) NOT NULL,
    provider_payment_id  VARCHAR(255),

    amount               NUMERIC(12,2) NOT NULL,
    currency             CHAR(3) NOT NULL,

    status               VARCHAR(40) NOT NULL DEFAULT 'INITIATED',
    failure_reason       TEXT,

    idempotency_key      VARCHAR(255),

    raw_init_response    JSONB,
    raw_verify_response  JSONB,

    paid_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (provider, provider_payment_id)
);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider);

CREATE TABLE payment_webhooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(50) NOT NULL,
    event_id        VARCHAR(255) NOT NULL,
    event_type      VARCHAR(100),
    payload         JSONB NOT NULL,
    signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
    processed       BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (provider, event_id)
);

CREATE INDEX idx_webhooks_processed ON payment_webhooks(processed);