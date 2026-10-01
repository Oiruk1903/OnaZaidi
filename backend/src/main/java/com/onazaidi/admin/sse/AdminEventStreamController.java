package com.onazaidi.admin.sse;

import com.onazaidi.order.event.OrderCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/events")
public class AdminEventStreamController {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);   // never times out
        String id = java.util.UUID.randomUUID().toString();
        emitters.put(id, emitter);

        emitter.onCompletion(() -> emitters.remove(id));
        emitter.onTimeout(() -> emitters.remove(id));
        emitter.onError((e) -> emitters.remove(id));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            emitters.remove(id);
        }
        return emitter;
    }

    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emitters.forEach((id, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("order-created")
                        .data(Map.of(
                                "orderNumber", event.orderNumber(),
                                "customerEmail", event.customerEmail(),
                                "totalAmount", event.totalAmount(),
                                "currency", event.currency()
                        )));
            } catch (IOException e) {
                emitters.remove(id);
            }
        });
    }
}

