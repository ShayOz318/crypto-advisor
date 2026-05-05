package crypto_advisor_backend.demo.onboarding;

import crypto_advisor_backend.demo.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.List;

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

        UserPreferences preferences = repository.findByUserId(userId)
                .orElseGet(() -> new UserPreferences(
                        userId,
                        request.getAssets(),
                        request.getInvestorType(),
                        request.getContentTypes()
                ));

        preferences.setAssets(request.getAssets());
        preferences.setInvestorType(request.getInvestorType());
        preferences.setContentTypes(request.getContentTypes());

        return repository.save(preferences);
    }

    public UserPreferences getPreferences(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        return repository.findByUserId(userId)
                .orElse(new UserPreferences(
                        userId,
                        List.of(),
                        "",
                        List.of()
                ));
    }
}