// legoSets.js

// Import the required data
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// Initialize the sets array
let sets = [];

// Function to initialize the sets array with theme names
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            sets = []; // Clear the array in case it was filled before

            setData.forEach(set => {
                // Find the corresponding theme name for the set's theme_id
                const theme = themeData.find(t => t.id === set.theme_id);
                // Create a new set object with the theme property
                const setWithTheme = {
                    ...set, // Spread the original set data
                    theme: theme ? theme.name : "Unknown" // Add the theme name or "Unknown" if not found
                };
                // Add the new object to the sets array
                sets.push(setWithTheme);
            });

            resolve(); // Resolve the promise without any data (operation complete)
        } catch (error) {
            reject(`Error during initialization: ${error.message}`); // Reject if any error occurs
        }
    });
}

// Function to return all sets
function getAllSets() {
    return new Promise((resolve, reject) => {
        try {
            resolve(sets); // Resolve with the complete sets array
        } catch (error) {
            reject(`Error fetching all sets: ${error.message}`); // Reject in case of an error
        }
    });
}

// Function to get a set by its set number
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        try {
            const foundSet = sets.find(set => set.set_num === setNum);

            if (foundSet) {
                resolve(foundSet); // Resolve with the found set
            } else {
                reject(`Set with number ${setNum} not found`); // Reject if no set is found
            }
        } catch (error) {
            reject(`Error fetching set by number: ${error.message}`); // Reject in case of an error
        }
    });
}

// Function to get sets by theme (case-insensitive partial match)
async function getSetsByTheme(theme) {
    try {
        const matchedSets = sets.filter(set => 
            set.theme.toLowerCase().includes(theme.toLowerCase())
        );

        if (matchedSets.length > 0) {
            return matchedSets;  // Return the filtered sets
        } else {
            throw new Error(`No sets found with theme "${theme}"`);  // Throw an error if no sets found
        }
    } catch (error) {
        throw new Error(`Error fetching sets by theme: ${error.message}`);
    }
}

// Export the functions as a module
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };

initialize().then(() => {
    // Test getAllSets()
    getAllSets().then(sets => console.log("All Sets:", sets));

    // Test getSetByNum()
    getSetByNum("001-1").then(set => console.log("Set with number 001-1:", set))
        .catch(error => console.error(error));

    // Test getSetsByTheme()
    getSetsByTheme("tech").then(sets => console.log("Sets with theme 'tech':", sets))
        .catch(error => console.error(error));
}).catch(error => console.error(error));
