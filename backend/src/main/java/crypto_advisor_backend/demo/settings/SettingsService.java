package crypto_advisor_backend.demo.settings;

import crypto_advisor_backend.demo.auth.UserResponse;
import crypto_advisor_backend.demo.security.JwtService;
import crypto_advisor_backend.demo.user.User;
import crypto_advisor_backend.demo.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class SettingsService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsService(JwtService jwtService,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse updateName(String authHeader, UpdateNameRequest request) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalizedName = normalizeName(request.getName());
        if (normalizedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name cannot be empty");
        }

        user.setName(normalizedName);
        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getName(), saved.getEmail());
    }

    public void updatePassword(String authHeader, UpdatePasswordRequest request) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String currentPassword = request.getCurrentPassword() == null ? "" : request.getCurrentPassword();
        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword().trim();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String normalizeName(String rawName) {
        if (rawName == null) {
            return "";
        }
        String trimmed = rawName.trim().replaceAll("\\s+", " ");
        if (trimmed.isEmpty()) {
            return "";
        }
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }
}
