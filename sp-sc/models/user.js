/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Sessions, {
        foreignKey: 'userId',
      })

    }
    // check if the user is admin or not
    static async checkRole(email) {
      let role;
      const adminEmails = ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'];
      if (adminEmails.includes(email)) { // here include is a method that check if the email is in the list or not
        role = 'admin';
      }
      else {
        role = 'user';
      }
      return role;
    }

  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};