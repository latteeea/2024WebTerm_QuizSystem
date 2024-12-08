const bcrypt = require('bcrypt');
const pool = require('../db');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('signup', { error: '회원가입에 실패했습니다.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.render('login', { error: '잘못된 이메일 또는 비밀번호입니다.' });
        }
        req.session.user = rows[0];
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: '로그인에 실패했습니다.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getLeaderboard = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT username, score FROM Users ORDER BY score DESC LIMIT 10'
        );
        res.render('index', { title: '온라인 퀴즈 시스템', users });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
};
