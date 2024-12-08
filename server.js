/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aadit Magar  Student ID: 108518234\\ Date:12/8/2024
*
*  Published URL: 
********************************************************************************/

require('dotenv').config();
const authData = require('./modules/auth-service');
const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');
const clientSessions = require('client-sessions');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
}));

function ensureLogin(req, res, next) {
    if (!req.session.userName) {
    }
    next();
}

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: '', userName: '' });
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '', successMessage: '', userName: '' });
});

app.post('/register', (req, res) => {
    const userData = req.body;
    authData.registerUser(userData).then(() => {
        res.render('register', { successMessage: 'User created. You can now log in.', userName: userData.userName });
    }).catch((err) => {
        res.render('register', { errorMessage: err.message, userName: userData.userName });
    });
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');

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

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user });
});

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

app.use((req, res) => {
    res.status(404).render('404', { message: "The page you are looking for does not exist." });
});
