// passport.js
// Passport.js 설정 및 인증 전략 구현
// - LocalStrategy를 사용한 이메일/비밀번호 인증 처리
// - 사용자 세션 직렬화/역직렬화 설정


const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
module.exports = passport;
const pool = require('../db'); // 데이터베이스 연결

// Local Strategy 등록
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // 이메일 필드를 사용
        passwordField: 'password' // 비밀번호 필드
    },
    async (email, password, done) => {
        // 데이터베이스에서 이메일로 사용자 조회
        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        console.log('Queried User:', users);
        if (users.length === 0) return done(null, false, { message: 'Incorrect email.' });

        const user = users[0]; // 조회된 사용자 정보
        const match = await bcrypt.compare(password, user.password); // 비밀번호 비교 (해시 사용)
        console.log('Password Match:', match); // 디버깅 로그

        if (!(await bcrypt.compare(password, user.password))) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
));



// SerializeUser : 사용자 세션에 저장할 정보 설정 (id만 저장)
passport.serializeUser((user, done) => done(null, user.id));

// DeserializeUser : 세션에서 id를 가져와 사용자 전체 정보 복원
passport.deserializeUser(async (id, done) => {
    try {
        // 데이터베이스에서 사용자 조회
        const [user] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        done(null, user[0]);  // 사용자 정보 반환
    } catch (error) {
        done(error, null);
    }
});

