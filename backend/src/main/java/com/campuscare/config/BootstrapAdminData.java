package com.campuscare.config;

import com.campuscare.entity.User;
import com.campuscare.entity.UserRole;
import com.campuscare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class BootstrapAdminData {

    @Bean
    ApplicationRunner bootstrapAdmin(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${campuscare.bootstrap-admin.email:}") String configuredEmail,
            @Value("${campuscare.bootstrap-admin.name:CampusCare Admin}") String configuredName,
            @Value("${campuscare.bootstrap-admin.password:}") String configuredPassword
    ) {
        return args -> {
            if (configuredEmail.isBlank()) {
                return;
            }
            if (configuredPassword.length() < 12) {
                throw new IllegalStateException(
                        "Set BOOTSTRAP_ADMIN_PASSWORD to a password of at least 12 characters."
                );
            }

            String email = configuredEmail.trim().toLowerCase(Locale.ROOT);
            User existing = users.findByEmail(email).orElse(null);
            if (existing != null) {
                if (existing.getRole() != UserRole.ADMIN) {
                    throw new IllegalStateException(
                            "The configured bootstrap admin email already belongs to a non-admin account."
                    );
                }
                return;
            }

            User admin = new User();
            admin.setEmail(email);
            admin.setName(configuredName.trim());
            admin.setPasswordHash(passwordEncoder.encode(configuredPassword));
            admin.setRole(UserRole.ADMIN);
            users.save(admin);
        };
    }
}
