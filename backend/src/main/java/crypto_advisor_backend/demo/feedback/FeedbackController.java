package crypto_advisor_backend.demo.feedback;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public Feedback saveFeedback(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody FeedbackRequest request) {

        return feedbackService.saveFeedback(authHeader, request);
    }
}