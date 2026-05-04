package crypto_advisor_backend.demo.auth;

import crypto_advisor_backend.demo.security.JwtService;
import crypto_advisor_backend.demo.user.User;
import crypto_advisor_backend.demo.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already exists"
            );
        }

        User user = new User(
                request.getName(),
                email,
                passwordEncoder.encode(request.getPassword())
        );

        return userRepository.save(user);
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

        return new AuthResponse(token, userResponse);
    }

}