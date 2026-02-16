
const { Pool } = require('pg');

// Netlify Function 바깥에서 Pool을 정의하되, 핸들러 내부에서 유효성을 체크합니다.
// ENOTFOUND base 에러는 주로 DATABASE_URL이 잘못되었거나 "base"라는 문자열로 시작할 때 발생합니다.
const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL is not defined.");
    return null;
  }

  // 연결 문자열에 문제가 있는지 로그에 남깁니다 (보안을 위해 앞부분만 출력)
  console.log(`Initializing DB Pool with URL starting with: ${connectionString.substring(0, 15)}...`);

  return new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Neon DB 및 클라우드 DB 연결 필수 설정
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
};

let pool = createPool();

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

    if (!pool) {
      pool = createPool();
      if (!pool) throw new Error("Database configuration is missing (DATABASE_URL)");
    }

    if (method === 'GET') {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows),
      };
    }

    if (method === 'POST') {
      const data = JSON.parse(event.body);
      
      if (table === 'church_info') {
        // 복잡한 객체인 worship_schedule을 안전하게 JSON 문자열로 변환
        const worshipScheduleStr = typeof data.worship_schedule === 'string' 
          ? data.worship_schedule 
          : JSON.stringify(data.worship_schedule || []);

        const values = [
          data.name || '',           // $1
          data.pastor || '',         // $2
          data.address || '',        // $3
          data.phone || '',          // $4
          data.password || '',       // $5
          worshipScheduleStr,        // $6
          data.greeting || '',       // $7
          data.vision || '',         // $8
          data.about_content || '',  // $9
          data.pastor_image || ''    // $10
        ];

        try {
          // id=1 행에 대해 업데이트를 먼저 시도하고, 없으면 삽입합니다.
          const updateQuery = `
            UPDATE church_info SET 
              name=$1, pastor=$2, address=$3, phone=$4, password=$5, 
              worship_schedule=$6, greeting=$7, vision=$8, about_content=$9, pastor_image=$10 
            WHERE id=1
            RETURNING id;
          `;
          
          const updateResult = await pool.query(updateQuery, values);

          if (updateResult.rowCount === 0) {
            console.log("No row with id=1 found. Inserting new row.");
            const insertQuery = `
              INSERT INTO church_info (
                id, name, pastor, address, phone, password, 
                worship_schedule, greeting, vision, about_content, pastor_image
              )
              VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            `;
            await pool.query(insertQuery, values);
          }

          console.log("Data successfully saved to church_info");
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "성공적으로 저장되었습니다!" }),
          };

        } catch (dbErr) {
          // 데이터베이스 쿼리 에러를 아주 상세하게 로깅합니다.
          console.error("--- DB 에러 상세 정보 ---");
          console.error("에러 메시지:", dbErr.message);
          console.error("에러 코드:", dbErr.code);
          console.error("스택 트레이스:", dbErr.stack);
          console.error("수신 데이터:", JSON.stringify(data));
          console.error("------------------------");
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: "데이터베이스 처리 중 오류가 발생했습니다.", 
              details: dbErr.message,
              code: dbErr.code
            }),
          };
        }
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Unsupported table update" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };

  } catch (err) {
    console.error("--- 서버 핸들러 내부 치명적 오류 ---");
    console.error(err.message, err.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "Internal Server Error", details: err.message }),
    };
  }
};
