package com.nailsvilla.reviews;

import com.nailsvilla.customers.Customer;
import com.nailsvilla.customers.CustomerRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicReviewsController {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;

    public PublicReviewsController(ReviewRepository reviewRepository, CustomerRepository customerRepository) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/api/v1/reviews")
    public List<ReviewResponse> listApprovedReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.APPROVED).stream()
                .map(review -> new ReviewResponse(
                        review.getId(),
                        customerRepository.findById(review.getCustomerId()).map(Customer::getFirstName).orElse("A customer"),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                ))
                .toList();
    }
}
