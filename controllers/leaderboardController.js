// controllers/leaderboardController.js
const Leaderboard = require('../models/leaderboardModel');

exports.addScore = async (req, res) => {
    try {
        const { username, score } = req.body;
        if (!username || typeof score !== 'number' || score < 0) {
            return res.status(400).json({ success: false, message: 'Invalid username or score' });
        }
        const recordId = await Leaderboard.addScore(username, score);
        res.status(201).json({ success: true, id: recordId, message: 'Score saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save score', error: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await Leaderboard.getTopScores(10);
        res.json({ success: true, data: scores, count: scores.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load leaderboard', error: error.message });
    }
};