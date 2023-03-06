const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("../" + path.join(__dirname, "public")));

app.use(bodyParser.text()); // Add this middleware to parse the request body as text

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Define your routes

// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });

app.post("/save_graph", (req, res) => {
  // console.log("req data", req);
  // Get the file data from the request

  const fileData = req.body;

  // Write the file to the public folder
  fs.writeFile("./storage/graphDump.ttl", fileData, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving file");
    } else {
      res.send("File saved successfully");
    }
  });
});

app.get("/load_graph", (req, res) => {
  let workingDir = path.join(__dirname, "..", "/storage/graphDump.ttl");

  console.log(workingDir);

  // Send the file to the client
  res.sendFile(workingDir, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending file");
    }
  });
});

app.get("/files/:filename", (req, res) => {
  let filename = req.params.filename;
  let workingDir = path.join(__dirname, "..", "/storage/", filename);

  console.log(workingDir);

  // Send the file to the client
  res.sendFile(workingDir, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending file");
    }
  });
});

app.listen(3001, () => {
  console.log("Server started on port 3000");
});
