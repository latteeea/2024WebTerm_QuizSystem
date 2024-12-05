const db = require('../db'); // DB 연결
const bcrypt = require('bcryptjs'); // 비밀번호 암호화를 위한 라이브러리

// 회원가입 처리 함수
const signup = (req, res) => {
    const { username, email, password } = req.body;

    // 비밀번호 암호화
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('비밀번호 암호화 오류:', err);
            return res.status(500).send('서버 오류');
        }

        // DB에 사용자 정보 저장
        const query = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('사용자 저장 오류:', err);
                return res.status(500).send('서버 오류');
            }
            // 회원가입 성공 후 로그인 페이지로 리디렉션
            res.redirect('/auth/login');
        });
    });
};

// 로그인 처리 함수 (간단한 예시)
const login = (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM Users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('로그인 오류:', err);
            return res.status(500).send('서버 오류');
        }

        if (result.length === 0) {
            return res.status(400).send('존재하지 않는 이메일입니다.');
        }

        const user = result[0];
        // 비밀번호 비교
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('비밀번호 비교 오류:', err);
                return res.status(500).send('서버 오류');
            }

            if (!isMatch) {
                return res.status(400).send('비밀번호가 일치하지 않습니다.');
            }

            // 로그인 성공 (세션 처리 등 추가 가능)
            req.session.user = {
                id : user.id,
                username : user.username,
                email : user.email
            };

            res.redirect('/dashboard');
        });
    });
};

module.exports = {
    signup,
    login,
};
