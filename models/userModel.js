const db = require('../db');

// 사용자 정보 저장 (회원가입)
const createUser = (username, email, password) => {
    const query = 'INSERT INTO Users (username, email, password, score) VALUES (?, ?, ?, 0)';
    return new Promise((resolve, reject) => {
        db.query(query, [username, email, password], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// 이메일로 사용자 찾기 (로그인 시)
const findUserByEmail = (email) => {
    const query = 'SELECT * FROM Users WHERE email = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [email], (err, result) => {
            if (err) reject(err);
            resolve(result[0]); // 첫 번째 사용자 반환
        });
    });
};

// 비밀번호 비교 함수 (비밀번호는 실제로 bcrypt 등의 암호화 라이브러리로 처리해야 함)
const comparePassword = (inputPassword, storedPassword) => {
    return inputPassword === storedPassword;  // 실제 구현에서는 bcrypt 등을 사용하는 것이 좋습니다.
};

module.exports = { createUser, findUserByEmail, comparePassword };
