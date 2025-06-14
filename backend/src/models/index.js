const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'sqlite:./test.db',
  {
    dialect: process.env.DATABASE_URL?.startsWith('sqlite') ? 'sqlite' : 'postgres',
    storage: process.env.DATABASE_URL?.startsWith('sqlite') ? './test.db' : undefined,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const models = {
  User: require('./User')(sequelize, Sequelize.DataTypes),
  Product: require('./Product')(sequelize, Sequelize.DataTypes),
  Supplier: require('./Supplier')(sequelize, Sequelize.DataTypes),
  Category: require('./Category')(sequelize, Sequelize.DataTypes),
  Order: require('./Order')(sequelize, Sequelize.DataTypes),
  OrderItem: require('./OrderItem')(sequelize, Sequelize.DataTypes),
  Quote: require('./Quote')(sequelize, Sequelize.DataTypes),
  Review: require('./Review')(sequelize, Sequelize.DataTypes),
  PixPayment: require('./PixPayment')(sequelize, Sequelize.DataTypes),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
