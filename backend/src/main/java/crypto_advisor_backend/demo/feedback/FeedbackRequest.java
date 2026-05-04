package crypto_advisor_backend.demo.feedback;

public class FeedbackRequest {

    private String sectionType;
    private String vote;

    public String getSectionType() {
        return sectionType;
    }

    public void setSectionType(String sectionType) {
        this.sectionType = sectionType;
    }

    public String getVote() {
        return vote;
    }

    public void setVote(String vote) {
        this.vote = vote;
    }
}