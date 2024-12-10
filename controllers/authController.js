// authController.js
// 사용자 인증 및 회원 관리 관련 기능 처리
// - 회원가입, 로그인, 로그아웃 구현
// - 사용자 점수 기반 랭킹 표시 (Leaderboard)


const bcrypt = require('bcrypt');
const pool = require('../db');
const passport = require('passport');

// 회원가입
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;  // 클라이언트로부터 받은 사용자 입력값
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // 데이터베이스에 새로운 사용자 정보 저장
        await pool.query(
            'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        // 회원가입 성공 시 로그인 페이지로 리다이렉트
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        // 에러 발생 시 회원가입 페이지에 에러 메시지 전달
        res.render('signup', { error: '회원가입에 실패했습니다.' });
    }
};

// Passport를 통한 로그인
exports.login = passport.authenticate('local', {
    successRedirect: '/dashboard', // 인증 성공 시 대시보드 이동
    failureRedirect: '/login',  // 인증 실패 시 로그인 페이지 이동
    failureFlash: true  // 인증 실패 메시지를 Flash로 전달
});

// 로그아웃
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect('/dashboard');  // 로그아웃 에러 발생 시 대시보드 이동
        }
        res.redirect('/');  // 로그아웃 성공 시 메인 페이지로 리다이렉트
    });
};

// 실시간 점수 랭킹 표
exports.getLeaderboard = async (req, res) => {
    try {
        // 점수 기준 상위 10명의 사용자 데이터 가져오기
        const [users] = await pool.query(
            'SELECT username, score FROM Users ORDER BY score DESC LIMIT 10'
        );
        // 메인 페이지에 사용자 랭킹 데이터 렌더링
        res.render('index', { title: '온라인 퀴즈 시스템', users });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
};
