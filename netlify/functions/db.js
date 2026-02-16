
const { Pool } = require('pg');

// SSL 설정 및 커넥션 풀 초기화
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Netlify/Neon DB 연결 시 권장 설정
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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

  try {
    if (method === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Table parameter is required" }),
      };
    }

    if (!process.env.DATABASE_URL) {
      console.error("FATAL: DATABASE_URL is not defined in environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: "Database configuration missing" }),
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
        const values = [
          data.name,           // $1
          data.pastor,         // $2
          data.address,        // $3
          data.phone,          // $4
          data.password,       // $5
          data.worship_schedule, // $6
          data.greeting,       // $7
          data.vision,         // $8
          data.about_content,  // $9
          data.pastor_image    // $10
        ];

        try {
          // 1. 먼저 UPDATE 시도 (id=1 인 행이 있다고 가정)
          const updateQuery = `
            UPDATE church_info SET 
              name=$1, pastor=$2, address=$3, phone=$4, password=$5, 
              worship_schedule=$6, greeting=$7, vision=$8, about_content=$9, pastor_image=$10 
            WHERE id=1
          `;
          const updateResult = await pool.query(updateQuery, values);

          // 2. 만약 업데이트된 행이 없다면 (id=1이 존재하지 않음) INSERT 수행
          if (updateResult.rowCount === 0) {
            console.log("No existing row with id=1. Performing INSERT.");
            const insertQuery = `
              INSERT INTO church_info (
                id, name, pastor, address, phone, password, 
                worship_schedule, greeting, vision, about_content, pastor_image
              )
              VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;
            await pool.query(insertQuery, values);
          }

          console.log(`Success: Data saved to ${table}`);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "성공적으로 저장되었습니다!" }),
          };

        } catch (dbErr) {
          // 상세 에러 로깅 (Netlify Functions 로그에서 확인 가능)
          console.error("--- DB 에러 상세 시작 ---");
          console.error("메시지:", dbErr.message);
          console.error("스택 트레이스:", dbErr.stack);
          console.error("수신 데이터:", JSON.stringify(data));
          console.error("--- DB 에러 상세 종료 ---");
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: "데이터베이스 처리 중 오류가 발생했습니다.", 
              details: dbErr.message 
            }),
          };
        }
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Only church_info is supported for direct POST updates currently" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };

  } catch (err) {
    console.error("--- 치명적 핸들러 오류 ---");
    console.error(err.message, err.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "Internal Server Error", details: err.message }),
    };
  }
};
