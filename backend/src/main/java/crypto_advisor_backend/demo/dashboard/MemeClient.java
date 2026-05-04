package crypto_advisor_backend.demo.dashboard;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
public class MemeClient {

    private final List<String> memes = List.of(
            "When you buy the dip… and it dips again.",
            "Crypto traders checking charts every 5 minutes.",
            "HODL through the pain!",
            "Sold too early? Classic.",
            "When BTC goes up 2% and you feel like a genius."
    );

    private final Random random = new Random();

    public String getRandomMeme() {
        return memes.get(random.nextInt(memes.size()));
    }
}