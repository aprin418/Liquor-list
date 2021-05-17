"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class faves extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.faves.belongsTo(models.user);
    }
  }
  faves.init(
    {
      name: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "faves",
    }
  );
  return faves;
};
