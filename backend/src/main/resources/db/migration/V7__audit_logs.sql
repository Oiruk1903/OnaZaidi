CREATE TABLE audit_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    action         VARCHAR(100) NOT NULL,
    entity_type    VARCHAR(100),
    entity_id      UUID,
    old_values     JSONB,
    new_values     JSONB,
    ip_address     VARCHAR(64),
    user_agent     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);