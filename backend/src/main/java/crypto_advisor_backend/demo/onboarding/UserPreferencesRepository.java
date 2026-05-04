package crypto_advisor_backend.demo.onboarding;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserPreferencesRepository
        extends MongoRepository<UserPreferences, String> {
}