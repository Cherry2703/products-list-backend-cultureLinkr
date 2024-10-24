// const express = require("express");
// const path = require("path");

// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");
// const app = express();

// const dbPath = path.join(__dirname, "./databse.db");

// let db = null;
// const cors=require('cors')

// let port = process.env.PORT || 3000

// const {v4:uuidv4} =require('uuid')

// app.use(express.json())
// app.use(cors())

// const initializeDBAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(port, () => {
//       console.log(`Server Running at http://localhost:${port}/`);
//     });
//   } catch (e) {
//     console.log(`DB Error: ${e.message}`);
//     process.exit(1);
//   }
// };

// initializeDBAndServer();


// app.get("/products/", async (request, response) => {
//     const getProductsQuery = `SELECT * FROM products ORDER BY id;`;
//     const productsArray = await db.all(getProductsQuery);
//     response.send(productsArray);
//   });


// app.post("/products/", async (request, response) => {
//     const {name,price,quality} = request.body;
//     const newId=uuidv4()
//     const addProductQuery = `
//       INSERT INTO
//         products (id,name,price,quality)
//       VALUES
//         (
//           '${newId}',
//            '${name}',
//            ${price},
//           '${quality}'
//         );`;
  
//     const dbResponse = await db.run(addProductQuery);
    
//     const getProductsQuery = `SELECT sum(price) as total_price FROM products;`;
//     const totalMoney = await db.get(getProductsQuery);

//     response.send({ message:`New product added successfully, and total Amount : RS: ${totalMoney.total_price}` });
//   });



const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const dbPath = path.join(__dirname, "./database.db");

let db = null;
let port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get all products
app.get("/products/", async (req, res) => {
  try {
    const getProductsQuery = `SELECT * FROM products ORDER BY id;`;
    const productsArray = await db.all(getProductsQuery);
    res.status(200).send(productsArray);
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    res.status(500).send({ error: "Error fetching products." });
  }
});

// Add new product and calculate total amount
app.post("/products/", async (req, res) => {
  try {
    const { name, price, quality } = req.body;

    // Input validation
    if (!name || typeof price !== "number" || !quality) {
      return res.status(400).send({ error: "Invalid input data" });
    }

    const newId = uuidv4();
    const addProductQuery = `
      INSERT INTO
        products (id, name, price, quality)
      VALUES
        (?, ?, ?, ?);`;

    // Using parameterized queries to prevent SQL injection
    await db.run(addProductQuery, [newId, name, price, quality]);

    const getTotalQuery = `SELECT SUM(price) as total_price FROM products;`;
    const totalMoney = await db.get(getTotalQuery);

    res.status(201).send({
      message: `New product added successfully, total Amount: RS: ${totalMoney.total_price}`,
    });
  } catch (error) {
    console.error(`Error adding product: ${error.message}`);
    res.status(500).send({ error: "Error adding product." });
  }
});
