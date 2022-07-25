const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ohqon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  //   client.close();f
});

async function server() {
  try {
    await client.connect();
    console.log("Connection to Database established");

    const database = client.db("Conosin");
    const userCollection = database.collection("users");
    const watchCollection = database.collection("watch");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    //   get watch collection
    app.get("/watchCollection", async (req, res) => {
      const query = watchCollection.find({});
      const watches = await query.toArray();
      console.log(watches);
      res.json(watches);
    });

    //   add a watch to the collection
    app.post("/watchCollection", async (req, res) => {
      const watch = req.body;

      const result = await watchCollection.insertOne(watch);
      res.json(result);
      // console.log("watch", result);
    });

    //   get Ordered watch
    app.get("/watchCollection/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(id);
      const query = { _id: ObjectId(id) };
      const orderedWatch = await watchCollection.findOne(query);
      res.json(orderedWatch);
    });

    //   save user to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    //   Post orders to database
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // POST review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //   make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("User", user);
      const filter = { email: user.email };
      const options = { upsert: false };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //   check if the use is admin or not
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      // console.log(user);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //   GET all orders
    app.get("/orders", async (req, res) => {
      const filter = orderCollection.find({});
      const orders = await filter.toArray();
      res.json(orders);
    });

    // GET reviews

    app.get("/reviews", async (req, res) => {
      const filter = reviewCollection.find({});
      const result = await filter.toArray();
      res.json(result);
    });

    //   update order status
    app.put("/orders/:id", async (req, res) => {
      console.log("Order ID", req.params.id);
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updatedOrder = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc, options);
      res.json(result);
      console.log(`Order has been ${updatedOrder.status} successfully`, result);
    });

    // DELETE Order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query);

      const result = await orderCollection.deleteOne(query);
      res.json(result);
      console.log("Order Deleted Successfully", result);
    });

    // DELETE product form collection
    app.delete("/watchCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query);

      const result = await watchCollection.deleteOne(query);
      res.json(result);
      console.log("product Deleted Successfully", result);
    });
  } finally {
  }
}
server().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("This is Conosin Server");
});

app.listen(port, (req, res) => {
  console.log("The Port Is transmitting");
});
