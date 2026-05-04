package crypto_advisor_backend.demo.dashboard;

import java.util.List;

public class DashboardResponse {

    private List<String> coinPrices;
    private List<String> marketNews;
    private String aiInsight;
    private String meme;

    public DashboardResponse(List<String> coinPrices,
                             List<String> marketNews,
                             String aiInsight,
                             String meme) {
        this.coinPrices = coinPrices;
        this.marketNews = marketNews;
        this.aiInsight = aiInsight;
        this.meme = meme;
    }

    public List<String> getCoinPrices() {
        return coinPrices;
    }

    public List<String> getMarketNews() {
        return marketNews;
    }

    public String getAiInsight() {
        return aiInsight;
    }

    public String getMeme() {
        return meme;
    }
}