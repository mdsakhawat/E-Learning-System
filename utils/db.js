const mysql = require("mysql");
const util = require("util");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  //waitForConnections: true
  
});

const pool_query = util.promisify(pool.query).bind(pool);

module.exports = {
  load: (sql) => pool_query(sql),
  add: (entity, tableName) =>
    pool_query(`insert into ${tableName} set ?`, entity),
  del: (condition, tableName) =>
    pool_query(`delete from ${tableName} where ?`, condition),
  delWith2Key: (condition_1, condition_2, tableName) => {
    pool_query(`delete from ${tableName} where ? and ?`, [
      condition_1,
      condition_2,
    ]);
  },
  patch: (entity, condition, tableName) =>{
    pool_query(`update ${tableName} set ? where ?`, [entity, condition])
  },
  patchWith2Key: (entity, condition_1, condition_2, tableName) => {
    pool_query(`update ${tableName} set ? where ? and ?`, [
      entity,
      condition_1,
      condition_2,
    ]);
  },
};
