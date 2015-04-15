var
  Sequelize = require('sequelize'),
  DataType = Sequelize
  ;

module.exports = ImpressModelFactory;

function ImpressModelFactory(sequelize) {

  return sequelize.define('impress', {
    url: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    httpStatusCode: DataType.INTEGER,
    content: DataType.TEXT,
    errors: DataType.TEXT,
    warnings: DataType.TEXT,
    notices: DataType.TEXT,
    executionTime: DataType.INTEGER,
    performTime: DataType.INTEGER
  });

}


