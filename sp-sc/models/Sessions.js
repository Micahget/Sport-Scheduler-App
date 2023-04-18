/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    // method to create sessions
    static addSession({ date, place, playerName, totalPlayers }) {
      return this.create({
        date: date,
        place: place,
        playerName: playerName,
        totalPlayers: totalPlayers
      })
    }

    // method to get all sessions 
    static getSessions() {
      return this.findAll();
    }
  }
  session.init({
    date: DataTypes.DATEONLY,
    place: DataTypes.STRING,
    playerName: DataTypes.STRING,
    totalPlayers: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sessions',
  });
  return session;
};