"use strict";
const bcrypt = require("bcrypt");

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [1, 99],
            msg: "Name must be between 1 and 99 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            // does a boolean check
            msg: "Invalid email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [8, 99],
            msg: "Password must be between 8 and 99 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "user",
    }
  );

  user.addHook("beforeCreate", (pendingUser) => {
    // pendingUser is user object that gets passed to DB
    // Bcrypt is going to hash the password
    let hash = bcrypt.hashSync(pendingUser.password, 12); // hash 12 times
    pendingUser.password = hash; // this will go to the DB
  });

  user.prototype.validPassword = function (typedPassword) {
    let isCorrectPassword = bcrypt.compareSync(typedPassword, this.password); // check to see if password is correct.

    return isCorrectPassword;
  };

  user.prototype.toJSON = function () {
    let userData = this.get();
    delete userData.password; // it doesn't delete password from database, only removes it.

    return userData;
  };

  return user; // add functions above
};
