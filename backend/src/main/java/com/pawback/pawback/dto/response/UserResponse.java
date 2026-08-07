package com.pawback.pawback.dto.response;

import com.pawback.pawback.model.AuthProvider;
import com.pawback.pawback.model.Role;
import com.pawback.pawback.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private Role role;
    private AuthProvider provider;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
