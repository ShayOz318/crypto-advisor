package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class NewsClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> getNews() {
        try {
            String url = "https://cryptopanic.com/api/v1/posts/?auth_token=demo&public=true";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> results =
                        (List<Map<String, Object>>) response.get("results");

                return results.stream()
                        .limit(5)
                        .map(item -> (String) item.get("title"))
                        .collect(Collectors.toList());
            }

        } catch (Exception ignored) {}

        return getFallbackNews();
    }

    private List<String> getFallbackNews() {
        return List.of(
                "Bitcoin market shows volatility",
                "Ethereum adoption continues to rise",
                "Crypto regulations evolve globally"
        );
    }
}