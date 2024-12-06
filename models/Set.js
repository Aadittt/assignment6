module.exports = (sequelize, DataTypes) => {
    const Set = sequelize.define('Set', {
      set_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      theme_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Themes',
          key: 'id',
        },
      },
    });
  
    Set.associate = (models) => {
      Set.belongsTo(models.Theme, {
        foreignKey: 'theme_id',
      });
    };
  
    return Set;
  };
  