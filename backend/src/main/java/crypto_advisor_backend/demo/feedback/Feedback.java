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
    private LocalDateTime createdAt;

    public Feedback(String userId, String sectionType, String vote) {
        this.userId = userId;
        this.sectionType = sectionType;
        this.vote = vote;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}