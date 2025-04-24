// controllers/quizController.js
const Quiz = require('../models/quizModel');

exports.getQuestions = async (req, res) => {
    try {
        const { passcode } = req.query;
        if (!passcode) {
            return res.status(400).json({ success: false, message: 'Passcode is required' });
        }
        const questions = await Quiz.getQuestions(passcode);
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: 'No questions found for this passcode' });
        }
        res.json({ success: true, data: questions, count: questions.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, correct_answer, category, passcode } = req.body;
        if (!question || !option1 || !option2 || !option3 || !option4 || !correct_answer || !passcode) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const questionId = await Quiz.addQuestion(req.body);
        res.status(201).json({ success: true, id: questionId, message: 'Question added successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to add question', error: error.message });
    }
};

exports.addQuestionsBulk = async (req, res) => {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Questions array is required' });
        }

        for (const questionData of questions) {
            const { question, option1, option2, option3, option4, correct_answer, category, passcode } = questionData;
            if (!question || !option1 || !option2 || !option3 || !option4 || !correct_answer || !passcode) {
                return res.status(400).json({ success: false, message: 'Missing required fields in one of the questions' });
            }
            await Quiz.addQuestion({ question, option1, option2, option3, option4, correct_answer, category, passcode });
        }

        res.status(201).json({ success: true, message: 'Questions added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add questions', error: error.message });
    }
};