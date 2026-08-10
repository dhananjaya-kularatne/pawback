package com.pawback.pawback.dto.response;

import com.pawback.pawback.model.PetStatus;
import lombok.*;

// Public-facing pet info shown to a finder who scans a QR code — deliberately excludes owner details and internal fields
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicPetResponse {

    private String name;
    private String photoUrl;
    private PetStatus status;
    private String breed;
    private String description;
    private String ifFoundInstructions;
}