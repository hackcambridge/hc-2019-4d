'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('review-skips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'id',
          deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        unique: 'adminIdHackerApplicationIdCompositeUnique',
      },
      hackerApplicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hackers-applications',
          key: 'id',
          deferrable:  Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        unique: 'adminIdHackerApplicationIdCompositeUnique'
      }
    },
    {
      uniqueKeys: {
        adminIdHackerApplicationIdCompositeUnique: {
            fields: ['adminId', 'hackerApplicationId']
        }
      }
    })
  ,

  down: (queryInterface, _Sequelize) => 
    queryInterface.dropTable('review-skips')
};
