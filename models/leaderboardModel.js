// models/leaderboardModel.js
const db = require('../config/db');

class Leaderboard {
    static async addScore(username, score) {
        try {
            const [result] = await db.query(
                `INSERT INTO leaderboard (username, score) VALUES (?, ?)`,
                [username, score]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error adding score:', error);
            throw error;
        }
    }

    static async getTopScores(limit = 10) {
        try {
            const [rows] = await db.query(
                `SELECT username, score, date FROM leaderboard ORDER BY score DESC LIMIT ?`,
                [limit]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
}

module.exports = Leaderboard;