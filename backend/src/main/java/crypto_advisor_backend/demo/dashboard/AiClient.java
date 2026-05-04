package crypto_advisor_backend.demo.dashboard;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openrouter.api.key:dummy}")
    private String apiKey;

    public String generateInsight(List<String> assets, String investorType) {

        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();

            body.put("model", "openai/gpt-3.5-turbo");

            String prompt = "User invests in: " + assets +
                    ". Investor type: " + investorType +
                    ". Give a short crypto insight in 2 sentences.";

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            body.put("messages", List.of(message));

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            Map<String, Object> response =
                    restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) response.get("choices");

                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> messageResponse =
                            (Map<String, Object>) firstChoice.get("message");

                    return (String) messageResponse.get("content");
                }
            }

        } catch (Exception ignored) {}

        return fallbackInsight(assets, investorType);
    }

    private String fallbackInsight(List<String> assets, String investorType) {
        return "As a " + investorType +
                ", consider monitoring " + assets +
                " and focus on long-term trends rather than short-term volatility.";
    }
}