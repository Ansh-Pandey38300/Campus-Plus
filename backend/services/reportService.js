const reportModel = require('../models/reportModel');

async function getAllReports() {
  const [
    requestsWithoutOffers,
    topCategories,
    topSellers,
    buyerSavings
  ] = await Promise.all([
    reportModel.getRequestsWithoutOffers(),
    reportModel.getTopCategories(),
    reportModel.getTopSellers(),
    reportModel.getBuyerSavings()
  ]);

  return {
    requestsWithoutOffers,
    topCategories,
    topSellers,
    buyerSavings
  };
}

module.exports = {
  getAllReports
};