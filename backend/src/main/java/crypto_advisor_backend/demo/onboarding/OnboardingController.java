package crypto_advisor_backend.demo.onboarding;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService service;

    public OnboardingController(OnboardingService service) {
        this.service = service;
    }

    @PostMapping
    public UserPreferences savePreferences(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PreferencesRequest request) {

        return service.savePreferences(authHeader, request);
    }

    @GetMapping
    public UserPreferences getPreferences(
            @RequestHeader("Authorization") String authHeader) {
        return service.getPreferences(authHeader);
    }
}