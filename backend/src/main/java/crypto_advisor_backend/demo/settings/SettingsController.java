package crypto_advisor_backend.demo.settings;

import crypto_advisor_backend.demo.auth.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @PutMapping("/name")
    public UserResponse updateName(@RequestHeader("Authorization") String authHeader,
                                   @RequestBody UpdateNameRequest request) {
        return settingsService.updateName(authHeader, request);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(@RequestHeader("Authorization") String authHeader,
                                               @RequestBody UpdatePasswordRequest request) {
        settingsService.updatePassword(authHeader, request);
        return ResponseEntity.noContent().build();
    }
}
