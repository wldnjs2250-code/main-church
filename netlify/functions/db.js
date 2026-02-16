
const { Pool } = require('pg');

// Netlify Function 실행 간 연결을 재사용하기 위해 Pool을 핸들러 외부에서 선언합니다.
let pool;

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

  // Preflight 요청 처리
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // 1. 환경 변수 확인
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("FATAL ERROR: DATABASE_URL environment variable is missing.");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "데이터베이스 연결 설정이 없습니다." }),
    };
  }

  // 2. Pool 초기화 (하드코딩된 host, database 등 제거)
  if (!pool) {
    try {
      console.log("DB Pool을 초기화합니다.");
      pool = new Pool({
        connectionString: connectionString,
        ssl: {
          rejectUnauthorized: false // Neon DB 및 클라우드 DB 연결 필수 설정
        }
      });
    } catch (initErr) {
      console.error("Pool 초기화 실패:", initErr.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: "DB 초기화 실패", details: initErr.message }),
      };
    }
  }

  try {
    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Table parameter is required" }),
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
        // 복잡한 객체인 worship_schedule을 안전하게 JSON 문자열로 처리
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
          // id=1 행에 대해 업데이트 시도
          const updateQuery = `
            UPDATE church_info SET 
              name=$1, pastor=$2, address=$3, phone=$4, password=$5, 
              worship_schedule=$6, greeting=$7, vision=$8, about_content=$9, pastor_image=$10 
            WHERE id=1
            RETURNING id;
          `;
          
          const updateResult = await pool.query(updateQuery, values);

          // 업데이트된 행이 없으면(id=1이 존재하지 않으면) 새로 삽입
          if (updateResult.rowCount === 0) {
            console.log("id=1 행이 없어 새로 삽입합니다.");
            const insertQuery = `
              INSERT INTO church_info (
                id, name, pastor, address, phone, password, 
                worship_schedule, greeting, vision, about_content, pastor_image
              )
              VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            `;
            await pool.query(insertQuery, values);
          }

          console.log("성공: church_info 데이터가 저장되었습니다.");
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "성공적으로 저장되었습니다!" }),
          };

        } catch (dbErr) {
          // 쿼리 레벨의 상세 에러 로깅
          console.error("--- 데이터베이스 쿼리 에러 발생 ---");
          console.error("메시지:", dbErr.message);
          console.error("코드:", dbErr.code);
          console.error("스택:", dbErr.stack);
          console.error("--------------------------------");
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: "데이터베이스 저장 중 오류가 발생했습니다.", 
              details: dbErr.message,
              code: dbErr.code
            }),
          };
        }
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "지원하지 않는 테이블 업데이트입니다." }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };

  } catch (err) {
    // 핸들러 내부 최명적 오류 로깅
    console.error("--- 서버 치명적 오류 ---");
    console.error("에러명:", err.name);
    console.error("메시지:", err.message);
    console.error("스택:", err.stack);
    console.error("------------------------");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "Internal Server Error", details: err.message }),
    };
  }
};
