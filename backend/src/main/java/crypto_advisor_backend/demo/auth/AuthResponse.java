package crypto_advisor_backend.demo.auth;

public class AuthResponse {

    private String token;
    private UserResponse user;

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public UserResponse getUser() {
        return user;
    }
}