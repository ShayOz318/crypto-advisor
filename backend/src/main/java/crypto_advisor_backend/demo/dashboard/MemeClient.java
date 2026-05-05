package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Component
public class MemeClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Random random = new Random();
    private static final List<String> CRYPTO_SUBREDDITS = List.of(
            "CryptoCurrencyMemes",
            "cryptomemes",
            "BitcoinMemes"
    );

    private final List<MemeItem> fallbackMemes = List.of(
            new MemeItem(
                    "When you buy the dip and it dips again.",
                    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80",
                    "https://www.reddit.com/r/cryptomemes/"
            ),
            new MemeItem(
                    "Checking BTC every 3 minutes like it changes my life.",
                    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",
                    "https://www.reddit.com/r/CryptoCurrencyMemes/"
            ),
            new MemeItem(
                    "HODL mode: stress now, stories later.",
                    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
                    "https://www.reddit.com/r/BitcoinMemes/"
            )
    );

    public MemeItem getRandomMeme() {
        for (String subreddit : CRYPTO_SUBREDDITS) {
            MemeItem item = fetchFromApi(subreddit);
            if (item != null) {
                return item;
            }
        }
        return fallbackMemes.get(random.nextInt(fallbackMemes.size()));
    }

    private MemeItem fetchFromApi(String subreddit) {
        try {
            String url = "https://meme-api.com/gimme/" + subreddit;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return null;
            }

            String imageUrl = asString(response.get("url"));
            String title = asString(response.get("title"));
            String postUrl = asString(response.get("postLink"));
            Boolean nsfw = asBoolean(response.get("nsfw"));
            Boolean spoiler = asBoolean(response.get("spoiler"));

            if (Boolean.TRUE.equals(nsfw) || Boolean.TRUE.equals(spoiler)) {
                return null;
            }
            if (imageUrl == null || imageUrl.isBlank()) {
                return null;
            }
            if (!isImageUrl(imageUrl)) {
                return null;
            }

            String caption = (title == null || title.isBlank()) ? "Crypto meme of the moment" : title.trim();
            String safePostUrl =
                    (postUrl == null || postUrl.isBlank()) ? "https://www.reddit.com/r/" + subreddit : postUrl;

            return new MemeItem(caption, imageUrl, safePostUrl);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String asString(Object value) {
        return value instanceof String ? (String) value : null;
    }

    private Boolean asBoolean(Object value) {
        return value instanceof Boolean ? (Boolean) value : null;
    }

    private boolean isImageUrl(String url) {
        String normalized = url.toLowerCase();
        return normalized.endsWith(".jpg")
                || normalized.endsWith(".jpeg")
                || normalized.endsWith(".png")
                || normalized.endsWith(".webp")
                || normalized.contains("format=")
                || normalized.contains("auto=format");
    }
}