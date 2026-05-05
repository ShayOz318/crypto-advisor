package crypto_advisor_backend.demo.dashboard;

public class MemeItem {

    private final String caption;
    private final String imageUrl;
    private final String postUrl;

    public MemeItem(String caption, String imageUrl, String postUrl) {
        this.caption = caption;
        this.imageUrl = imageUrl;
        this.postUrl = postUrl;
    }

    public String getCaption() {
        return caption;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getPostUrl() {
        return postUrl;
    }
}
