package com.onazaidi.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_webhooks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWebhook {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "event_id", nullable = false, length = 255)
    private String eventId;

    @Column(name = "event_type", length = 100)
    private String eventType;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Column(name = "signature_valid", nullable = false)
    private boolean signatureValid;

    @Column(nullable = false)
    @Builder.Default
    private boolean processed = false;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}