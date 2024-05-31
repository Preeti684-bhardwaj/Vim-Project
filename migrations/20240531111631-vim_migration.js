'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email", {
      type: Sequelize.STRING,
      // allowNull: false,
      validate: {
        notEmpty: {
          msg: "email is Mandatory",
        }
      }
    });

    await queryInterface.addColumn("users", "resetOtp", {
      type: Sequelize.STRING,
      // allowNull: false
    });
    await queryInterface.addColumn("users", "resetOtpExpire", {
      type: Sequelize.STRING,
      // allowNull: false
    });
    await queryInterface.addColumn("users", "agreePolicy", {
      type: Sequelize.BOOLEAN,
      // allowNull: false,
      default:false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
