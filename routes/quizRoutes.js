// quizRoutes.js
// 퀴즈 및 카테고리 관리 관련 경로 설정
// - REST API 및 HTML 페이지 라우트 구현
// - 카테고리 및 문제 등록, 답안 제출 처리


const express = require('express');
const { getCategories, getQuizzes, getQuestion, submitAnswer,registerQuiz } = require('../controllers/quizController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const pool = require('../db');

const router = express.Router();

// 사용자 점수 확인 함수
const checkUserScore = async (userId, requiredScore) => {
    const [user] = await pool.query('SELECT score FROM Users WHERE id = ?', [userId]);
    return user[0].score >= requiredScore;
};

// 카테고리 목록 조회
router.get('/categories', isAuthenticated, getCategories);  // 모든 카테고리 렌더링

// 특정 카테고리의 퀴즈 조회
router.get('/categories/:categoryId/quizzes', isAuthenticated, getQuizzes);  // 카테고리 ID에 따른 퀴즈 조회

// 특정 퀴즈 질문 조회
router.get('/quizzes/:questionId', isAuthenticated, getQuestion);  // 퀴즈 ID에 따른 질문 조회

// 카테고리 구매 페이지
router.get('/purchase/category', isAuthenticated, (req, res) => {
    res.render('purchaseCategory');
});

// 카테고리 구매 처리
router.post('/purchase/category', isAuthenticated, async (req, res) => {
    const { categoryName } = req.body;  // 클라이언트로부터 카테고리 이름 받기
    const userId = req.user.id;  // 사용자 ID 가져오기

    if (!categoryName || categoryName.trim() === '') {
        return res.send(`
            <script>
                alert('카테고리 이름은 필수입니다.');
                window.location.href = '/dashboard';
            </script>
        `);
    }

    try {
        const hasEnoughScore = await checkUserScore(userId, 10); // 카테고리 등록권 10점 구매 가능한지 확인
        if (!hasEnoughScore) {
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        await pool.query('UPDATE Users SET score = score - 10 WHERE id = ?', [userId]);  // 카테고리 등록권 10점 차감
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
        const [categories] = await pool.query('SELECT * FROM Categories');  // 모든 카테고리 조회
        res.render('registerQuiz', { categories });  // 카테고리 데이터를 퀴즈 등록 페이지에 전달
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
        const hasEnoughScore = await checkUserScore(userId, 5);  // 퀴즈 등록권 5점 구매 가능 여부 확인
        if (!hasEnoughScore) {
            // 점수가 부족한 경우 경고창 표시
            return res.send(`
                <script>
                    alert('점수가 부족합니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }

        await pool.query('UPDATE Users SET score = score - 5 WHERE id = ?', [userId]);  // 퀴즈 등록권 5점 차감
        await pool.query(
            'INSERT INTO Questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, questionText, optionA, optionB, optionC, optionD, correctAnswer, userId]  // 퀴즈 추가
        );
        req.user.score -= 5;  // 사용자 세션 점수 업데이트

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

// REST API 엔드포인트
router.get('/api/categories', isAuthenticated, getCategories);  // 모든 카테고리 JSON 으로 반환

router.get('/api/categories/:categoryID/quizzes', isAuthenticated, getQuizzes);  // 특정 카테고리의 퀴즈 JSON 으로 반환

router.post('/api/quiz', isAuthenticated, registerQuiz);  // JSON 요청을 통해 퀴즈 등록



// 답안 제출
router.post('/submit', isAuthenticated, submitAnswer);  // 퀴즈 정답 제출 처리

module.exports = router;
