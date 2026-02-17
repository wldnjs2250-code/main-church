
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

  const params = event.queryStringParameters || {};
  const sheet = params.sheet || 'info';

  try {
    if (event.httpMethod === 'GET') {
      let query = '';
      if (sheet === 'info') query = 'SELECT * FROM church_info LIMIT 1';
      else if (sheet === 'sermons') query = 'SELECT * FROM sermons ORDER BY date DESC';
      else if (sheet === 'news') query = 'SELECT * FROM news ORDER BY is_pinned DESC, date DESC';

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
      } else if (sheet === 'sermons') {
        // 설교 데이터 벌크 업데이트 (간편화를 위해 기존 데이터 삭제 후 삽입 또는 루프 처리 가능)
        // 여기서는 데이터 무결성 보장을 위해 각 항목별 ON CONFLICT 처리
        for (const s of data) {
          const query = `
            INSERT INTO sermons (id, title, speaker, date, videoUrl, scripture, thumbnail)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
            title=$2, speaker=$3, date=$4, videoUrl=$5, scripture=$6, thumbnail=$7
          `;
          await pool.query(query, [s.id, s.title, s.speaker, s.date, s.videoUrl, s.scripture, s.thumbnail]);
        }
      } else if (sheet === 'news') {
        for (const n of data) {
          const query = `
            INSERT INTO news (id, title, content, date, image, is_pinned)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
            title=$2, content=$3, date=$4, image=$5, is_pinned=$6
          `;
          await pool.query(query, [n.id, n.title, n.content, n.date, n.image, n.is_pinned || false]);
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
  } catch (error) {
    console.error("DB Error:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
