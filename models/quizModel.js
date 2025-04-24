// models/quizModel.js
const db = require('../config/db');

class Quiz {
    static async getQuestions(passcode) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM questions WHERE passcode = ? ORDER BY RAND() LIMIT 10`,
                [passcode]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    }

    static async addQuestion(questionData) {
        const { question, option1, option2, option3, option4, correct_answer, category, passcode } = questionData;
        try {
            const [result] = await db.query(
                `INSERT INTO questions 
                 (question, option1, option2, option3, option4, correct_answer, category, passcode) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [question, option1, option2, option3, option4, correct_answer, category, passcode]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error adding question:', error);
            throw error;
        }
    }
}

module.exports = Quiz;