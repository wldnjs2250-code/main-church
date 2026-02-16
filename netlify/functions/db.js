
const { Pool } = require('pg');

// 사용자 요청에 따라 연결 방식을 connectionString으로 강제 고정합니다.
// 'base'라는 문자열이 포함된 모든 단어를 제거하였습니다.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  const method = event.httpMethod;
  const tableParam = event.queryStringParameters && event.queryStringParameters.table;
  const table = tableParam === 'info' ? 'church_info' : tableParam;

  const headers = { 
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (!process.env.DATABASE_URL) {
      console.error("환경 변수 DATABASE_URL이 설정되지 않았습니다.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: "DB 연결 설정 누락" }),
      };
    }

    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "table 파라미터가 필요합니다." }),
      };
    }

    // 데이터 조회 (GET)
    if (method === 'GET') {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows),
      };
    }

    // 데이터 저장 (POST)
    if (method === 'POST') {
      const data = JSON.parse(event.body);
      
      if (table === 'church_info') {
        const worshipScheduleStr = typeof data.worship_schedule === 'string' 
          ? data.worship_schedule 
          : JSON.stringify(data.worship_schedule || []);

        const values = [
          data.name || '',
          data.pastor || '',
          data.address || '',
          data.phone || '',
          data.password || '',
          worshipScheduleStr,
          data.greeting || '',
          data.vision || '',
          data.about_content || '',
          data.pastor_image || ''
        ];

        try {
          // id=1 행 업데이트 시도
          const updateQuery = `
            UPDATE church_info SET 
              name=$1, pastor=$2, address=$3, phone=$4, password=$5, 
              worship_schedule=$6, greeting=$7, vision=$8, about_content=$9, pastor_image=$10 
            WHERE id=1
            RETURNING id;
          `;
          
          const updateResult = await pool.query(updateQuery, values);

          // 행이 없으면 삽입
          if (updateResult.rowCount === 0) {
            const insertQuery = `
              INSERT INTO church_info (
                id, name, pastor, address, phone, password, 
                worship_schedule, greeting, vision, about_content, pastor_image
              )
              VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            `;
            await pool.query(insertQuery, values);
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "저장 완료" }),
          };

        } catch (dbErr) {
          // DB 에러 상세 출력 (base 단어 제거됨)
          console.error("DB 에러 상세:", dbErr.message, dbErr.stack);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: "DB 처리 오류", 
              details: dbErr.message 
            }),
          };
        }
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "지원하지 않는 요청" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "허용되지 않는 메서드" }),
    };

  } catch (err) {
    console.error("핸들러 치명적 오류:", err.message, err.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "서버 오류", details: err.message }),
    };
  }
};
