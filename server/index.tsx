const express = require("express");
const app = express();
const multer = require("multer");

// setup multer for file upload
var storage = multer.diskStorage({
  destination: "./build",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
// serving front end build files
app.use(express.static(__dirname + "/../build"));

// route for file upload
app.post("/api/uploadfile", upload.single("myFile"), (req, res, next) => {
  console.log(req.file.originalname + " file successfully uploaded !!");
  res.sendStatus(200);
});

app.listen(3001, () => console.log("Listening on port 3000"));
