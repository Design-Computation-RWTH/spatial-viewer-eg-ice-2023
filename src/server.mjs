import express from "express";
import oxigraph from "oxigraph";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SerializerJsonld from "@rdfjs/serializer-jsonld";
import rdf from "@rdfjs/data-model";
import { Readable } from "readable-stream";
import { serializers } from "@rdfjs/formats-common";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static("../" + path.join(__dirname, "public")));

const saveGraphMiddleware = (req, res, next) => {
  // Parse the body as text only for the 'save_graph' route
  if (req.path === "/save_graph") {
    bodyParser.text()(req, res, next);
  } else {
    bodyParser.urlencoded({ extended: false });
    bodyParser.json();
    next();
  }
};

app.use(saveGraphMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/save_graph", (req, res) => {
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

  // Send the file to the client
  res.sendFile(workingDir, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error sending file");
    }
  });
});

app.post("/sparql", async (req, res) => {
  const query = req.body.query;
  const store = new oxigraph.Store();
  const dataLoaded = await new Promise((resolve, reject) => {
    fs.readFile("./storage/graphDump.ttl", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  await store.load(
    //@ts-ignore
    dataLoaded,
    "text/turtle",
    "http://example.com/",
    oxigraph.defaultGraph()
  );
  const result = await store.query(query);
  await convertToJSONContent(res, result);
});

app.get("/files/:filename", (req, res) => {
  let filename = req.params.filename;
  let workingDir = path.join(__dirname, "..", "/storage/", filename);

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

async function convertToJSONContent(res, result) {
  let tempJSON;

  if (result[0] instanceof Map) {
    tempJSON = {
      head: { vars: [] },
      results: {
        bindings: [],
      },
    };
    for (const [key] of result[0]) {
      tempJSON.head.vars.push(key);
    }

    for (const entry of result) {
      let entryRes = {};
      for (const [key, value] of entry.entries()) {
        let termType;
        if (value.termType === "NamedNode") termType = "uri";
        else termType = value.termType;

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
    return res.json(tempJSON);
  } else if (result[0] instanceof oxigraph.Quad) {
    const quads = result;
    const input = new Readable({
      objectMode: true,
      read: () => {
        for (const quad of quads) {
          input.push(rdf.quad(quad.subject, quad.predicate, quad.object));
        }
        input.push(null);
      },
    });
    const output = await serializers.import("text/turtle", input);

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
