const express = require('express');
const router = express.Router();
const statisticsService = require('../services/statisticsService');

// Get current statistics
router.get('/', (req, res) => {
  try {
    const stats = statisticsService.getStatistics();
    res.json({
      success: true,
      statistics: stats,
      message: 'Statistics calculated in real-time (no database required)'
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Get tutorial progress
router.get('/progress', (req, res) => {
  try {
    const progress = statisticsService.getTutorialProgress();
    res.json({
      success: true,
      progress,
      message: 'Tutorial progress tracked in-memory'
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress'
    });
  }
});

// Reset statistics (for testing)
router.post('/reset', (req, res) => {
  try {
    statisticsService.resetStatistics();
    res.json({
      success: true,
      message: 'Statistics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset statistics'
    });
  }
});

module.exports = router; 