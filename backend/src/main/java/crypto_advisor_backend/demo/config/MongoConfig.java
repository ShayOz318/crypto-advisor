package crypto_advisor_backend.demo.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    @Bean
    public MongoClient mongoClient(@Value("${spring.data.mongodb.uri}") String uri) {
        if (uri == null || uri.isBlank() || uri.equals("MONGODB_URI_NOT_SET")) {
            throw new IllegalStateException(
                    "MONGODB_URI is not configured. Set the MONGODB_URI environment variable.");
        }

        ConnectionString connectionString = new ConnectionString(uri);
        log.info("Mongo connecting to hosts={} database={}",
                connectionString.getHosts(),
                connectionString.getDatabase());

        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();

        return MongoClients.create(settings);
    }
}
