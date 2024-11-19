require('dotenv').config();  // Load environment variables from .env

const { Sequelize, Op } = require('sequelize');  // Import Sequelize and Op for operations

// Create Sequelize instance using values from .env file
const sequelize = new Sequelize(
  process.env.DB_DATABASE,  // Database name
  process.env.DB_USER,      // Database user
  process.env.DB_PASSWORD,  // Database password
  {
    host: process.env.DB_HOST,  // Database host
    dialect: 'postgres',       // PostgreSQL dialect
    logging: false,            // Disable SQL query logging
    define: {
      timestamps: false        // Disable createdAt and updatedAt columns
    },
    dialectOptions: {
      ssl: {
        require: true,               // Enforce SSL connection
        rejectUnauthorized: false,   // Allow self-signed certificates
        sslmode: 'require'           // Explicitly require SSL mode
      }
    }
  }
);

// Define the Theme model
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true  // Automatically increment the ID for each new theme
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Define the Set model
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  year: {
    type: Sequelize.INTEGER
  },
  num_parts: {
    type: Sequelize.INTEGER
  },
  theme_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Theme,
      key: 'id'
    }
  },
  img_url: {
    type: Sequelize.STRING
  }
});

// Define the association between Set and Theme (One-to-Many relationship)
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize the database connection
const initialize = async () => {
  try {
    await sequelize.sync();  // Sync Sequelize models with the database
    console.log('Database synchronized successfully.');
  } catch (err) {
    console.error('Error syncing models:', err);
    throw err;
  }
};

// Function to fetch all sets (with optional pagination)
const getAllSets = async (limit = 10, offset = 0) => {
  try {
    const sets = await Set.findAll({
      include: [Theme],  // Include the associated Theme model
      limit,             // Limit the number of results
      offset,            // Skip the first `offset` results
    });
    return sets;
  } catch (err) {
    console.error('Error retrieving sets:', err);
    throw new Error('Unable to retrieve sets');
  }
};

// Function to fetch a set by its set_num
const getSetByNum = async (setNum) => {
  try {
    const set = await Set.findOne({
      where: { set_num: setNum },
      include: [Theme],  // Include Theme data
    });
    if (!set) {
      throw new Error('Unable to find requested set');
    }
    return set;
  } catch (err) {
    console.error('Error retrieving set by num:', err);
    throw new Error('Unable to find requested set');
  }
};

// Function to fetch sets by theme (case-insensitive search)
const getSetsByTheme = async (theme) => {
  try {
    const sets = await Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': {   // Search for sets with a theme name that matches the theme parameter
          [Op.iLike]: `%${theme}%`
        }
      }
    });
    return sets.length > 0 ? sets : []; // Return an empty array if no sets are found
  } catch (err) {
    console.error('Error retrieving sets by theme:', err);
    throw new Error('Unable to find requested sets');
  }
};

// Function to create a new Lego set
const createSet = async ({ name, year, num_parts, img_url, theme_id, set_num }) => {
  try {
    const newSet = await Set.create({
      name,
      year,
      num_parts,
      img_url,
      theme_id,
      set_num
    });
    return newSet;
  } catch (err) {
    console.error('Error creating new set:', err);
    throw new Error('Unable to create new set');
  }
};

// Function to get all themes (to use in add set form)
const getAllThemes = async () => {
  try {
    const themes = await Theme.findAll();
    return themes;
  } catch (err) {
    console.error('Error retrieving themes:', err);
    throw new Error('Unable to retrieve themes');
  }
};

// Export functions and models
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  createSet,
  getAllThemes,
  sequelize, 
  Set, 
  Theme
};
