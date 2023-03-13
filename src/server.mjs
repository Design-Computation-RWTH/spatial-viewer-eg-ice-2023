import express from "express";
import oxigraph from "oxigraph";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import rdf from "@rdfjs/data-model";
import { Readable } from "readable-stream";
import { serializers } from "@rdfjs/formats-common";

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create an Express application
const app = express();

// Serve static files from the 'public' directory
app.use(express.static("../" + path.join(__dirname, "public")));

// Middleware to parse the request body as text only for the 'save_graph' route
const saveGraphMiddleware = (req, res, next) => {
  if (req.path === "/save_graph") {
    bodyParser.text()(req, res, next);
  } else {
    bodyParser.urlencoded({ extended: false });
    bodyParser.json();
    next();
  }
};

// Use the middleware to parse the request body
app.use(saveGraphMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set the CORS headers for all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Handle the 'save_graph' route
app.post("/save_graph", (req, res) => {
  const fileData = req.body;

  // Write the file to the 'storage' directory
  fs.writeFile("./storage/graphDump.ttl", fileData, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving file");
    } else {
      res.send("File saved successfully");
    }
  });
});

// Handle the 'load_graph' route
app.get("/load_graph", (req, res) => {
  const filePath = path.join(__dirname, "..", "/storage/graphDump.ttl");

  // Send the file to the client
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending file");
    }
  });
});

// Handle the 'sparql' route
app.post("/sparql", async (req, res) => {
  const query = req.body.query;
  const store = new oxigraph.Store();

  // Load the data from the 'storage' directory
  const dataLoaded = await new Promise((resolve, reject) => {
    fs.readFile("./storage/graphDump.ttl", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  // Load the data into the store and execute the query
  await store.load(
    //@ts-ignore
    dataLoaded,
    "text/turtle",
    "http://example.com/",
    oxigraph.defaultGraph()
  );
  const result = await store.query(query);

  // Convert the result to JSON and send it to the client
  await convertToJSONContent(res, result);
});

// Route to serve files
app.get("/files/:filename", (req, res) => {
  // Get the filename parameter from the URL
  let filename = req.params.filename;
  // Get the absolute path of the file
  let workingDir = path.join(__dirname, "..", "/storage/", filename);

  // Send the file to the client
  res.sendFile(workingDir, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending file");
    }
  });
});

// Start the server
app.listen(3001, () => {
  console.log("Server started on port 3000");
});

// Function to convert the result to JSON format
async function convertToJSONContent(res, result) {
  let tempJSON;

  if (result[0] instanceof Map) {
    // If the result is a SPARQL query result
    tempJSON = {
      head: { vars: [] },
      results: {
        bindings: [],
      },
    };
    // Get the variable names
    for (const [key] of result[0]) {
      tempJSON.head.vars.push(key);
    }

    // Get the query results
    for (const entry of result) {
      let entryRes = {};
      for (const [key, value] of entry.entries()) {
        let termType;
        if (value.termType === "NamedNode") termType = "uri";
        else termType = value.termType;

        // Build the result object
        entryRes[key] = {
          type: termType,
          value: value.value,
        };

        if (value.datatype) {
          let datatype;
          if (value.datatype === "NamedNode") datatype = "uri";
          else datatype = value.datatype;

          entryRes[key] = {
            type: termType,
            value: value.value,
            datatype: datatype,
          };
        }
      }
      tempJSON.results.bindings.push(entryRes);
    }
    // Send the JSON response to the client
    return res.json(tempJSON);
  } else if (result[0] instanceof oxigraph.Quad) {
    // If the result is a RDF graph
    const quads = result;
    // Convert the quads to an RDF stream
    const input = new Readable({
      objectMode: true,
      read: () => {
        for (const quad of quads) {
          input.push(rdf.quad(quad.subject, quad.predicate, quad.object));
        }
        input.push(null);
      },
    });
    // Serialize the RDF stream to Turtle format
    const output = await serializers.import("text/turtle", input);

    // Build the Turtle response
    tempJSON = await new Promise((resolve, reject) => {
      const chunks = [];
      output.on("data", (chunk) => {
        chunks.push(chunk);
      });
      output.on("end", () => {
        let ttl = chunks.join("");
        resolve(ttl);
      });
      output.on("error", reject);
    });
    res.type("text/turtle");
    return res.send(tempJSON);
  }
}
