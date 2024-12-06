module.exports = (sequelize, DataTypes) => {
    const Theme = sequelize.define('Theme', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
    });
  
    Theme.associate = (models) => {
      Theme.hasMany(models.Set, {
        foreignKey: 'theme_id',
      });
    };
  
    return Theme;
  };
  