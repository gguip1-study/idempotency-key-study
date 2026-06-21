package com.gguip1.idempotencykeystudybe.common.health;

public record HealthCheckResponse(
        String status,
        String service
) {
}
