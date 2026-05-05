package crypto_advisor_backend.demo.feedback;

import crypto_advisor_backend.demo.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final JwtService jwtService;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           JwtService jwtService) {
        this.feedbackRepository = feedbackRepository;
        this.jwtService = jwtService;
    }

    public Feedback saveFeedback(String authHeader, FeedbackRequest request) {
        validateRequest(request);

        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);

        Feedback feedback = new Feedback(
                userId,
                request.getSectionType(),
                request.getVote(),
                request.getItemId(),
                request.getItemLabel()
        );

        return feedbackRepository.save(feedback);
    }

    private void validateRequest(FeedbackRequest request) {
        if (request.getSectionType() == null || request.getSectionType().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Section type is required"
            );
        }

        if (request.getVote() == null || request.getVote().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vote is required"
            );
        }

        if (!request.getVote().equals("LIKE") && !request.getVote().equals("DISLIKE")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vote must be LIKE or DISLIKE"
            );
        }

        if (request.getItemId() == null || request.getItemId().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item id is required"
            );
        }
    }
}