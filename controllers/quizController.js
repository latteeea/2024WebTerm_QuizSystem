// quizController.js
// 퀴즈 및 카테고리 관리 관련 기능 처리
// - 카테고리 조회, 퀴즈 등록 및 문제 풀이 처리
// - 사용자 점수 업데이트 및 세션 관리

const pool = require('../db');

// 카테고리 목록 가져오기
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Categories');  // DB에서 모든 카테고리 조회
        console.log('Fetched Categories:', categories); // 디버깅 로그
        res.render('categories', { user: req.session.user, categories });  // 카테고리 데이터 템플릿에 전달
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
};

// 특정 카테고리의 퀴즈 가져오기
exports.getQuizzes = async (req, res) => {
    const categoryId = req.params.categoryId;  // URL 에서 카테고리 ID 가져오기
    try {
        const [quizzes] = await pool.query(
            'SELECT * FROM Questions WHERE category_id = ?',
            [categoryId]  // 해당 카테고리에 속한 문제 조회
        );
        res.render('quizzes', { quizzes, categoryId });  // 문제 데이터 템플릿에 전달
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).send('Error fetching quizzes');
    }
};

// 특정 문제 가져오기
exports.getQuestion = async (req, res) => {
    const questionId = req.params.questionId;  // URL에서 문제 ID 가져오기
    try {
        const [question] = await pool.query('SELECT * FROM Questions WHERE id = ?', [questionId]);  // 문제 조회
        if (question.length === 0) return res.status(404).send('Question not found');
        res.render('question', { question: question[0] });  // 문제 데이터 템플릿에 전달
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching question');
    }
};


exports.submitAnswer = async (req, res) => {
    console.log('User:', req.user);
    const { questionId, selectedOption } = req.body;  // 요청에서 문제 ID와 선택한 답안 가져오기
    const userId = req.user.id;

    try {
        const [question] = await pool.query('SELECT correct_answer FROM Questions WHERE id = ?', [questionId]);
        if (!question || question.length === 0) {
            console.error('No question found for ID:', questionId);
            return res.status(404).send('Question not found');
        }

        const isCorrect = question[0].correct_answer === selectedOption;  // 정답 비교

        if (isCorrect) {
            await pool.query('UPDATE Users SET score = score + 1 WHERE id = ?', [userId]);  // 정답 시 사용자 점수 1점 증가시키기
            req.user.score += 1; // 세션의 사용자 점수 업데이트
            req.session.save(() => {  // 세션 저장 후 리다이렉트
                res.redirect('/dashboard');
            });
        } else {
            res.send(`
                <script>
                    alert('답이 틀렸습니다!');
                    window.location.href = '/dashboard';  // 경고창 표시 후 대시보드로 리다이렉트 
                </script>
            `);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).send('Error submitting answer');
    }
};

exports.registerQuiz = async (req, res) => {
    const { categoryId, questionText, options, correctAnswer } = req.body;  // 요청에서 퀴즈 데이터 가져오기
    const userId = req.user.id;  // 사용자 ID 가져오기

    try {
        // 점수 확인
        const hasEnoughScore = await checkUserScore(userId, 5);  // 퀴즈 등록권 최소 점수 5점 확인
        if (!hasEnoughScore) {
            return res.status(400).json({ error: '점수가 부족합니다.' });
        }

        // 퀴즈 저장
        await pool.query('UPDATE Users SET score = score - 5 WHERE id = ?', [userId]);  // 퀴즈 등록권 5점 차감
        await pool.query(
            'INSERT INTO Questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [categoryId, questionText, options[0], options[1], options[2], options[3], correctAnswer, userId]  // 퀴즈 데이터 삽입
        );

        res.status(201).json({ message: '퀴즈가 성공적으로 등록되었습니다.' });
    } catch (error) {
        console.error('Error registering quiz:', error);
        res.status(500).json({ error: '퀴즈 등록 중 오류가 발생했습니다.' });
    }
};


