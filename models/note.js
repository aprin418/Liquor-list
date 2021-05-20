"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.note.belongsTo(models.user);
      models.note.belongsTo(models.faves);
    }
  }
  note.init(
    {
      content: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      faveId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "note",
    }
  );
  return note;
};
