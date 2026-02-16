
const { Pool } = require('pg');

// 넷플리파이 환경변수에서 DATABASE_URL을 직접 읽어옵니다.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // CORS 설정을 위한 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // queryStringParameters가 null일 경우를 대비해 안전하게 접근합니다.
  const params = event.queryStringParameters || {};
  const sheet = params.sheet || 'info';

  try {
    if (event.httpMethod === 'GET') {
      let query = '';
      if (sheet === 'info') query = 'SELECT * FROM church_info LIMIT 1';
      else if (sheet === 'sermons') query = 'SELECT * FROM sermons ORDER BY date DESC';
      else if (sheet === 'news') query = 'SELECT * FROM news ORDER BY date DESC';

      const result = await pool.query(query);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sheet === 'info' ? (result.rows[0] || {}) : result.rows)
      };
    } 

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      if (sheet === 'info') {
        const query = `
          INSERT INTO church_info (id, name, pastor, address, phone, password, worship_schedule, greeting, vision, about_content, pastor_image)
          VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
          name=$1, pastor=$2, address=$3, phone=$4, password=$5, worship_schedule=$6, greeting=$7, vision=$8, about_content=$9, pastor_image=$10
        `;
        const values = [
          data.name, data.pastor, data.address, data.phone, data.password,
          typeof data.worship_schedule === 'string' ? data.worship_schedule : JSON.stringify(data.worship_schedule),
          data.greeting, data.vision, data.about_content, data.pastor_image
        ];
        await pool.query(query, values);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
  } catch (error) {
    console.error("실제 발생한 DB 에러:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
