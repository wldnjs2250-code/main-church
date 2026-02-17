
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
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
      else if (sheet === 'sermons') query = 'SELECT * FROM sermons ORDER BY date DESC, id DESC';
      else if (sheet === 'news') query = 'SELECT * FROM news ORDER BY is_pinned DESC, date DESC, id DESC';

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
          INSERT INTO church_info (
            id, name, pastor, address, phone, password, worship_schedule, 
            greeting, vision, about_content, pastor_image, greeting_title, 
            vision_title, youtube_url, instagram_url, kakao_url
          )
          VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
          name=$1, pastor=$2, address=$3, phone=$4, password=$5, worship_schedule=$6, 
          greeting=$7, vision=$8, about_content=$9, pastor_image=$10, greeting_title=$11, 
          vision_title=$12, youtube_url=$13, instagram_url=$14, kakao_url=$15
        `;
        const values = [
          data.name, data.pastor, data.address, data.phone, data.password,
          typeof data.worship_schedule === 'string' ? data.worship_schedule : JSON.stringify(data.worship_schedule),
          data.greeting, data.vision, data.about_content, data.pastor_image,
          data.greeting_title, data.vision_title,
          data.youtube_url, data.instagram_url, data.kakao_url
        ];
        await pool.query(query, values);
      } else if (sheet === 'sermons') {
        await pool.query('DELETE FROM sermons');
        for (const s of data) {
          const query = `
            INSERT INTO sermons (id, title, speaker, date, videoUrl, scripture, thumbnail)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await pool.query(query, [s.id, s.title, s.speaker, s.date, s.videoUrl, s.scripture, s.thumbnail]);
        }
      } else if (sheet === 'news') {
        await pool.query('DELETE FROM news');
        for (const n of data) {
          const query = `
            INSERT INTO news (id, title, content, date, image, is_pinned)
            VALUES ($1, $2, $3, $4, $5, $6)
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
    console.error("DB 처리 에러:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
