
const { Pool } = require('pg');

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

  try {
    if (method === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Table parameter is required (?table=...)" }),
      };
    }

    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Database configuration (DATABASE_URL) is missing." }),
      };
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server Error", details: err.message }),
    };
  }
};
