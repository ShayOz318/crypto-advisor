package crypto_advisor_backend.demo.onboarding;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "preferences")
public class UserPreferences {

    @Id
    private String id;

    private String userId;
    private List<String> assets;
    private String investorType;
    private List<String> contentTypes;

    public UserPreferences() {
    }

    public UserPreferences(String userId,
                           List<String> assets,
                           String investorType,
                           List<String> contentTypes) {
        this.userId = userId;
        this.assets = assets;
        this.investorType = investorType;
        this.contentTypes = contentTypes;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public List<String> getAssets() {
        return assets;
    }

    public String getInvestorType() {
        return investorType;
    }

    public List<String> getContentTypes() {
        return contentTypes;
    }

    public void setAssets(List<String> assets) {
        this.assets = assets;
    }

    public void setInvestorType(String investorType) {
        this.investorType = investorType;
    }

    public void setContentTypes(List<String> contentTypes) {
        this.contentTypes = contentTypes;
    }
}