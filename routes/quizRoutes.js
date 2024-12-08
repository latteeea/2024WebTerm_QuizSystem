const express = require('express');
const { getCategories, getQuizzes, getQuestion, submitAnswer } = require('../controllers/quizController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const pool = require('../db');

const router = express.Router();

router.get('/categories', isAuthenticated, getCategories);
router.get('/categories/:categoryId/quizzes', isAuthenticated, getQuizzes);
router.get('/quizzes/:questionId', isAuthenticated, getQuestion);
router.get('/purchase/category', isAuthenticated, (req, res) => {
    res.render('purchaseCategory');
});

router.post('/purchase/category', isAuthenticated, async (req, res) => {
    const { categoryName } = req.body;
    const userId = req.session.user.id;
    try {
        // 사용자의 점수 확인
        const [user] = await pool.query('SELECT score FROM Users WHERE id = ?', [userId]);
        if (user[0].score < 10) {
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        // 점수 차감 및 카테고리 추가
        await pool.query('UPDATE Users SET score = score - 10 WHERE id = ?', [userId]);
        await pool.query('INSERT INTO Categories (name, description) VALUES (?, ?)', [categoryName, '사용자 추가 카테고리']);

        // 세션 점수 업데이트
        req.session.user.score -= 10;

        res.send(`
            <script>
                alert('카테고리가 성공적으로 추가되었습니다!');
                window.location.href = '/dashboard';
            </script>
        `);
    } catch (error) {
        console.error('Error purchasing category:', error);
        res.status(500).send('Error purchasing category');
    }
});


router.get('/register/quiz', isAuthenticated, async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Categories');
        res.render('registerQuiz', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error loading quiz registration page');
    }
});

router.post('/register/quiz', isAuthenticated, async (req, res) => {
    const { categoryId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
    const userId = req.session.user.id;

    try {
        // 사용자 점수 확인
        const [user] = await pool.query('SELECT score FROM Users WHERE id = ?', [userId]);
        if (user[0].score < 5) {
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        // 점수 차감 및 문제 추가
        await pool.query('UPDATE Users SET score = score - 5 WHERE id = ?', [userId]);
        await pool.query(
            'INSERT INTO Questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctAnswer, userId]
        );

        // 세션 점수 업데이트
        req.session.user.score -= 5;

        res.send(`
            <script>
                alert('퀴즈가 성공적으로 추가되었습니다!');
                window.location.href = '/dashboard';
            </script>
        `);
    } catch (error) {
        console.error('Error registering quiz:', error);
        res.status(500).send('Error registering quiz');
    }
});


router.post('/submit', isAuthenticated, submitAnswer);


module.exports = router;
