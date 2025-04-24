// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/', quizController.getQuestions);
router.post('/', quizController.addQuestion);
router.post('/bulk', quizController.addQuestionsBulk);

module.exports = router;