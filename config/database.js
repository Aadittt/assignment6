const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure environment variables are loaded

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: 'postgres',
    logging: false, // Disable logging for cleaner output (optional)
  }
);

module.exports = sequelize;
