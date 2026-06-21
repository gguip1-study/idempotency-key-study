package com.gguip1.idempotencykeystudybe.common.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public HealthCheckResponse health() {
        return new HealthCheckResponse("UP", "idempotency-key-study-be");
    }
}
