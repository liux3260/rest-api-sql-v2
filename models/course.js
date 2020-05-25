'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    title: {
      type: Sequelize.STRING,
      allowNull:false,
      validate: {
          notEmpty: {
              msg: '"Title" is required'
            },
          notNull: {
            msg: '"Title" is required'
          }
  
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull:false,
      validate: {
          notEmpty: {
              msg: '"Description" is required'
            },
          notNull: {
            msg: '"Description" is required'
          }
  
      }},
    estimatedTime: Sequelize.STRING,
    materialsNeeded:Sequelize.STRING,
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
        validate: {
          notNull: {
            msg: '"UserId" is required'
          }
        }
      },
    });
  };

  Course.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());
  
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }

  return Course;
};