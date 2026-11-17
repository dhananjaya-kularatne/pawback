package com.pawback.pawback.dto.request;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePetRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be 100 characters or fewer")
    private String name;
    @Size(max = 100, message = "Breed must be 100 characters or fewer")
    private String breed;
    @Size(max = 255, message = "Description must be 255 characters or fewer")
    private String description;
    @Size(max = 255, message = "If found instructions must be 255 characters or fewer")
    private String ifFoundInstructions;
}
