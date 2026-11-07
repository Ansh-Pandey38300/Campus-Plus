# Campus Plus – End-to-End Testing Checklist

**Task:** 4.1 – Write End-to-End Test Checklist
**Purpose:** Verify that all major features of Campus Plus work correctly from the user's point of view.

## 1. Registration and Login

- [ ] Register a new student account with valid details.
- [ ] Verify that registration fails when required fields are empty.
- [ ] Verify that an invalid email format is rejected.
- [ ] Verify that passwords shorter than the allowed length are rejected.
- [ ] Verify that mismatched password and confirm-password fields show an error.
- [ ] Verify that an already registered email cannot be registered again.
- [ ] Log in with valid credentials.
- [ ] Verify that incorrect email or password shows an appropriate error.
- [ ] Verify that the user remains logged in after refreshing the page.
- [ ] Log out and verify that protected pages are no longer accessible.

## 2. User Roles and Access Control

- [ ] Verify that a normal student can access student features.
- [ ] Verify that an unauthenticated visitor cannot access protected features.
- [ ] Verify that a normal student cannot access admin pages.
- [ ] Verify that an admin can access the admin dashboard.
- [ ] Verify that admin APIs reject requests from normal users.
- [ ] Verify that a blocked user cannot perform restricted actions.
- [ ] Verify that an unblocked user can use the platform again.

## 3. Dashboard and Navigation

- [ ] Verify that the homepage loads correctly.
- [ ] Verify that the navigation bar displays the correct options.
- [ ] Verify that navigation links open the correct pages.
- [ ] Verify that the dashboard displays the user's relevant information.
- [ ] Verify that the dashboard displays available requests and relevant activity.
- [ ] Verify that the footer and page layout display correctly.
- [ ] Verify that invalid URLs display the Not Found page.

## 4. Request Management

### View and Search Requests

- [ ] Verify that all active requests are displayed.
- [ ] Verify that request categories and pickup locations load correctly.
- [ ] Search for a request using its title.
- [ ] Search using description, category or location.
- [ ] Filter requests using category.
- [ ] Filter requests using minimum and maximum budget.
- [ ] Combine multiple filters and verify the results.
- [ ] Clear filters and verify that the original request list returns.
- [ ] Verify that appropriate messages appear when no requests match the filters.

### Create a Request

- [ ] Create a request with valid information.
- [ ] Verify that title, description, category, pickup location, budget and deadline are saved correctly.
- [ ] Verify that required fields cannot be left empty.
- [ ] Verify that invalid budget or deadline values are rejected.
- [ ] Verify that the newly created request appears in the request list.
- [ ] Verify that the request owner can view their request.
- [ ] Verify that expired requests are no longer open for new offers.

## 5. Seller Items

- [ ] Open the Seller Items page.
- [ ] Add a seller item with valid details.
- [ ] Verify that required fields are validated.
- [ ] Verify that the newly added item appears in the marketplace.
- [ ] Verify that the seller can view their own listed items.
- [ ] Verify that item details, price and description are displayed correctly.
- [ ] Verify that another user can view available seller items.
- [ ] Verify that unauthenticated users cannot add items.

## 6. Offers and Reverse Bidding

### Buyer Side

- [ ] Open a request's offers page.
- [ ] Verify that the buyer can see offers submitted for their request.
- [ ] Verify that offer details, seller information and prices are displayed correctly.
- [ ] Verify that the buyer can view offer price history.
- [ ] Select an offer.
- [ ] Verify that the selected offer creates a deal.
- [ ] Verify that other offers cannot be selected after the request has been accepted/closed.

### Seller Side

- [ ] Open an available request.
- [ ] Submit an offer with a valid price and description.
- [ ] Verify that the offer appears for the buyer.
- [ ] Revise an existing offer.
- [ ] Verify that the updated offer is displayed correctly.
- [ ] Verify that price history records the changes.
- [ ] Verify that sellers cannot submit offers on their own requests.
- [ ] Verify that sellers cannot submit offers on closed or expired requests.
- [ ] Verify that invalid offer prices are rejected.

## 7. Deal Management

- [ ] Verify that selecting an offer creates a deal successfully.
- [ ] Verify that both buyer and seller can access the deal.
- [ ] Verify that unrelated users cannot access the deal.
- [ ] Verify that deal details display the correct buyer, seller and selected offer.
- [ ] Verify that deal status updates correctly during the process.
- [ ] Verify that the deal appears in the user's My Deals section.
- [ ] Verify that deal information remains correct after refreshing the page.

## 8. Payment Process

- [ ] Verify that the buyer can mark payment as completed.
- [ ] Verify that the seller can confirm receipt of payment.
- [ ] Verify that the payment status updates correctly.
- [ ] Verify that the buyer cannot confirm receipt on behalf of the seller.
- [ ] Verify that the seller cannot mark the buyer's payment as completed on their behalf.
- [ ] Verify that unrelated users cannot perform payment actions.
- [ ] Verify that invalid or repeated payment actions are handled correctly.

## 9. Handover Process

- [ ] Verify that the seller can mark the item as handed over.
- [ ] Verify that the buyer can confirm the handover.
- [ ] Verify that the handover status updates correctly.
- [ ] Verify that the buyer cannot mark the item as handed over on behalf of the seller.
- [ ] Verify that the seller cannot confirm the buyer's handover.
- [ ] Verify that unrelated users cannot perform handover actions.
- [ ] Verify that invalid or repeated handover actions are handled correctly.

## 10. Ratings and Reviews

- [ ] Verify that the buyer can submit a rating after a completed deal.
- [ ] Verify that the buyer can select a star rating.
- [ ] Verify that the buyer can add a review.
- [ ] Verify that the submitted rating appears in the seller's reviews.
- [ ] Verify that the seller's average rating is updated correctly.
- [ ] Verify that a buyer cannot rate the same deal multiple times.
- [ ] Verify that sellers cannot rate themselves.
- [ ] Verify that ratings cannot be submitted for ineligible or incomplete deals.

## 11. Complaints

- [ ] Verify that a user can submit a complaint against an eligible deal.
- [ ] Verify that the complaint reason and description are saved correctly.
- [ ] Verify that required complaint details are validated.
- [ ] Verify that a user cannot submit duplicate complaints for the same deal if the system prevents it.
- [ ] Verify that users cannot access complaints belonging to unrelated users.
- [ ] Verify that submitted complaints appear in the admin complaints page.
- [ ] Verify that the complaint status is displayed correctly.

## 12. Admin Dashboard and User Management

- [ ] Verify that an admin can open the admin dashboard.
- [ ] Verify that dashboard statistics load correctly.
- [ ] Verify that the admin can view the list of users.
- [ ] Search users by name.
- [ ] Search users by email or user ID.
- [ ] Verify that user details and account status are displayed correctly.
- [ ] Verify that an admin can unblock an eligible blocked user.
- [ ] Verify that the user's status changes after unblocking.
- [ ] Verify that normal users cannot access admin user management.

## 13. Admin Complaint Moderation

- [ ] Verify that the admin can view all submitted complaints.
- [ ] Verify that complaint details include reporter, buyer, seller and deal information.
- [ ] Verify that the admin can issue a warning to the selected user.
- [ ] Verify that the admin can temporarily block the selected user.
- [ ] Verify that the block duration is validated.
- [ ] Verify that the user's account status reflects the moderation action.
- [ ] Verify that resolved complaints display the correct final status.
- [ ] Verify that the affected user is identified correctly.
- [ ] Verify that warned users are highlighted in orange.
- [ ] Verify that blocked users are highlighted in red.
- [ ] Verify that block duration and end date are displayed correctly.
- [ ] Verify that unaffected users retain normal styling.
- [ ] Verify that open complaints do not incorrectly display penalty information.
- [ ] Verify that moderation actions generate the appropriate notifications.

## 14. Admin Reports

- [ ] Verify that an admin can open the reports page.
- [ ] Verify that report data loads correctly.
- [ ] Verify that report statistics match the underlying application data.
- [ ] Verify that the report page handles empty data correctly.
- [ ] Verify that loading and error states are displayed properly.
- [ ] Verify that normal users cannot access admin reports.

## 15. Notifications

- [ ] Verify that the notification bell displays the unread notification count.
- [ ] Verify that users receive relevant notifications for important activities.
- [ ] Verify that notifications appear in the notification list.
- [ ] Verify that opening a notification marks it as read where applicable.
- [ ] Verify that an individual notification can be marked as read.
- [ ] Verify that all notifications can be marked as read.
- [ ] Verify that the unread count updates after reading notifications.
- [ ] Verify that users cannot access another user's notifications.
- [ ] Verify that notification history remains available after refreshing the page.

## 16. Profile

- [ ] Verify that the logged-in user can open their profile.
- [ ] Verify that profile information is displayed correctly.
- [ ] Verify that profile information matches the registered account.
- [ ] Verify that profile sections load without errors.
- [ ] Verify that a user cannot view another user's private profile information.

## 17. General UI, Error Handling and Responsiveness

- [ ] Verify that all pages load without blank screens or unexpected errors.
- [ ] Verify that buttons and links perform their expected actions.
- [ ] Verify that forms display appropriate validation messages.
- [ ] Verify that loading indicators appear when data is being fetched.
- [ ] Verify that API and network errors are handled properly.
- [ ] Verify that empty states are displayed when no data is available.
- [ ] Verify that success and error messages are clear.
- [ ] Verify that refreshing a page does not cause unexpected errors.
- [ ] Verify that the website works on desktop, tablet and mobile screen sizes.
- [ ] Verify that there are no major layout issues, overlapping elements or broken links.
- [ ] Verify that browser console and network tabs do not show unexpected errors during normal usage.

---

## Final Completion Criteria

The end-to-end testing checklist can be marked complete when:

- [ ] Every feature listed above has been tested.
- [ ] All major user journeys work from beginning to end.
- [ ] Buyer, seller and admin permissions work correctly.
- [ ] Invalid inputs and unauthorized actions are handled properly.
- [ ] No critical bugs remain.
- [ ] Any failed test has been recorded and reported to the responsible team member.

**Testing note:** Mark a test as passed only after actually performing it. If a feature is unavailable, not implemented or blocked by test data, mark it as Not Applicable or Blocked and mention the reason rather than marking it as passed.
