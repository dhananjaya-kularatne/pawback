package com.pawback.pawback.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePetRequest {

    private String name;
    private String breed;
    private String description;
    private String ifFoundInstructions;
}