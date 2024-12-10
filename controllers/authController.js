const bcrypt = require('bcrypt');
const pool = require('../db');
const passport = require('passport');

// 회원가입
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

// Passport를 통한 로그인
exports.login = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true // 플래시 메시지를 사용하려면 활성화
});

// 로그아웃
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
};

// 실시간 점수 랭킹 표
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
