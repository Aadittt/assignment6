// Require the necessary modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs
require('dotenv').config(); // Load environment variables

// Create a Schema variable
const Schema = mongoose.Schema;

// Define the userSchema
const userSchema = new Schema({
    userName: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    loginHistory: [
        {
            dateTime: { type: String, required: true }, // Changed to String for better formatting
            userAgent: { type: String, required: true }
        }
    ]
});

// Define User as undefined initially
let User;

// Function to initialize the database connection
function initialize() {
    return new Promise((resolve, reject) => {
        const dbConnectionString = process.env.DB_CONNECTION_STRING.replace(
            '<db_password>',
            process.env.DB_PASSWORD
        );

        mongoose
            .connect(dbConnectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(() => {
                console.log("Database connection successful!");
                User = mongoose.model("User", userSchema); // Define the User model
                resolve();
            })
            .catch((err) => {
                console.error("Database connection error:", err);
                reject(err);
            });
    });
}

// Function to register a new user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        // Ensure passwords match
        if (userData.password !== userData.password2) {
            return reject("Passwords do not match");
        }

        // Hash the password before saving it
        bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
            if (err) {
                return reject("Error hashing password");
            }

            // Create a new user instance
            const newUser = new User({
                userName: userData.userName,
                password: hashedPassword, // Store the hashed password
                email: userData.email,
                loginHistory: []
            });

            // Save the user to the database
            newUser
                .save()
                .then(() => resolve("User successfully registered!"))
                .catch((err) => {
                    if (err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject(`Error creating the user: ${err.message}`);
                    }
                });
        });
    });
}

// Function to check user credentials and update login history
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        // Find the user by userName
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    return reject(`Unable to find user: ${userData.userName}`);
                }

                // Compare the password using bcrypt
                bcrypt.compare(userData.password, user.password, (err, isMatch) => {
                    if (err) {
                        return reject(`Error comparing passwords: ${err.message}`);
                    }

                    if (!isMatch) {
                        return reject(`Incorrect Password for user: ${userData.userName}`);
                    }

                    // Update login history
                    if (user.loginHistory.length === 8) {
                        user.loginHistory.pop(); // Remove the oldest entry
                    }
                    user.loginHistory.unshift({
                        dateTime: new Date().toString(),
                        userAgent: userData.userAgent
                    });

                    // Save updated login history to the database
                    user
                        .save()
                        .then(() => resolve(user))
                        .catch((err) =>
                            reject(`Error updating login history for user: ${err.message}`)
                        );
                });
            })
            .catch((err) => reject(`Error finding user: ${err.message}`));
    });
}

// Export the necessary modules and functions
module.exports = {
    initialize,
    registerUser,
    checkUser
};
