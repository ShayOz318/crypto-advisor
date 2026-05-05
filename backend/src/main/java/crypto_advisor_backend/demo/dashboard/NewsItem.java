package crypto_advisor_backend.demo.dashboard;

public class NewsItem {

    private String title;
    private String url;
    private String imageUrl;
    private String paragraphOne;
    private String paragraphTwo;

    public NewsItem(String title,
                    String url,
                    String imageUrl,
                    String paragraphOne,
                    String paragraphTwo) {
        this.title = title;
        this.url = url;
        this.imageUrl = imageUrl;
        this.paragraphOne = paragraphOne;
        this.paragraphTwo = paragraphTwo;
    }

    public String getTitle() {
        return title;
    }

    public String getUrl() {
        return url;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getParagraphOne() {
        return paragraphOne;
    }

    public String getParagraphTwo() {
        return paragraphTwo;
    }
}
