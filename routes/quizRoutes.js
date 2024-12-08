const express = require('express');
const { getCategories, getQuizzes, getQuestion, submitAnswer } = require('../controllers/quizController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const pool = require('../db');

const router = express.Router();

// 사용자 점수 확인 함수
const checkUserScore = async (userId, requiredScore) => {
    const [user] = await pool.query('SELECT score FROM Users WHERE id = ?', [userId]);
    return user[0].score >= requiredScore;
};

// 카테고리 목록 조회
router.get('/categories', isAuthenticated, getCategories);

// 특정 카테고리의 퀴즈 조회
router.get('/categories/:categoryId/quizzes', isAuthenticated, getQuizzes);

// 특정 퀴즈 질문 조회
router.get('/quizzes/:questionId', isAuthenticated, getQuestion);

// 카테고리 구매 페이지
router.get('/purchase/category', isAuthenticated, (req, res) => {
    res.render('purchaseCategory');
});

// 카테고리 구매 처리
router.post('/purchase/category', isAuthenticated, async (req, res) => {
    const { categoryName } = req.body;
    const userId = req.user.id;

    if (!categoryName || categoryName.trim() === '') {
        return res.send(`
            <script>
                alert('카테고리 이름은 필수입니다.');
                window.location.href = '/dashboard';
            </script>
        `);
    }

    try {
        const hasEnoughScore = await checkUserScore(userId, 10);
        if (!hasEnoughScore) {
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        await pool.query('UPDATE Users SET score = score - 10 WHERE id = ?', [userId]);
        await pool.query('INSERT INTO Categories (name, description) VALUES (?, ?)', [categoryName, '사용자 추가 카테고리']);
        req.user.score -= 10;

        req.session.save(() => {
            res.send(`
                <script>
                    alert('카테고리가 성공적으로 추가되었습니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        });
    } catch (error) {
        console.error('Error purchasing category:', error);
        res.status(500).send('Error purchasing category');
    }
});

// 퀴즈 등록 페이지
router.get('/register/quiz', isAuthenticated, async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Categories');
        res.render('registerQuiz', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error loading quiz registration page');
    }
});

// 퀴즈 등록 처리
router.post('/register/quiz', isAuthenticated, async (req, res) => {
    const { categoryId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
    const userId = req.user.id;

    try {
        const hasEnoughScore = await checkUserScore(userId, 5);
        if (!hasEnoughScore) {
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        await pool.query('UPDATE Users SET score = score - 5 WHERE id = ?', [userId]);
        await pool.query(
            'INSERT INTO Questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctAnswer, userId]
        );
        req.user.score -= 5;

        req.session.save(() => {
            res.send(`
                <script>
                    alert('퀴즈가 성공적으로 추가되었습니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        });
    } catch (error) {
        console.error('Error registering quiz:', error);
        res.status(500).send('Error registering quiz');
    }
});

// 답안 제출
router.post('/submit', isAuthenticated, submitAnswer);

module.exports = router;
