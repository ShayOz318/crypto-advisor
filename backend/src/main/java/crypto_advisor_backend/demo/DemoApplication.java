package crypto_advisor_backend.demo;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class DemoApplication {

	private static final Logger log = LoggerFactory.getLogger(DemoApplication.class);

	private final Environment env;

	@Value("${spring.data.mongodb.uri:NOT_BOUND}")
	private String resolvedMongoUri;

	public DemoApplication(Environment env) {
		this.env = env;
	}

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@PostConstruct
	public void diagnose() {
		String mongoEnv = System.getenv("MONGODB_URI");
		String springEnv = System.getenv("SPRING_DATA_MONGODB_URI");
		log.info("DIAG MONGODB_URI present={} length={}",
				mongoEnv != null,
				mongoEnv == null ? -1 : mongoEnv.length());
		log.info("DIAG SPRING_DATA_MONGODB_URI present={} length={}",
				springEnv != null,
				springEnv == null ? -1 : springEnv.length());
		log.info("DIAG resolved spring.data.mongodb.uri startsWith={} length={}",
				resolvedMongoUri == null ? "null" : resolvedMongoUri.substring(0, Math.min(20, resolvedMongoUri.length())),
				resolvedMongoUri == null ? -1 : resolvedMongoUri.length());
		log.info("DIAG env.getProperty(spring.data.mongodb.uri) startsWith={}",
				env.getProperty("spring.data.mongodb.uri", "null").substring(0, Math.min(20, env.getProperty("spring.data.mongodb.uri", "null").length())));
	}
}
