package crypto_advisor_backend.demo.dashboard;

import crypto_advisor_backend.demo.onboarding.UserPreferences;
import crypto_advisor_backend.demo.onboarding.UserPreferencesRepository;
import crypto_advisor_backend.demo.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
                .findAll()
                .stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        List<String> assets;
        String investorType;

        if (preferences != null) {
            assets = preferences.getAssets();
            investorType = preferences.getInvestorType();
        } else {
            assets = List.of("BTC");
            investorType = "Long-term";
        }

        Map<String, Double> prices = coinGeckoClient.getPrices(assets);

        List<String> coinPrices = prices.entrySet()
                .stream()
                .map(entry -> entry.getKey() + ": $" + entry.getValue())
                .toList();

        List<String> news = newsClient.getNews();

        String aiInsight = aiClient.generateInsight(assets, investorType);

        String meme = memeClient.getRandomMeme();

        return new DashboardResponse(
                coinPrices,
                news,
                aiInsight,
                meme
        );
    }
}