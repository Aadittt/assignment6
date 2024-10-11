/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aaron Kerubin Racelis  Student ID: 120388236 Date: October 11,2024
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/


const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; // assign a port
// Enable pretty print for JSON responses
app.set('json spaces', 2); 
// Route: GET "/"
/*app.get('/', (req, res) => {
    res.send('Assignment 2: Aaron Kerubin Racelis - 120388236');
});
*/
// Serve static files from the 'public' directory
//app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
require('pg');
const Sequelize = require('sequelize');

//app.use(express.static('public')); 
// Serve the HTML file from the 'views' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});


// Route: GET "/about"
app.get('/about', (req, res) => {
    // Construct the absolute path to "about.html"
    const aboutFilePath = path.join(__dirname, 'views', 'about.html');
    
    // Send the "about.html" file
    res.sendFile(aboutFilePath, (err) => {
        if (err) {
            res.status(500).send('Error loading about page');
        }
    });
});

// Route: GET "/lego/sets"
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme; // Get the theme from the query parameter

    try {
        if (theme) {
            // If a theme is specified, filter by that theme
            legoData.getSetsByTheme(theme)
                .then(sets => {
                    if (sets.length > 0) {
                        res.json(sets);  // Return filtered sets as JSON
                    } else {
                        res.status(404).json({ error: `No sets found with theme "${theme}"` });
                    }
                })
                .catch(error => res.status(404).json({ error: error.message })); // Handle any error in filtering
        } else {
            // If no theme is provided, retrieve and return all LEGO sets
            legoData.getAllSets() // Call to get all sets
                .then(sets => {
                    res.json(sets);  // Return all LEGO sets as JSON
                })
                .catch(error => res.status(404).json({ error: 'Error retrieving all LEGO sets: ' + error.message }));
        }
    } catch (error) {
        // Catch any unexpected errors and return a 404 status code
        res.status(404).json({ error: 'Error retrieving LEGO data: ' + error.message });
    }
});


// Route: GET "/lego/sets/:setNum"
app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum; // Extract the set number from the URL
    legoData.getSetByNum(setNum)
        .then(set => res.json(set))   
        .catch(error => res.status(404).send('Set not found')); // Handle errors
});

// Custom 404 Error Handler
app.use((req, res, next) => {
    res.status(404); // Set the response status to 404
    const errorFilePath = path.join(__dirname, 'views', '404.html'); // Construct the path to the 404.html file
    res.sendFile(errorFilePath, (err) => {
        if (err) {
            console.error('Error sending 404 page:', err);
            res.status(500).send('Internal Server Error'); // Handle any errors in sending the file
        }
    });
});


// This is called to Initialize Lego data and start the server
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
