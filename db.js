const mysql = require('mysql2');

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost', // MySQL 서버 호스트 (보통 localhost)
    user: 'root', // MySQL 사용자명
    password: 'your_password', // MySQL 비밀번호
    database: 'quiz_app_db' // 사용하려는 데이터베이스 이름
});

// 연결 확인
db.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err);
    } else {
        console.log('데이터베이스 연결 성공');
    }
});

module.exports = db;
