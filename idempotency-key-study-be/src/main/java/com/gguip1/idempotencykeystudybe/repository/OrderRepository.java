package com.gguip1.idempotencykeystudybe.repository;

import com.gguip1.idempotencykeystudybe.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
