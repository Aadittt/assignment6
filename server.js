/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aaron Kerubin Racelis  Student ID: 120388236 Date: November 21, 2024
*
*  Published URL: web322assignment5.vercel.app
*
********************************************************************************/

require('dotenv').config(); // Load environment variables
const authData = require('./modules/auth-service');
const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');
const clientSessions = require('client-sessions'); // Required for session management
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Configure the client-session middleware
app.use(clientSessions({
    cookieName: 'session', // Name of the cookie to store the session
    secret: process.env.SESSION_SECRET, // Secret for encrypting the session
    duration: 30 * 60 * 1000, // Session duration (30 minutes in milliseconds)
    activeDuration: 5 * 60 * 1000, // After 5 minutes of inactivity, the session will be refreshed
    httpOnly: true, // Ensures the cookie is sent only via HTTP(S), not accessible by JavaScript
    secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
}));

// Helper middleware to ensure the user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.userName) {
  //    return res.redirect('/login'); // Redirect to login if not logged in
  }
  next(); // Proceed to the next middleware or route handler if logged in
}

// Middleware to make the session object available to all templates
app.use((req, res, next) => {
    res.locals.session = req.session; // Make the session object available in templates
    next();
});


// Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('home', { page: '/' });
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;
        const sets = theme
            ? await legoData.getSetsByTheme(theme)
            : await legoData.getAllSets();
        res.render('sets', { sets, page: '/lego/sets', theme });
    } catch (error) {
        res.status(500).render('500', { message: `Error retrieving LEGO data: ${error.message}` });
    }
});

app.get('/lego/sets/:setNum', async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.setNum);
        res.render('set', { set });
    } catch (error) {
        res.status(404).render('404', { message: `No set found with the number "${req.params.setNum}".` });
    }
});

app.get('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes });
    } catch (err) {
        res.render('500', { message: `Error loading themes: ${err.message}` });
    }
});

app.post('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        const { name, year, num_parts, img_url, theme_id, set_num } = req.body;
        if (!name || !year || !num_parts || !img_url || !theme_id || !set_num) {
            throw new Error('All fields are required.');
        }
        await legoData.addSet({ name, year, num_parts, img_url, theme_id, set_num });
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error adding set: ${err.message}` });
    }
});

app.get('/lego/editSet/:set_num', ensureLogin, async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num);
        const themes = await legoData.getAllThemes();
        res.render('editSet', { set, themes });
    } catch (err) {
        res.status(500).render('500', { message: `Error fetching set details: ${err.message}` });
    }
});

app.post('/lego/editSet', ensureLogin, async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error updating set: ${err.message}` });
    }
});

app.get('/lego/deleteSet/:set_num', ensureLogin, async (req, res) => {
    try {
        await legoData.deleteSet(req.params.set_num);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error deleting set: ${err.message}` });
    }
});

// New Routes for User Authentication

// GET /login - renders the login page
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: '', userName: '' });
});

// GET /register - renders the register page
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '', successMessage: '', userName: '' });
});

// POST /register - handles user registration
app.post('/register', (req, res) => {
    const userData = req.body;
    authData.registerUser(userData).then(() => {
        // On success, pass successMessage to render view
        res.render('register', { successMessage: 'User created. You can now log in.', userName: userData.userName });
    }).catch((err) => {
        // On error, pass errorMessage to render view
        res.render('register', { errorMessage: err.message, userName: userData.userName });
    });
});

// POST /login - handles user login
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent'); // Store User-Agent in body

    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});

// GET /logout - resets the session and redirects to the home page
app.get('/logout', (req, res) => {
    req.session.reset(); // Reset the session
    res.redirect('/'); // Redirect to home page
});



// GET /userHistory - renders the userHistory page (protected by ensureLogin)
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user }); // Pass session user data to the view
});

// Initialize legoData and authData, then start the server
legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Unable to start the server: ${err.message}`);
    });

// Handle undefined routes
app.use((req, res) => {
    res.status(404).render('404', { message: "The page you are looking for does not exist." });
});
