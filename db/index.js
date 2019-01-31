const {Pool} = require('pg'); //destructuring syntax
const config = require('../secrets/db_configuration');


const pool = new Pool(config); //user, host, database, password, port, configuration options to find database

module.exports = pool;



