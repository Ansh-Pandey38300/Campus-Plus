
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true,
    ca: require('fs').readFileSync(
      require('path').join(__dirname, 'ca.pem')
    )
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});
