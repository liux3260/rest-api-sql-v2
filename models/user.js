'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type: Sequelize.STRING,
      allowNull:false,
      validate: {
          notEmpty: {
              msg: '"First Name" is required'
            },
          notNull: {
            msg: '"First Name" is required'
          }
  
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull:false,
      validate: {
          notEmpty: {
              msg: '"Last Name" is required'
            },
          notNull: {
            msg: '"Last Name" is required'
          }
  
      }},
    emailAddress: {
        type: Sequelize.STRING,
        allowNull:false,
        validate: {
            notEmpty: {
                msg: '"Email Address" is required'
              },
            isEmail:{
              msg: 'Please provide a valid email address'
            },
            notNull: {
              msg: '"Email Address" is required'
            }
  
        },
        unique:{
          msg: 'The email address has been created'
        },
      },
    password:{
        type: Sequelize.STRING,
        allowNull:false,
        validate: {
            notEmpty: {
                msg: '"Password" is required'
              },
            notNull: {
              msg: '"Password" is required'
            }
    
        }},
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course,{
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

  User.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());
  
    delete values.password;
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }

  return User;
};