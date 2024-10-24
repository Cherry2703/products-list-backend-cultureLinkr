const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "./databse.db");

let db = null;
const cors=require('cors')

let port = process.env.PORT || 3000

const {v4:uuidv4} =require('uuid')

app.use(express.json())
app.use(cors())

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.get("/products/", async (request, response) => {
    const getProductsQuery = `SELECT * FROM products ORDER BY id;`;
    const productsArray = await db.all(getProductsQuery);
    response.send(productsArray);
  });


app.post("/products/", async (request, response) => {
    const {name,price,quality} = request.body;
    const newId=uuidv4()
    const addProductQuery = `
      INSERT INTO
        products (id,name,price,quality)
      VALUES
        (
          '${newId}',
           '${name}',
           ${price},
          '${quality}'
        );`;
  
    const dbResponse = await db.run(addProductQuery);
    
    const getProductsQuery = `SELECT sum(price) as total_price FROM products;`;
    const totalMoney = await db.get(getProductsQuery);

    response.send({ message:`New product added successfully, and total Amount : RS: ${totalMoney.total_price}` });
  });