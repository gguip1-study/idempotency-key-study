package com.gguip1.idempotencykeystudybe.controller;

import com.gguip1.idempotencykeystudybe.dto.OrderRequest;
import com.gguip1.idempotencykeystudybe.dto.OrderResponse;
import com.gguip1.idempotencykeystudybe.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/api/orders")
    public List<OrderResponse> getOrders() {
        return orderService.getOrders();
    }

    @PostMapping("/api/orders")
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        return orderService.createOrder(orderRequest);
    }
}
