package com.gguip1.idempotencykeystudybe.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String productName;

    private int quantity;

    private LocalDateTime createdAt;

    protected Order() {

    }

    private Order(String productName, int quantity) {
        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException("상품명은 비어 있을 수 없습니다.");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("주문 수량은 1개 이상이어야 합니다.");
        }

        this.productName = productName;
        this.quantity = quantity;
        this.createdAt = LocalDateTime.now();
    }

    public static Order create(String productName, int quantity) {
        return new Order(productName, quantity);
    }
}
