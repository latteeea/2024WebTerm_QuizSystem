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
        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        console.log('Queried User:', users);
        if (users.length === 0) return done(null, false, { message: 'Incorrect email.' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password); // 비밀번호 비교
        console.log('Password Match:', match); // 디버깅 로그

        if (!(await bcrypt.compare(password, user.password))) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
));



// Serialize and Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const [user] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        done(null, user[0]);
    } catch (error) {
        done(error, null);
    }
});

