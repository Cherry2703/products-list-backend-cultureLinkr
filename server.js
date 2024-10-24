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


// getting all products
app.get("/products/", async (req, res) => {
  try {
    const getProductsQuery = `SELECT * FROM products ORDER BY id;`;
    const productsArray = await db.all(getProductsQuery);
    res.status(200).send(productsArray);
  } catch (error) {
    console.error(`Error while fetching the products: ${error.message}`);
    res.status(500).send({ error: "Error while fetching the products" });
  }
});

// adding a new product
app.post("/products/", async (req, res) => {
  try {
    const { name, price, quality } = req.body;
    if (!name || typeof price !== "number" || !quality) {
      return res.send({ error: "Invalid  data" });
    }
    const newId = uuidv4();
    const addProductQuery = `
      INSERT INTO
        products (id, name, price, quality)
      VALUES
        ('${newId}','${name}',${price},'${quality}');`;
    await db.run(addProductQuery);
    const getTotalQuery = `SELECT SUM(price) as total_price FROM products;`;
    const totalMoney = await db.get(getTotalQuery);
    res.send({message: `New product added successfully, total Amount: RS: ${totalMoney.total_price}`});
  } catch (error) {
    console.error(`Error while adding the  product: ${error.message}`);
    res.status(500).send({ error: "Error while  adding the product." });
  }
});
