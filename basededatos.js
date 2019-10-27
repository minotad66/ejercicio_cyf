"use strict";

const { Pool } = require("pg");

let connection;

function createConnection() {
  if (!connection) {
    connection = new Pool({
      user: "postgres",
      host: "localhost",
      database: "cyf_hotels",
      password: "tisuca66",
      port: 5432
    });
    console.log('postgres');
    
  }

  return connection;
}

module.exports = createConnection;