package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class CoinGeckoClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Map<String, String> COIN_MAP = new HashMap<>();

    static {
        COIN_MAP.put("BTC", "bitcoin");
        COIN_MAP.put("ETH", "ethereum");
        COIN_MAP.put("SOL", "solana");
        COIN_MAP.put("DOGE", "dogecoin");
    }

    public Map<String, Double> getPrices(List<String> assets) {
        Map<String, Double> result = new HashMap<>();

        try {
            String ids = assets.stream()
                    .map(asset -> COIN_MAP.getOrDefault(asset, asset.toLowerCase()))
                    .collect(Collectors.joining(","));

            String url = "https://api.coingecko.com/api/v3/simple/price?ids="
                    + ids + "&vs_currencies=usd";

            Map<String, Map<String, Object>> response =
                    restTemplate.getForObject(url, Map.class);

            for (String asset : assets) {
                String coinId = COIN_MAP.getOrDefault(asset, asset.toLowerCase());

                if (response != null && response.containsKey(coinId)) {
                    Object usdValue = response.get(coinId).get("usd");

                    if (usdValue instanceof Number) {
                        result.put(asset, ((Number) usdValue).doubleValue());
                    }
                }
            }

            return result;

        } catch (Exception exception) {
            result.put("BTC", 0.0);
            result.put("ETH", 0.0);
            return result;
        }
    }
}