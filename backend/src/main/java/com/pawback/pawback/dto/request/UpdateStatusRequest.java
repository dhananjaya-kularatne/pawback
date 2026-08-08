package com.pawback.pawback.dto.request;

import com.pawback.pawback.model.PetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

// Request body for toggling a pet's Lost/Safe status
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private PetStatus status;
}