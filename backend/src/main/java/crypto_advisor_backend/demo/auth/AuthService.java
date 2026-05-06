package crypto_advisor_backend.demo.auth;

import crypto_advisor_backend.demo.onboarding.UserPreferencesRepository;
import crypto_advisor_backend.demo.security.JwtService;
import crypto_advisor_backend.demo.user.User;
import crypto_advisor_backend.demo.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserPreferencesRepository preferencesRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       UserPreferencesRepository preferencesRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.preferencesRepository = preferencesRepository;
    }

    public UserResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String normalizedName = normalizeName(request.getName());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already exists"
            );
        }

        User user = new User(
                normalizedName,
                email,
                passwordEncoder.encode(request.getPassword())
        );

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );

        String token = jwtService.generateToken(user);

        boolean hasPreferences = preferencesRepository.existsByUserId(user.getId());
        boolean needsOnboarding = !hasPreferences;

        return new AuthResponse(token, userResponse, needsOnboarding);
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