const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');
const Sequelize = require('sequelize');
require('pg');
require('dotenv').config();  // Ensure your environment variables are loaded

const app = express();
const PORT = process.env.PORT || 8080;


// Add this middleware to parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('json spaces', 2); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage
app.get('/', (req, res) => {
  res.render('home', { page: '/' });
});

// Serve the about page
app.get('/about', (req, res) => {
  res.render('about', { page: '/about' });
});

// Route: GET "/lego/sets"
app.get('/lego/sets', async (req, res) => {
  const theme = req.query.theme;  // Get the theme from query string (if any)

  try {
    let sets;

    if (theme) {
      // If a theme is provided, get sets by theme
      sets = await legoData.getSetsByTheme(theme);
    } else {
      // If no theme is provided, get all sets
      sets = await legoData.getAllSets();
    }

    // Render the 'sets' view with the sets data and selected theme
    res.render('sets', { sets, page: '/lego/sets', theme });
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).render('404', { message: 'Error retrieving LEGO data: ' + error.message });
  }
});

// Route: GET "/lego/sets/:setNum"
app.get('/lego/sets/:setNum', async (req, res) => {
  const setNum = req.params.setNum;  // Get the set number from URL parameter

  try {
    const set = await legoData.getSetByNum(setNum);  // Fetch the set by its set number
    res.render('set', { set });  // Render the set details page
  } catch (error) {
    res.status(404).render('404', { message: `No set found with the number "${setNum}".` });
  }
});


 
// Serve the add set form
app.get('/lego/addSet', async (req, res) => {
// app.get('/lego/addSet', (req, res) => {
  try {
   const themes = await legoData.getAllThemes(); // Fetch themes to display in the form
    res.render('addSet', { themes:themes }); // Pass the themes to the form
  } catch (err) {
    console.error('Error loading themes for form:', err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

// Handle the form submission to add a new set
app.post('/lego/addSet', async (req, res) => {
  const { name, year, num_parts, img_url, theme_id, set_num } = req.body;

  try {
    // Validate the incoming data (optional but recommended)
    if (!name || !year || !num_parts || !img_url || !theme_id || !set_num) {
      return res.render('500', { message: 'All fields are required.' });
    }

    // Create a new set in the database using the provided form data
    await legoData.addSet({
      name,
      year,
      num_parts,
      img_url,
      theme_id,
      set_num
    });

    // Redirect to the sets page after successful addition
    res.redirect('/lego/sets');
  } catch (err) {
    console.error('Error adding new set:', err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});

app.get('/lego/editSet/:set_num', async (req, res) => {
  try {
    const setNum = req.params.set_num;
    const set = await legoData.getSetByNum(setNum); // Make sure you are retrieving the set correctly
    const themes = await legoData.getAllThemes();  // Fetch themes for the select dropdown
    res.render('editSet', { set, themes }); // Render the correct view here
  } catch (err) {
    console.error("Error fetching set:", err);
    res.status(500).send("Error fetching the set details.");
  }
});


// POST /lego/editSet
app.post('/lego/editSet', (req, res) => {
  const setNum = req.body.set_num;  // Retrieve set number from the form
  const setData = req.body;  // Get the updated set data from the form

  // Use the editSet function to update the set
  legoData.editSet(setNum, setData)
      .then(() => {
          res.redirect('/lego/sets');  // Redirect to the sets list page upon success
      })
      .catch((err) => {
          // Render the 500 error page if something goes wrong
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
      });
});

app.get('/lego/deleteSet/:set_num', async (req, res) => {
  try {
    const setNum = req.params.set_num;  // Get the set_num from the URL parameter
    await legoData.deleteSet(setNum);  // Call the deleteSet function
    res.redirect('/lego/sets');  // Redirect the user to the sets page after successful deletion
  } catch (err) {
    console.error('Error deleting set:', err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });  // Render the 500 page with the error message
  }
});

// Initialize Lego data and start the server
legoData.initialize()
  .then(() => {
    console.log('Lego data initialized successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error initializing Lego data:', error);
  });
// Handle undefined routes
app.use((req, res) => {
  res.status(404).render('404', { message: "The page you are looking for does not exist." });
});
