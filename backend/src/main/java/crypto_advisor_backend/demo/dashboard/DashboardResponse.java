package crypto_advisor_backend.demo.dashboard;

import java.util.List;

public class DashboardResponse {

    private List<String> contentTypes;
    private List<String> assets;
    private List<String> coinPrices;
    private List<NewsItem> marketNews;
    private String aiInsight;
    private String meme;
    private String chartUpdateCadence;

    public DashboardResponse(List<String> contentTypes,
                             List<String> assets,
                             List<String> coinPrices,
                             List<NewsItem> marketNews,
                             String aiInsight,
                             String meme,
                             String chartUpdateCadence) {
        this.contentTypes = contentTypes;
        this.assets = assets;
        this.coinPrices = coinPrices;
        this.marketNews = marketNews;
        this.aiInsight = aiInsight;
        this.meme = meme;
        this.chartUpdateCadence = chartUpdateCadence;
    }

    public List<String> getContentTypes() {
        return contentTypes;
    }

    public List<String> getAssets() {
        return assets;
    }

    public List<String> getCoinPrices() {
        return coinPrices;
    }

    public List<NewsItem> getMarketNews() {
        return marketNews;
    }

    public String getAiInsight() {
        return aiInsight;
    }

    public String getMeme() {
        return meme;
    }

    public String getChartUpdateCadence() {
        return chartUpdateCadence;
    }
}