package com.pawback.pawback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePetRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String breed;
    private String description;
    private String ifFoundInstructions;
}