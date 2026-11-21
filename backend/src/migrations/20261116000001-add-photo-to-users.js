'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Path relatif foto profil, contoh: /uploads/avatars/12-1731744000000-ab12cd34ef56.jpg
    await queryInterface.addColumn('users', 'photo_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'photo_url');
  },
};
