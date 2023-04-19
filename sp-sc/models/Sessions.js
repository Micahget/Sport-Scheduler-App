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
    static addSession({ date, place, playerName, totalPlayers, sport }) {
      return this.create({
        date: date,
        place: place,
        playerName: playerName,
        totalPlayers: totalPlayers,
        sport: sport,
      })
    }

    // method to get all sessions 
    static getEverySessions() {
      return this.findAll();
    }
    // method to get as session by its sport name
    static getSessionsBySport(sport) {
      return this.findAll({
        where: {
          sport: sport
        }
      })
    }

    // method to delete sessions by its sport
    static deleteSessionsBySport(sport) {
      return this.destroy({
        where: {
          sport: sport
        }
      })
    }

    // method to delete sessions by its id
    static deleteSessionById(id) {
      return this.destroy({
        where: {
          id: id
        }
      })
    }

  }
  session.init({
    date: DataTypes.DATEONLY,
    place: DataTypes.STRING,
    playerName: DataTypes.STRING,
    totalPlayers: DataTypes.INTEGER,
    sport: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sessions',
  });
  return session;
};