package com.pawback.pawback.dto.response;

import com.pawback.pawback.model.PetStatus;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetResponse {

    private Long id;
    private UUID petUuid;
    private String name;
    private String breed;
    private String description;
    private String ifFoundInstructions;
    private String photoUrl;
    private PetStatus status;
}