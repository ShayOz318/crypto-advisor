package crypto_advisor_backend.demo.feedback;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "feedback")
public class Feedback {

    @Id
    private String id;

    private String userId;
    private String sectionType;
    private String vote;
    private String itemId;
    private String itemLabel;
    private LocalDateTime createdAt;

    public Feedback() {
    }

    public Feedback(String userId,
                    String sectionType,
                    String vote,
                    String itemId,
                    String itemLabel) {
        this.userId = userId;
        this.sectionType = sectionType;
        this.vote = vote;
        this.itemId = itemId;
        this.itemLabel = itemLabel;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getSectionType() {
        return sectionType;
    }

    public String getVote() {
        return vote;
    }

    public String getItemId() {
        return itemId;
    }

    public String getItemLabel() {
        return itemLabel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}