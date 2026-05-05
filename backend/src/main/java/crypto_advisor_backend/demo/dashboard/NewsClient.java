package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class NewsClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DEFAULT_IMAGE =
            "https://images.unsplash.com/photo-1642052502367-6e8c7f4f3c56?auto=format&fit=crop&w=1200&q=80";
    private static final String BITCOIN_IMAGE =
            "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80";
    private static final String ETHEREUM_IMAGE =
            "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=1200&q=80";
    private static final String REGULATION_IMAGE =
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80";
    private static final String MARKET_IMAGE =
            "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80";
    private static final String SECURITY_IMAGE =
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80";

    public List<NewsItem> getNews() {
        try {
            String url = "https://cryptopanic.com/api/v1/posts/?auth_token=demo&public=true";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("results")) {
                List<Map<String, Object>> results =
                        (List<Map<String, Object>>) response.get("results");

                List<NewsItem> distinctNews = results.stream()
                        .limit(20)
                        .map(this::toNewsItem)
                        .collect(Collectors.toList());

                return ensureDistinctNews(distinctNews);
            }

        } catch (Exception ignored) {}

        return getFallbackNews();
    }

    private NewsItem toNewsItem(Map<String, Object> raw) {
        String title = (String) raw.getOrDefault("title", "Crypto market update");
        String postUrl = (String) raw.getOrDefault("url", "https://cryptopanic.com/");
        String image = selectRelevantImage(title);
        String[] paragraphs = buildDetailedParagraphs(title);

        return new NewsItem(title, postUrl, image, paragraphs[0], paragraphs[1]);
    }

    private List<NewsItem> getFallbackNews() {
        return List.of(
                new NewsItem(
                        "Bitcoin market shows volatility",
                        "https://cryptopanic.com/",
                        BITCOIN_IMAGE,
                        "Bitcoin is seeing stronger short-term volatility as traders react to macro signals, ETF flows, and liquidity shifts across major exchanges. Price swings remain sharp intraday, which often creates both opportunity and risk for investors with different time horizons.",
                        "In this environment, the key signal is whether momentum is supported by real volume and sustained institutional interest. Watching support zones and funding sentiment can help identify whether the move is a temporary reaction or the beginning of a broader trend."
                ),
                new NewsItem(
                        "Ethereum adoption continues to rise",
                        "https://cryptopanic.com/",
                        ETHEREUM_IMAGE,
                        "Ethereum adoption is expanding through DeFi usage, tokenized assets, and growing developer activity around L2 ecosystems. More real-world integrations are strengthening the network's role as a programmable financial layer rather than only a speculative asset.",
                        "What matters most now is whether this usage growth remains durable under changing market conditions and fees. If activity quality stays high, adoption trends can translate into stronger long-term confidence in Ethereum-based products and infrastructure."
                ),
                new NewsItem(
                        "Crypto regulations evolve globally",
                        "https://cryptopanic.com/",
                        REGULATION_IMAGE,
                        "Regulatory developments across major markets are becoming a central factor in crypto pricing and investor sentiment. New frameworks around custody, stablecoins, and exchange licensing can quickly reshape where capital flows and which platforms gain trust.",
                        "For investors, the important signal is not just headline risk but policy direction over time. Clearer rules often reduce uncertainty and attract more institutional participation, while fragmented rules can increase compliance costs and short-term volatility."
                )
        );
    }

    private String selectRelevantImage(String title) {
        String normalized = title == null ? "" : title.toLowerCase();

        if (normalized.contains("bitcoin") || normalized.contains("btc")) {
            return BITCOIN_IMAGE;
        }
        if (normalized.contains("ethereum") || normalized.contains("eth")) {
            return ETHEREUM_IMAGE;
        }
        if (normalized.contains("regulation")
                || normalized.contains("policy")
                || normalized.contains("sec")
                || normalized.contains("law")) {
            return REGULATION_IMAGE;
        }
        if (normalized.contains("hack")
                || normalized.contains("exploit")
                || normalized.contains("security")
                || normalized.contains("breach")) {
            return SECURITY_IMAGE;
        }
        if (normalized.contains("market")
                || normalized.contains("price")
                || normalized.contains("rally")
                || normalized.contains("drop")) {
            return MARKET_IMAGE;
        }

        return DEFAULT_IMAGE;
    }

    private String[] buildDetailedParagraphs(String title) {
        String headline = title == null || title.isBlank() ? "This latest crypto update" : title;

        String paragraphOne = headline
                + " is drawing attention because it can influence short-term sentiment, trading behavior, and portfolio positioning across major digital assets. Investors are watching whether this development is noise around current volatility or a signal of a more structural move in the market.";

        String paragraphTwo = "A useful way to read this story is to connect it with broader context: liquidity conditions, regulatory direction, and adoption metrics in the same period. If those factors align with the headline, the impact can persist longer and shape strategy beyond a single news cycle.";

        return new String[]{paragraphOne, paragraphTwo};
    }

    private List<NewsItem> ensureDistinctNews(List<NewsItem> rawNews) {
        List<NewsItem> unique = new ArrayList<>();
        Set<String> seenTitles = new HashSet<>();

        for (NewsItem item : rawNews) {
            String titleKey = item.getTitle() == null ? "" : item.getTitle().trim().toLowerCase();
            if (titleKey.isBlank()) {
                continue;
            }
            if (!seenTitles.contains(titleKey)) {
                seenTitles.add(titleKey);
                unique.add(item);
            }
            if (unique.size() >= 5) {
                break;
            }
        }

        if (unique.size() >= 3) {
            return unique;
        }

        return getFallbackNews();

    }
}