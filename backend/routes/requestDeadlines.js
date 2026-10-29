
const express = require('express');
const router = express.Router();

const requestDeadlineService = require('../services/requestDeadlineService');

// Prevent overlapping executions if a database operation takes too long.
let isClosingExpiredRequests = false;

async function runDeadlineCheck() {
  if (isClosingExpiredRequests) {
    return;
  }

  isClosingExpiredRequests = true;
  
  try {
    const result =
      await requestDeadlineService.closeExpiredRequests();

    if (result.closedCount > 0) {
      console.log(
        `[Request Deadlines] Closed ${result.closedCount} expired request(s).`
      );
    }
  } catch (error) {
    console.error(
      '[Request Deadlines] Failed to close expired requests:',
      error.message
    );
  } finally {
    isClosingExpiredRequests = false;
  }
}

// Run immediately after the backend loads this module.
runDeadlineCheck();

console.log('[Request Deadlines] Scheduler started.');

// Check every 60 seconds.
const deadlineInterval = setInterval(runDeadlineCheck, 60 * 1000);

// Allow the Node.js process to exit normally during shutdown.
if (typeof deadlineInterval.unref === 'function') {
  deadlineInterval.unref();
}


router.post('/requests/close-expired', async (req, res) => {
  try {
    const result =
      await requestDeadlineService.closeExpiredRequests();

    res.status(200).json({
      message: 'Expired requests processed successfully.',
      closedCount: result.closedCount
    });
  } catch (error) {
    console.error('Manual deadline check failed:', error);

    res.status(500).json({
      message: 'Failed to process expired requests.'
    });
  }
});

router.post('/requests/close-required',async(req,res))



module.exports = router;
