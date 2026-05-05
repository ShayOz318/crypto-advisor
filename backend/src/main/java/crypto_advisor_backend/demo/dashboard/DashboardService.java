package crypto_advisor_backend.demo.dashboard;

import crypto_advisor_backend.demo.onboarding.UserPreferences;
import crypto_advisor_backend.demo.onboarding.UserPreferencesRepository;
import crypto_advisor_backend.demo.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class DashboardService {

    private final JwtService jwtService;
    private final UserPreferencesRepository preferencesRepository;
    private final CoinGeckoClient coinGeckoClient;
    private final NewsClient newsClient;
    private final AiClient aiClient;
    private final MemeClient memeClient;

    public DashboardService(JwtService jwtService,
                            UserPreferencesRepository preferencesRepository,
                            CoinGeckoClient coinGeckoClient,
                            NewsClient newsClient,
                            AiClient aiClient,
                            MemeClient memeClient) {
        this.jwtService = jwtService;
        this.preferencesRepository = preferencesRepository;
        this.coinGeckoClient = coinGeckoClient;
        this.newsClient = newsClient;
        this.aiClient = aiClient;
        this.memeClient = memeClient;
    }

    public DashboardResponse getDashboard(String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        UserPreferences preferences = preferencesRepository
                .findByUserId(userId)
                .orElse(null);

        List<String> assets;
        String investorType;
        List<String> contentTypes;

        if (preferences != null) {
            assets = preferences.getAssets() == null ? List.of() : preferences.getAssets();
            investorType = preferences.getInvestorType();
            contentTypes = preferences.getContentTypes();
        } else {
            assets = List.of("BTC");
            investorType = "HODLer";
            contentTypes = List.of("Market News", "Charts", "AI Insight", "Fun");
        }

        String normalizedInvestorType = normalizeInvestorType(investorType);
        List<String> normalizedAssets = normalizeAssetsByInvestorType(assets, normalizedInvestorType);

        Set<String> enabled = new HashSet<>(contentTypes == null ? List.of() : contentTypes);

        List<String> coinPrices = new ArrayList<>();
        if (enabled.contains("Charts") || enabled.contains("Coin Prices")) {
            Map<String, Double> prices = coinGeckoClient.getPrices(normalizedAssets);
            coinPrices = prices.entrySet()
                    .stream()
                    .map(entry -> entry.getKey() + ": $" + entry.getValue())
                    .toList();
            coinPrices = tailorCoinPricesByInvestorType(coinPrices, normalizedInvestorType);
        }

        List<NewsItem> news = List.of();
        if (enabled.contains("Market News")) {
            news = newsClient.getNews();
            news = tailorNewsByInvestorType(news, normalizedInvestorType);
        }

        String aiInsight = null;
        if (enabled.contains("AI Insight")) {
            aiInsight = aiClient.generateInsight(normalizedAssets, normalizedInvestorType);
            aiInsight = tailorInsightByInvestorType(aiInsight, normalizedInvestorType);
        }

        String meme = null;
        String memeImageUrl = null;
        String memePostUrl = null;
        if (enabled.contains("Fun") || enabled.contains("Fun Crypto Meme")) {
            MemeItem memeItem = memeClient.getRandomMeme();
            meme = memeItem.getCaption();
            memeImageUrl = memeItem.getImageUrl();
            memePostUrl = memeItem.getPostUrl();
        }

        String chartUpdateCadence;
        if ("Day Trader".equals(normalizedInvestorType)) {
            chartUpdateCadence = "hourly";
        } else if ("HODLer".equals(normalizedInvestorType)) {
            chartUpdateCadence = "weekly";
        } else {
            chartUpdateCadence = "daily";
        }

        return new DashboardResponse(
                contentTypes,
                normalizedAssets,
                coinPrices,
                news,
                aiInsight,
                meme,
                memeImageUrl,
                memePostUrl,
                chartUpdateCadence,
                normalizedInvestorType
        );
    }

    public List<CoinChartPoint> getCoinWeeklyChart(String authHeader, String symbol) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        String investorType = preferencesRepository.findByUserId(userId)
                .map(UserPreferences::getInvestorType)
                .orElse("HODLer");

        String normalizedType = normalizeInvestorType(investorType);
        if ("Day Trader".equals(normalizedType)) {
            return coinGeckoClient.getHourlyPrices(symbol);
        }
        if ("HODLer".equals(normalizedType)) {
            return coinGeckoClient.getLast7WeeklyPrices(symbol);
        }
        return coinGeckoClient.getWeeklyPrices(symbol);
    }

    private String normalizeInvestorType(String investorType) {
        if (investorType == null) {
            return "HODLer";
        }

        String normalized = investorType.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("day")) {
            return "Day Trader";
        }
        if (normalized.contains("nft")) {
            return "NFT Collector";
        }
        return "HODLer";
    }

    private List<String> normalizeAssetsByInvestorType(List<String> assets, String investorType) {
        return assets == null ? List.of() : assets;
    }

    private List<String> tailorCoinPricesByInvestorType(List<String> coinPrices, String investorType) {
        if ("HODLer".equals(investorType)) {
            List<String> longTermView = new ArrayList<>(coinPrices);
            longTermView.add("HODLer focus: prioritize long-term trend direction over daily swings.");
            return longTermView;
        }

        if ("Day Trader".equals(investorType)) {
            List<String> fastView = new ArrayList<>(coinPrices);
            fastView.add("Day Trader focus: monitor volatility, momentum shifts, and rapid reversals.");
            return fastView;
        }

        List<String> nftView = new ArrayList<>(coinPrices);
        nftView.add("NFT Collector focus: ETH ecosystem activity is prioritized over broad coin coverage.");
        return nftView;
    }

    private List<NewsItem> tailorNewsByInvestorType(List<NewsItem> news, String investorType) {
        List<NewsItem> prioritized = new ArrayList<>(news);
        prioritized.sort((first, second) -> Integer.compare(
                scoreNewsForInvestorType(second.getTitle(), investorType),
                scoreNewsForInvestorType(first.getTitle(), investorType)
        ));

        List<NewsItem> tailored = new ArrayList<>();
        for (NewsItem item : prioritized) {
            if ("Day Trader".equals(investorType)) {
                String paragraphOne = addPrefix(
                        item.getParagraphOne(),
                        "Fast market read:"
                );
                String paragraphTwo = addSuffix(
                        item.getParagraphTwo(),
                        "For day-trading setups, prioritize volatility structure and momentum follow-through."
                );
                tailored.add(new NewsItem(
                        item.getTitle(),
                        item.getUrl(),
                        item.getImageUrl(),
                        paragraphOne,
                        paragraphTwo
                ));
            } else if ("NFT Collector".equals(investorType)) {
                String paragraphOne = addPrefix(
                        item.getParagraphOne(),
                        "NFT-focused read:"
                );
                String paragraphTwo = addSuffix(
                        item.getParagraphTwo(),
                        "Use this update to assess whether demand looks sustainable across marketplaces and whether Ethereum/L2 conditions support continued collector activity."
                );
                tailored.add(new NewsItem(
                        item.getTitle(),
                        item.getUrl(),
                        item.getImageUrl(),
                        paragraphOne,
                        paragraphTwo
                ));
            } else {
                String paragraphOne = addPrefix(
                        item.getParagraphOne(),
                        "Long-term context:"
                );
                String paragraphTwo = addSuffix(
                        item.getParagraphTwo(),
                        "For HODL strategy, emphasize fundamentals, network growth, and thesis durability over short-term noise."
                );
                tailored.add(new NewsItem(
                        item.getTitle(),
                        item.getUrl(),
                        item.getImageUrl(),
                        paragraphOne,
                        paragraphTwo
                ));
            }
        }
        return tailored;
    }

    private int scoreNewsForInvestorType(String title, String investorType) {
        if (title == null) {
            return 0;
        }

        String normalized = title.toLowerCase(Locale.ROOT);
        int score = 0;

        if ("Day Trader".equals(investorType)) {
            if (containsAny(normalized, "price", "rally", "drop", "volatility", "liquidation", "volume")) score += 4;
            if (containsAny(normalized, "breaking", "surge", "plunge", "intraday", "short-term")) score += 3;
            if (containsAny(normalized, "macro", "fomc", "fed", "cpi")) score += 1;
            return score;
        }

        if ("NFT Collector".equals(investorType)) {
            if (containsAny(normalized, "nft", "collection", "opensea", "mint", "digital art")) score += 5;
            if (containsAny(normalized, "ethereum", "eth", "layer 2", "l2")) score += 3;
            if (containsAny(normalized, "creator", "marketplace", "royalty")) score += 2;
            return score;
        }

        // HODLer default scoring: adoption + long-term structure over noise.
        if (containsAny(normalized, "adoption", "institution", "etf", "regulation", "policy", "ecosystem")) score += 4;
        if (containsAny(normalized, "network", "upgrade", "roadmap", "developer")) score += 3;
        if (containsAny(normalized, "volatility", "intraday", "liquidation")) score -= 1;
        return score;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String addPrefix(String original, String prefix) {
        String base = original == null ? "" : original.trim();
        if (base.isBlank()) {
            return prefix;
        }
        return prefix + " " + base;
    }

    private String addSuffix(String original, String suffix) {
        String base = original == null ? "" : original.trim();
        if (base.isBlank()) {
            return suffix;
        }
        return base + " " + suffix;
    }

    private boolean isNftRelated(String title) {
        if (title == null) {
            return false;
        }
        String normalized = title.toLowerCase(Locale.ROOT);
        return normalized.contains("nft")
                || normalized.contains("ethereum")
                || normalized.contains("eth")
                || normalized.contains("opensea")
                || normalized.contains("collection")
                || normalized.contains("token");
    }

    private String tailorInsightByInvestorType(String aiInsight, String investorType) {
        if (aiInsight == null || aiInsight.isBlank()) {
            return aiInsight;
        }
        if ("Day Trader".equals(investorType)) {
            return aiInsight + " Keep risk tight and react to momentum and volatility changes quickly.";
        }
        if ("NFT Collector".equals(investorType)) {
            return aiInsight + " Add NFT-specific signals like creator traction, collection liquidity, and marketplace demand.";
        }
        return aiInsight + " Keep focus on long-term conviction and avoid overreacting to daily noise.";
    }
}