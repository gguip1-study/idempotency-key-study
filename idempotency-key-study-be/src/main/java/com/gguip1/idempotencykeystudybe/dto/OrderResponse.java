package com.gguip1.idempotencykeystudybe.dto;

import com.gguip1.idempotencykeystudybe.entity.Order;

public record OrderResponse(
        Long id,
        String productName,
        int quantity
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getProductName(),
                order.getQuantity()
        );
    }
}
