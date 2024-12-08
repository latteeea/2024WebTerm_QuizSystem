const pool = require('../db');


exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM Categories');
        console.log('Fetched Categories:', categories); // 디버깅 로그
        res.render('categories', { user: req.session.user, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
};





exports.getQuizzes = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const [quizzes] = await pool.query(
            'SELECT * FROM Questions WHERE category_id = ?',
            [categoryId]
        );
        res.render('quizzes', { quizzes, categoryId });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).send('Error fetching quizzes');
    }
};


exports.getQuestion = async (req, res) => {
    const questionId = req.params.questionId;
    try {
        const [question] = await pool.query('SELECT * FROM Questions WHERE id = ?', [questionId]);
        if (question.length === 0) return res.status(404).send('Question not found');
        res.render('question', { question: question[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching question');
    }
};


exports.submitAnswer = async (req, res) => {
    console.log('User:', req.user);
    const { questionId, selectedOption } = req.body;
    const userId = req.user.id;

    try {
        const [question] = await pool.query('SELECT correct_answer FROM Questions WHERE id = ?', [questionId]);
        if (!question || question.length === 0) {
            console.error('No question found for ID:', questionId);
            return res.status(404).send('Question not found');
        }

        const isCorrect = question[0].correct_answer === selectedOption;

        if (isCorrect) {
            await pool.query('UPDATE Users SET score = score + 1 WHERE id = ?', [userId]);
            req.user.score += 1; // 세션의 사용자 점수 업데이트
            req.session.save(() => {
                res.redirect('/dashboard');
            });
        } else {
            res.send(`
                <script>
                    alert('답이 틀렸습니다!');
                    window.location.href = '/dashboard';
                </script>
            `);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).send('Error submitting answer');
    }
};



