const express = require("express");
const mongoose = require("mongoose");

const fileRoutes = require("./router/file");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/file_app")
  .then(() => console.log("DB connection established"))
  .catch((err) => console.log("error connecting to file server", err));

app.use(express.json());
app.use(fileRoutes);

const port = 8000;

app.listen(port, () => {
  console.log("server is runnind at the" + port);
});
