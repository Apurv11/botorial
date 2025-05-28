class StatisticsService {
  constructor() {
    this.statistics = {
      totalGames: 0,
      playerWins: 0,
      botWins: 0,
      totalScore: 0,
      bestScore: null,
      worstScore: null,
      averageGameDuration: 0,
      totalGameTime: 0,
      moveEfficiency: [],
      learningProgress: {
        improvedGames: 0,
        consecutiveWins: 0,
        bestStreak: 0
      }
    };
    console.log('Statistics service initialized - in-memory tracking');
  }

  updateStatistics(gameState) {
    const stats = this.statistics;
    stats.totalGames++;
    
    const playerScore = gameState.players.player.score;
    const botScore = gameState.players.bot.score;
    
    // Track wins/losses
    if (gameState.winner === 'player') {
      stats.playerWins++;
      stats.learningProgress.consecutiveWins++;
      if (stats.learningProgress.consecutiveWins > stats.learningProgress.bestStreak) {
        stats.learningProgress.bestStreak = stats.learningProgress.consecutiveWins;
      }
    } else {
      stats.botWins++;
      stats.learningProgress.consecutiveWins = 0;
    }
    
    // Track scores
    stats.totalScore += playerScore;
    if (stats.bestScore === null || playerScore < stats.bestScore) {
      stats.bestScore = playerScore;
    }
    if (stats.worstScore === null || playerScore > stats.worstScore) {
      stats.worstScore = playerScore;
    }
    
    // Track game duration
    const gameDuration = Date.now() - gameState.startTime;
    stats.totalGameTime += gameDuration;
    stats.averageGameDuration = stats.totalGameTime / stats.totalGames;
    
    // Track move efficiency (moves per minute)
    const movesPerMinute = (gameState.history.length / (gameDuration / 60000));
    stats.moveEfficiency.push(movesPerMinute);
    
    // Track learning progress
    if (stats.totalGames > 1) {
      const recentGames = Math.min(5, stats.totalGames);
      const recentScores = stats.moveEfficiency.slice(-recentGames);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      
      if (recentGames === 5) {
        const olderScores = stats.moveEfficiency.slice(-10, -5);
        if (olderScores.length === 5) {
          const avgOlder = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
          if (avgRecent > avgOlder) {
            stats.learningProgress.improvedGames++;
          }
        }
      }
    }
  }

  getStatistics() {
    const stats = this.statistics;
    return {
      overview: {
        totalGames: stats.totalGames,
        winRate: stats.totalGames > 0 ? (stats.playerWins / stats.totalGames * 100).toFixed(1) + '%' : '0%',
        playerWins: stats.playerWins,
        botWins: stats.botWins
      },
      scoring: {
        averageScore: stats.totalGames > 0 ? (stats.totalScore / stats.totalGames).toFixed(1) : 0,
        bestScore: stats.bestScore,
        worstScore: stats.worstScore,
        totalScore: stats.totalScore
      },
      performance: {
        averageGameDuration: Math.round(stats.averageGameDuration / 1000) + ' seconds',
        averageMovesPerMinute: stats.moveEfficiency.length > 0 
          ? (stats.moveEfficiency.reduce((a, b) => a + b, 0) / stats.moveEfficiency.length).toFixed(1)
          : 0,
        efficiency: stats.moveEfficiency.length > 3 ? 'Improving' : 'Learning'
      },
      progress: {
        consecutiveWins: stats.learningProgress.consecutiveWins,
        bestStreak: stats.learningProgress.bestStreak,
        improvementTrend: stats.learningProgress.improvedGames > 2 ? 'Positive' : 'Developing',
        gamesImproved: stats.learningProgress.improvedGames
      }
    };
  }

  resetStatistics() {
    this.statistics = {
      totalGames: 0,
      playerWins: 0,
      botWins: 0,
      totalScore: 0,
      bestScore: null,
      worstScore: null,
      averageGameDuration: 0,
      totalGameTime: 0,
      moveEfficiency: [],
      learningProgress: {
        improvedGames: 0,
        consecutiveWins: 0,
        bestStreak: 0
      }
    };
  }

  getTutorialProgress() {
    const stats = this.statistics;
    const progress = {
      level: 'Beginner',
      completedLessons: 0,
      totalLessons: 10,
      recommendations: []
    };

    // Determine level based on games played and win rate
    if (stats.totalGames >= 10) {
      const winRate = stats.playerWins / stats.totalGames;
      if (winRate >= 0.7) {
        progress.level = 'Expert';
        progress.completedLessons = 10;
      } else if (winRate >= 0.5) {
        progress.level = 'Intermediate';
        progress.completedLessons = 7;
      } else if (winRate >= 0.3) {
        progress.level = 'Advanced Beginner';
        progress.completedLessons = 5;
      } else {
        progress.level = 'Beginner';
        progress.completedLessons = 3;
      }
    } else if (stats.totalGames >= 5) {
      progress.level = 'Learning';
      progress.completedLessons = 2;
    } else if (stats.totalGames >= 1) {
      progress.completedLessons = 1;
    }

    // Add recommendations based on performance
    if (stats.totalGames === 0) {
      progress.recommendations.push('Start with your first game!');
    } else if (stats.playerWins === 0 && stats.totalGames >= 3) {
      progress.recommendations.push('Focus on forming pure sequences first');
      progress.recommendations.push('Ask the AI bot for strategic tips');
    } else if (stats.learningProgress.consecutiveWins >= 3) {
      progress.recommendations.push('Try advanced melding strategies');
      progress.recommendations.push('Challenge yourself with faster gameplay');
    }

    return progress;
  }
}

module.exports = new StatisticsService(); 