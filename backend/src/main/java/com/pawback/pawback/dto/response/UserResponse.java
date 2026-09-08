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
    // Whether the account may still sign in — an admin can flip this off to
    // moderate a user. The admin user list renders this as an Enabled/Disabled badge.
    private boolean enabled;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole())
                .provider(user.getProvider())
                .enabled(user.isEnabled())
                .build();
    }
}
