
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  const method = event.httpMethod;
  const tableParam = event.queryStringParameters && event.queryStringParameters.table;
  const table = tableParam === 'info' ? 'church_info' : tableParam;

  // 모든 응답에 공통으로 적용될 헤더
  const headers = { 
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  try {
    // 1. CORS Preflight 처리
    if (method === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    // 2. 테이블 파라미터 체크
    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Table parameter is required (?table=...)" }),
      };
    }

    // 3. DATABASE_URL 체크 (서버 로그용)
    if (!process.env.DATABASE_URL) {
      console.error("Critical: DATABASE_URL is missing in environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Database configuration is missing." }),
      };
    }

    // 4. 데이터 읽기 (GET)
    if (method === 'GET') {
      console.log(`Fetching data from table: ${table}`);
      // SQL Injection 방지를 위해 허용된 테이블명인지 체크하는 것이 좋으나, 여기선 간단히 처리
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows),
      };
    }

    // 5. 데이터 저장하기 (POST)
    if (method === 'POST') {
      const data = JSON.parse(event.body);
      console.log(`Updating table: ${table}`, data);
      
      if (table === 'church_info') {
        // Neon DB 테이블 구조에 맞춘 쿼리 (id=1 고정 업데이트)
        await pool.query(
          'UPDATE church_info SET name=$1, pastor=$2, address=$3, phone=$4, password=$5, worship_schedule=$6 WHERE id=1',
          [data.name, data.pastor, data.address, data.phone, data.password, data.worship_schedule]
        );
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "성공적으로 저장되었습니다!" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  } catch (err) {
    console.error("--- DB Function Error Start ---");
    console.error("Method:", method);
    console.error("Table:", table);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("--- DB Function Error End ---");
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal Server Error", 
        message: err.message 
      }),
    };
  }
};
