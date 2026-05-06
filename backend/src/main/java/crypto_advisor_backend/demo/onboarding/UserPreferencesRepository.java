package crypto_advisor_backend.demo.onboarding;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserPreferencesRepository
        extends MongoRepository<UserPreferences, String> {

    Optional<UserPreferences> findByUserId(String userId);

    boolean existsByUserId(String userId);
}