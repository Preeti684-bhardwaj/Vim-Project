'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn("users", "email", {
    //   type: Sequelize.STRING,
    //   // allowNull: false,
    //   validate: {
    //     notEmpty: {
    //       msg: "email is Mandatory",
    //     }
    //   }
    // });

    // await queryInterface.addColumn("users", "resetOtp", {
    //   type: Sequelize.STRING,
    //   // allowNull: false
    // });
    // await queryInterface.addColumn("users", "resetOtpExpire", {
    //   type: Sequelize.STRING,
    //   // allowNull: false
    // });
    // await queryInterface.addColumn("users", "agreePolicy", {
    //   type: Sequelize.BOOLEAN,
    //   // allowNull: false,
    //   default: false
    // });

    await queryInterface.addColumn("users", "isVerified", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    // Adding new column to music model
    await queryInterface.addColumn("music", "fileName", {
      type: Sequelize.STRING,
      // allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("users", "email");
    await queryInterface.removeColumn("users", "resetOtp");
    await queryInterface.removeColumn("users", "resetOtpExpire");
    await queryInterface.removeColumn("users", "agreePolicy");

    // Removing the new column from music model
    await queryInterface.removeColumn("music", "fileName");
  }
};
