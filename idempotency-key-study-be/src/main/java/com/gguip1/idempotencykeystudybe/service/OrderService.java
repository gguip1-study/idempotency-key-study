package com.gguip1.idempotencykeystudybe.service;

import com.gguip1.idempotencykeystudybe.dto.OrderRequest;
import com.gguip1.idempotencykeystudybe.dto.OrderResponse;
import com.gguip1.idempotencykeystudybe.entity.Order;
import com.gguip1.idempotencykeystudybe.repository.OrderRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order saved = orderRepository.save(
            Order.create(request.productName(), request.quantity())
        );
        return OrderResponse.from(saved);
    }
}
