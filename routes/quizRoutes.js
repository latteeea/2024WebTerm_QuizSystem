const express = require('express');
const { getCategories, getQuizzes, getQuestion, submitAnswer } = require('../controllers/quizController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/categories', isAuthenticated, getCategories);
router.get('/categories/:categoryId/quizzes', isAuthenticated, getQuizzes);
router.get('/quizzes/:questionId', isAuthenticated, getQuestion);
router.get('/purchase/category', isAuthenticated, (req, res) => {
    res.send('카테고리 등록권 구매 페이지입니다.');
});

router.get('/purchase/quiz', isAuthenticated, (req, res) => {
    res.send('퀴즈 등록권 구매 페이지입니다.');
});
router.post('/submit', isAuthenticated, submitAnswer);


module.exports = router;
