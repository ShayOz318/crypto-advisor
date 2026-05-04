package crypto_advisor_backend.demo.onboarding;

import crypto_advisor_backend.demo.security.JwtService;
import org.springframework.stereotype.Service;

@Service
public class OnboardingService {

    private final UserPreferencesRepository repository;
    private final JwtService jwtService;

    public OnboardingService(UserPreferencesRepository repository,
                             JwtService jwtService) {
        this.repository = repository;
        this.jwtService = jwtService;
    }

    public UserPreferences savePreferences(String authHeader,
                                           PreferencesRequest request) {

        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        UserPreferences preferences = new UserPreferences(
                userId,
                request.getAssets(),
                request.getInvestorType(),
                request.getContentTypes()
        );

        return repository.save(preferences);
    }
}