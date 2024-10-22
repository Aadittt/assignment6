/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aaron Kerubin Racelis  Student ID: 120388236 Date: October 22,2024
*
*  Published URL: 
*
********************************************************************************/


const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; // assign a port

// Set view engine to ejs
app.set('view engine', 'ejs');

// Enable pretty print for JSON responses
app.set('json spaces', 2); 
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
require('pg');
const Sequelize = require('sequelize');

 
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

// Route: GET "/lego/sets"
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;

    try {
        if (theme) {
            legoData.getSetsByTheme(theme)
                .then(sets => {
                    if (sets.length > 0) {
                          // Pass the page variable to the view
                          res.render('sets', { sets, page: '/lego/sets' });
                    } else {
                        res.status(404).render('404', { message: `No sets found for the theme "${theme}".` });
                    }
                })
                .catch(error => res.status(404).render('404', { message: error.message }));
        } else {
            legoData.getAllSets()
                .then(sets => {
                   // Pass the page variable to the view
                   res.render('sets', { sets, page: '/lego/sets' });
                })
                .catch(error => res.status(404).render('404', { message: 'Error retrieving all LEGO sets: ' + error.message }));
        }
    } catch (error) {
        res.status(404).render('404', { message: 'Error retrieving LEGO data: ' + error.message });
    }
});

// Route: GET "/lego/sets/:setNum"
app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum;
    legoData.getSetByNum(setNum)
        .then(set => res.render('set', { set }))
        .catch(error => res.status(404).render('404', { message: `No set found with the number "${setNum}".` }));
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).render('404', { message: "The page you are looking for does not exist." });
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
