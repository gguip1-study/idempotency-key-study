package com.gguip1.idempotencykeystudybe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record OrderRequest(
        @NotBlank String productName,
        @Positive int quantity
) {
}
