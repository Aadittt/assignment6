/*
-- ***********************
-- Name: Aaron Racelis
-- ID: 120388236
-- Date: November 23, 2024
-- Purpose: Lab 9 DBS311
-- ***********************
*/

// mongodb+srv://Longos4015:Longos4015@cluster0.3khep.mongodb.net/inventory

use ('inventory');

//Q1: Query to return name and price of each product in the inventory database.  
db.products.find
(
    {},
    {name: 1, price: 1, _id: 0 }
);

//Q2: Query to return name and price for products of type accessory in the inventory database.
db.products.find
(
    {type: "accessory"},
    {name: 1, price: 1, _id: 0 }
);

//Q3: Query to return name and price for products with price between $13 and $19 (Values 13 and 19 are included).
db.products.find
(
    {price: {$gte: 13, $lte: 19}},
    {name: 1, price: 1, _id: 0 }
); 

//Q4: Query to return id, name, price, and type for products that are not of type accessory.
db.products.find
(
    {type: {$ne: "accessory"}},
    {name: 1, price: 1, _id: 1, type: 1}
); 

//Q5: Query to return id, name, price, and type for products with type accessory or service.
db.products.find
(
    {$or: [{type: "accessory"},{type: "service"}]},
    {name: 1, price: 1, _id: 1, type: 1}
); 

//Q6: Query to return id, name, price, and type for products that do have the type key.
db.products.find
(
    {type: {$exists: 1}},
    {name: 1, price: 1, _id: 1, type: 1}
); 

//Q7: Query to return id, name, price, and type for products that their type is both accessory and case.
db.products.find(
    {$and: [
        
            {type: "accessory"},
            {type: "case"}
        ]},
        {name: 1, price: 1, _id: 1, type: 1}
);

//Q8
/*
This is based on my personal experience...

The flexibility of MongoDB and its handling of dynamic data have made it much easier for me 
to work with so far. Its design feels more user-friendly compared to Oracle's more structured approach.
While I currently prefer MongoDB, I can understand how Oracle might be better suited for handling larger
queries. I believe both have their advantages depending on the task, but as I continue working with MongoDB,
I may eventually look back at Oracle and find it simpler.
*/