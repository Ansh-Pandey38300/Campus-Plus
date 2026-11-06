
const AppError = require('../utils/AppError');
const profileModel = require('../models/profileModel');

async function getMyProfile(userIdValue) {
  const userId = Number(userIdValue);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError('Invalid user ID.', 400);
  }

  // Fetch all profile information.
  const [
    profile,
    myRequests,
    myOffers,
    myRatings,
    ratingSummary
  ] = await Promise.all([
    profileModel.getUserProfile(userId),
    profileModel.getMyRequests(userId),
    profileModel.getMyOffers(userId),
    profileModel.getMyRatings(userId),
    profileModel.getRatingSummary(userId)
  ]);

  if (!profile) {
    throw new AppError('User profile not found.', 404);
  }

  return {
    profile,

    stats: {
      total_requests: myRequests.length,
      total_offers: myOffers.length,
      average_rating: Number(
        ratingSummary.average_rating || 0
      ),
      total_ratings: Number(
        ratingSummary.total_ratings || 0
      )
    },

    my_requests: myRequests,
    my_offers: myOffers,

    rating: {
      average_rating: Number(
        ratingSummary.average_rating || 0
      ),
      total_ratings: Number(
        ratingSummary.total_ratings || 0
      ),
      reviews: myRatings
    }
  };
}

module.exports = {
  getMyProfile
};
