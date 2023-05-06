/* eslint-disable */
'use strict';
const { Model, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      session.belongsTo(models.UserAccount, {
        foreignKey: 'userId',
      })
    }
    // method to create sessions
    static addSession({ date, place, playerName, totalPlayers, sport, userId }) {
      return this.create({
        date: date,
        place: place,
        playerName: playerName,
        totalPlayers: totalPlayers,
        sport: sport,
        userId: userId,
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

    // method to get a session by its id
    static getSessionById(id) {
      return this.findOne({
        where: {
          id: id
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


    // method to update sessions by its id
    static updateSessionById(id, { date, place, playerName, totalPlayers, sport }) {
      return this.update({
        date: date,
        place: place,
        playerName: playerName,
        totalPlayers: totalPlayers,
        sport: sport,
      }, {
        where: {
          id: id
        }
      })
    }

    // update only the name of the player
    static updatePlayerNameById(id, playerName) {
      return this.update({
        playerName: playerName
      }, {
        where: {
          id: id
        }
      })
    }

    // extract active sessions
    static getActiveSessions(sport) {
      return this.findAll({
        where: {
          date: {
            [Op.gt]: new Date(), // after today
          },
          sport: sport
        }
      })
    }

    // extract past sessions
    static getPastSessions(sport) {
      return this.findAll({
        where: {
          date: {
            [Op.lt]: new Date(), // before today
          },
          sport: sport
        }
      })
    }

    // method to extract the sessions of a user
    static getSessionsByUserId(userId, sport) {
      return this.findAll({
        where: {
          userId: userId,
          sport: sport

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