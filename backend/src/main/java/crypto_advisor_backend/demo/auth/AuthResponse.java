package crypto_advisor_backend.demo.auth;

public class AuthResponse {

    private String token;
    private UserResponse user;
    private boolean needsOnboarding;

    public AuthResponse(String token, UserResponse user, boolean needsOnboarding) {
        this.token = token;
        this.user = user;
        this.needsOnboarding = needsOnboarding;
    }

    public String getToken() {
        return token;
    }

    public UserResponse getUser() {
        return user;
    }

    public boolean isNeedsOnboarding() {
        return needsOnboarding;
    }
}