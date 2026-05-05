package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
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
        COIN_MAP.put("ADA", "cardano");
        COIN_MAP.put("XRP", "ripple");
        COIN_MAP.put("BNB", "binancecoin");
        COIN_MAP.put("AVAX", "avalanche-2");
        COIN_MAP.put("MATIC", "polygon-pos");
        COIN_MAP.put("LINK", "chainlink");
        COIN_MAP.put("DOT", "polkadot");
        COIN_MAP.put("LTC", "litecoin");
        COIN_MAP.put("SHIB", "shiba-inu");
    }

    public Map<String, Double> getPrices(List<String> assets) {
        Map<String, Double> result = new HashMap<>();

        try {
            if (assets == null || assets.isEmpty()) {
                return result;
            }

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

        } catch (Exception exception) {
            // Fallback below will try per-asset latest price.
        }

        if (assets != null) {
            for (String asset : assets) {
                if (!result.containsKey(asset)) {
                    Double fallback = getLatestPrice(asset);
                    if (fallback != null) {
                        result.put(asset, fallback);
                    }
                }
            }
        }

        return result;
    }

    public List<CoinChartPoint> getWeeklyPrices(String symbol) {
        try {
            String coinId = COIN_MAP.getOrDefault(symbol, symbol.toLowerCase());
            String url = "https://api.coingecko.com/api/v3/coins/" + coinId
                    + "/market_chart?vs_currency=usd&days=8";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("prices")) {
                return List.of();
            }

            List<List<Object>> prices = (List<List<Object>>) response.get("prices");
            Map<LocalDate, Double> dailyMap = prices.stream()
                    .filter(rawPoint -> rawPoint.size() >= 2)
                    .collect(Collectors.toMap(
                            rawPoint -> Instant.ofEpochMilli(((Number) rawPoint.get(0)).longValue())
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate(),
                            rawPoint -> ((Number) rawPoint.get(1)).doubleValue(),
                            (first, second) -> second,
                            LinkedHashMap::new
                    ));

            return dailyMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                    .skip(Math.max(0, dailyMap.size() - 7))
                    .map(entry -> new CoinChartPoint(
                            entry.getKey().format(DateTimeFormatter.ofPattern("MM-dd")),
                            entry.getValue()
                    ))
                    .toList();
        } catch (Exception exception) {
            return List.of();
        }
    }

    public List<CoinChartPoint> getHourlyPrices(String symbol) {
        try {
            String coinId = COIN_MAP.getOrDefault(symbol, symbol.toLowerCase());
            String url = "https://api.coingecko.com/api/v3/coins/" + coinId
                    + "/market_chart?vs_currency=usd&days=1";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("prices")) {
                return List.of();
            }

            List<List<Object>> prices = (List<List<Object>>) response.get("prices");
            Map<LocalDateTime, Double> hourlyMap = prices.stream()
                    .filter(rawPoint -> rawPoint.size() >= 2)
                    .collect(Collectors.toMap(
                            rawPoint -> Instant.ofEpochMilli(((Number) rawPoint.get(0)).longValue())
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDateTime()
                                    .withMinute(0)
                                    .withSecond(0)
                                    .withNano(0),
                            rawPoint -> ((Number) rawPoint.get(1)).doubleValue(),
                            (first, second) -> second,
                            LinkedHashMap::new
                    ));

            return hourlyMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                    .skip(Math.max(0, hourlyMap.size() - 12))
                    .map(entry -> new CoinChartPoint(
                            entry.getKey().format(DateTimeFormatter.ofPattern("HH:mm")),
                            entry.getValue()
                    ))
                    .toList();
        } catch (Exception exception) {
            return List.of();
        }
    }

    public List<CoinChartPoint> getLast7WeeklyPrices(String symbol) {
        try {
            String coinId = COIN_MAP.getOrDefault(symbol, symbol.toLowerCase());
            String url = "https://api.coingecko.com/api/v3/coins/" + coinId
                    + "/market_chart?vs_currency=usd&days=70";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("prices")) {
                return List.of();
            }

            List<List<Object>> prices = (List<List<Object>>) response.get("prices");
            Map<LocalDate, Double> dailyMap = prices.stream()
                    .filter(rawPoint -> rawPoint.size() >= 2)
                    .collect(Collectors.toMap(
                            rawPoint -> Instant.ofEpochMilli(((Number) rawPoint.get(0)).longValue())
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate(),
                            rawPoint -> ((Number) rawPoint.get(1)).doubleValue(),
                            (first, second) -> second,
                            LinkedHashMap::new
                    ));

            if (dailyMap.isEmpty()) {
                return List.of();
            }

            LocalDate currentSunday = LocalDate.now(ZoneId.systemDefault())
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));

            List<CoinChartPoint> weeklyPoints = new java.util.ArrayList<>();
            for (int i = 6; i >= 0; i--) {
                LocalDate targetSunday = currentSunday.minusWeeks(i);
                Double weeklyPrice = dailyMap.get(targetSunday);

                if (weeklyPrice == null) {
                    for (int offset = 1; offset <= 6; offset++) {
                        LocalDate candidate = targetSunday.plusDays(offset);
                        if (dailyMap.containsKey(candidate)) {
                            weeklyPrice = dailyMap.get(candidate);
                            break;
                        }
                    }
                }

                if (weeklyPrice == null) {
                    for (int offset = 1; offset <= 6; offset++) {
                        LocalDate candidate = targetSunday.minusDays(offset);
                        if (dailyMap.containsKey(candidate)) {
                            weeklyPrice = dailyMap.get(candidate);
                            break;
                        }
                    }
                }

                if (weeklyPrice != null) {
                    weeklyPoints.add(new CoinChartPoint(
                            targetSunday.format(DateTimeFormatter.ofPattern("MM-dd")),
                            weeklyPrice
                    ));
                }
            }

            return weeklyPoints;
        } catch (Exception exception) {
            return List.of();
        }
    }

    private Double getLatestPrice(String symbol) {
        try {
            String coinId = COIN_MAP.getOrDefault(symbol, symbol.toLowerCase());
            String url = "https://api.coingecko.com/api/v3/coins/" + coinId
                    + "/market_chart?vs_currency=usd&days=1";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("prices")) {
                return null;
            }

            List<List<Object>> prices = (List<List<Object>>) response.get("prices");
            if (prices.isEmpty()) {
                return null;
            }

            List<Object> latest = prices.get(prices.size() - 1);
            if (latest.size() < 2 || !(latest.get(1) instanceof Number)) {
                return null;
            }

            return ((Number) latest.get(1)).doubleValue();
        } catch (Exception exception) {
            return null;
        }
    }
}