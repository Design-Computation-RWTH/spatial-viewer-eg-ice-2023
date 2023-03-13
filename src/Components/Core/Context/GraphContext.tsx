import React, { Dispatch, ReactNode, SetStateAction, useContext } from "react";
import { createContext, useState } from "react";
import * as THREE from "three";
import * as oxigraph from "oxigraph";
import { ViewerContext } from "./ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import init from "oxigraph/web";
import { generateUUID } from "three/src/math/MathUtils";
import * as IFC from "web-ifc-three/IFCLoader";
import {
  constructTransformMatrix,
  fileQuery,
  selectDates,
  selectSceneGraphActors,
  selectTransform,
} from "../../../Misc/Queries";

export interface ChangedDocument {
  uri: string;
  initialLocation: THREE.Matrix4;
}

export type GraphContextType = {
  oxiGraphStore: oxigraph.Store | null;
  setOxiGraphStore: Dispatch<SetStateAction<oxigraph.Store>>;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  dates: string[];
  setDates: Dispatch<SetStateAction<string[]>>;
  currentDatePercentage: number;
  setCurrentDatePercentage: Dispatch<SetStateAction<number>>;
  initOxi: () => Promise<oxigraph.Store>;
  updateSceneGraphActor: (mesh: THREE.Mesh) => Promise<void>;
  getAllSceneGraphActors: (date: Date) => Promise<void>;
  getAllDates: () => Promise<any[]>;
  simpleQuery(query: string): Promise<any[]>;
  uriToPrefixString(uri: string): string;
};

export const GraphContext = createContext<GraphContextType | null>(null);

const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { scene, reRenderViewer, setRenderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [oxiGraphStore, setOxiGraphStore] = useState<oxigraph.Store>();
  const [currentDate, setCurrentDate] = useState<Date>();
  const [currentDatePercentage, setCurrentDatePercentage] =
    useState<number>(100);
  const [dates, setDates] = useState<string[]>([]);

  /**
   * Initializes an Oxigraph store, loads a graph from a remote endpoint and a local file,
   * sets the store in state, gets all available dates, and returns the store.
   */
  async function initOxi(): Promise<oxigraph.Store> {
    // Initialize the required WebAssembly code.
    await init();

    // Load the graph from the remote endpoint.
    let data: string;
    try {
      const response = await fetch("http://localhost:3001/load_graph");
      data = await response.text();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to load graph from remote endpoint.");
    }

    // Create a new Oxigraph store and load the graph into it.
    const repository = new oxigraph.Store();
    repository.load(
      data,
      "text/turtle",
      "http://example.com/",
      oxigraph.defaultGraph()
    );

    // Load the local file.
    try {
      const loadData = await loadFileAsString("../../testgraph.ttl");
      data = loadData;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to load local file.");
    }

    // Set the Oxigraph store in state.
    setOxiGraphStore(repository);

    // Get all available dates.
    const tDates = await getAllDates();
    setDates(tDates);

    // Return the Oxigraph store.
    return repository;
  }

  /**
   * Recursively remove a mesh from an object and its children.
   * @param {THREE.Object3D} object - The object to remove the mesh from.
   * @param {THREE.Mesh} mesh - The mesh to remove.
   */
  function removeMesh(object, mesh) {
    if (!object.children) return; // If the object has no children, return.

    for (let i = object.children.length - 1; i >= 0; i--) {
      const child = object.children[i];

      if (child === mesh) {
        // If the child is the mesh we want to remove.
        object.remove(child);
      } else {
        removeMesh(child, mesh); // Recursively check the child's children.
      }
    }
  }

  async function loadFileAsString(filePath: string): Promise<string> {
    const response = await fetch(filePath);
    const data = await response.text();
    return data;
  }

  async function getAllDates(): Promise<any[]> {
    let dates = [];
    if (oxiGraphStore) {
      const dateResults: any[] = await oxiGraphStore.query(selectDates());

      for (let date of dateResults) {
        date.forEach((value, key) => {
          if (key === "created") {
            dates.push(value.value);
          }
        });
      }
    }
    return dates;
  }

  /**
   * This function retrieves all scene graph actors for a given date from the oxiGraphStore and constructs them.
   * @param {Date} date - The date from that the scene should get constructed
   */
  async function getAllSceneGraphActors(date: Date) {
    // await the executions of all queries
    await querySceneGraphActors(date);
    reRenderViewer();
    reparentAll();
  }

  async function querySceneGraphActors(date: Date) {
    // Query the oxiGraphStore for all scene graph actors for the given date.
    const spatialActorsresults: any[] = await oxiGraphStore.query(
      selectSceneGraphActors(date)
    );

    let ids: string[] = [];

    // Construct spatial actors in parallel using Promise.all().
    await Promise.all(
      spatialActorsresults.map(async (spatialActorResult) => {
        for (let value of spatialActorResult) {
          const spatialActor = value[1].value;
          // Store the ID of each constructed spatial actor in the `ids` array.
          ids.push(spatialActor);
          // Construct the spatial actor.
          await construcSpatialActor(spatialActor, date);
        }
      })
    );

    // Remove meshes that are not in the `ids` array from the scene graph.
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !ids.includes(child.uuid)) {
        removeMesh(scene, child);
      }
    });
    return;
  }

  // These two maps will be used to cache the results of previous queries to the oxiGraphStore.
  const cachedTransformResults: Map<string, any> = new Map();
  const cachedFileResults: Map<string, any> = new Map();

  // This function constructs a single spatial actor.
  async function construcSpatialActor(spatialActor: string, date: Date) {
    // Check if the results of the transform query for this spatial actor are already cached. If not, query the oxiGraphStore for the transform data.
    let transformResults = cachedTransformResults.get(spatialActor);
    if (!transformResults) {
      console.log(
        " selectTransform(spatialActor, date)",
        selectTransform(spatialActor, date)
      );
      let selResult: any = await oxiGraphStore.query(
        selectTransform(spatialActor, date)
      );

      let transformSubject: string = selResult
        .values()
        .next()
        .value.values()
        .next().value.value;

      transformResults = await oxiGraphStore.query(
        constructTransformMatrix(transformSubject)
      );

      // Cache the results of the transform query for this spatial actor.
      cachedTransformResults.set(spatialActor, transformResults);
    }

    let cleanResult: any = {};
    // Clean up the results of the transform query and store them in a new object.
    for (let quad of transformResults) {
      cleanResult[quad.predicate.value] = quad.object.value;
    }
    // Check if the results of the file query for this spatial actor are already cached. If not, query the oxiGraphStore for the file data.
    let fileResult = cachedFileResults.get(spatialActor);
    if (!fileResult) {
      fileResult = await oxiGraphStore.query(fileQuery(spatialActor));
      // Cache the results of the file query for this spatial actor.
      cachedFileResults.set(spatialActor, fileResult);
    }

    let filename: string;
    let mediatype: string;
    let downloadURL: string;

    // Parse the file query results to extract the desired variables.
    for (let entry of fileResult) {
      for (let member of entry) {
        if (member[0] === "downloadURL") {
          downloadURL = member[1].value;
        }
        if (member[0] === "mediatype") {
          mediatype = member[1].value;
        }
        if (member[0] === "filename") {
          filename = member[1].value;
        }
      }
    }

    // Declare the subject of the spatial actor by getting the subject value from the first transform result
    let subject: string = transformResults[0].subject.value;

    // Declare a variable to hold the mesh object that will be created
    let mesh: THREE.Object3D;

    // Check the media type of the file associated with the spatial actor
    if (mediatype.includes("png")) {
      // If it's a png image
      // Create a box geometry with dimensions of 2x2x2 and a normal material
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshNormalMaterial();

      // Create a mesh object with the geometry and material
      mesh = new THREE.Mesh(geometry, material);

      // Download the ifc file and create a url for it
      const png = await downloadFile(downloadURL);
      const fileURL = URL.createObjectURL(png);
      // Create an instance of the IFCLoader and set the wasm path
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(fileURL);

      const img = new Image();
      img.src = fileURL;

      img.onload = function () {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        //const material = new THREE.MeshNormalMaterial();

        const geometry = new THREE.PlaneGeometry(img.width, img.height);
        const mesh = new THREE.Mesh(geometry, material);
        updateSceneObject(mesh, spatialActor, cleanResult, subject, filename);
      };
      return;
    } else if (mediatype.includes("ifc")) {
      // If it's an ifc file
      // Check if the scene doesn't already have a mesh object with the same uuid as the spatial actor
      if (!scene.getObjectByProperty("uuid", spatialActor)) {
        // Download the ifc file and create a url for it
        let ifc = await downloadFile(downloadURL);
        const fileURL = URL.createObjectURL(ifc);
        // Create an instance of the IFCLoader and set the wasm path
        const ifcLoader = await new IFC.IFCLoader();
        ifcLoader.ifcManager.setWasmPath("../../../");

        // Load the ifc file with the ifcLoader
        await ifcLoader.load(fileURL, (ifcModel) => {
          // Once loaded, assign the loaded model to the mesh object
          mesh = ifcModel;

          // Call the updateSceneObject function with the mesh object and other necessary parameters
          updateSceneObject(mesh, spatialActor, cleanResult, subject, filename);
        });
        return;
      } else if (scene.getObjectByProperty("uuid", spatialActor)) {
        updateSceneObject(mesh, spatialActor, cleanResult, subject, filename);
      }
    }
  }

  async function updateSceneObject(
    mesh,
    spatialActor,
    cleanResult,
    subject,
    filename
  ) {
    if (scene.getObjectByProperty("uuid", spatialActor)) {
      // If it exists return it to its original position (retrieved from the graph)
      mesh = scene.getObjectByProperty("uuid", spatialActor);
      // First remove it from its parent and add it to the scene
      if (mesh.parent instanceof THREE.Scene === false) {
        mesh.removeFromParent();
        scene.add(mesh);
      }
      // Reset position, rotation, and scale
      if (mesh instanceof THREE.Mesh) {
        setTransformFromMatrix(mesh, getMatrixFromGraph(cleanResult, subject));
      }
      // Update Matrix
      mesh.updateMatrix();
    } else {
      // Set name and uuid
      mesh.name = filename;
      mesh.uuid = spatialActor;
      // Apply Matrix and add to the scene
      mesh.applyMatrix4(getMatrixFromGraph(cleanResult, spatialActor));
      mesh.updateMatrix();
      scene.add(mesh);
    }
    if (cleanResult["http://example.org/scenegraph#hasParent"]) {
      mesh.userData["parent"] =
        cleanResult["http://example.org/scenegraph#hasParent"];
    }
    reparentAll();
    reRenderViewer();
    setRenderTree(generateUUID());
  }

  // This function goes through all the children of the THREE.Scene and
  // reparents them to their designated parent object if the "parent" key
  // exists in their userData.
  function reparentAll() {
    scene.children.forEach((object) => {
      if (object.userData["parent"]) {
        // Get the parent object by its uuid
        const parent = scene.getObjectByProperty(
          "uuid",
          object.userData["parent"]
        );
        if (parent) {
          // Remove the object from its current parent and add it to its designated parent
          object.removeFromParent();
          parent.add(object);
        }
      }
    });
    // Render the updated scene in the viewer
    reRenderViewer();
  }

  async function downloadFile(downloadURL: string): Promise<Blob> {
    let file;

    await fetch(downloadURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        file = response.blob();
        return;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

    return file;
  }

  async function updateSceneGraphActor(mesh: THREE.Mesh) {
    let now: string = new Date().toISOString();
    const newTransformURI = "http://example.org/ex#" + generateUUID();
    oxiGraphStore.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#type`),
        oxigraph.namedNode("http://example.org/scenegraph#Transformation"),
        oxigraph.defaultGraph()
      )
    );
    oxiGraphStore.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://example.org/scenegraph#hasSpatialActor`),
        oxigraph.namedNode(mesh.uuid),
        oxigraph.defaultGraph()
      )
    );
    oxiGraphStore.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://www.w3.org/ns/prov#generatedAtTime`),
        oxigraph.literal(
          now,
          oxigraph.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
        ),
        oxigraph.defaultGraph()
      )
    );
    // Add the current time in the timeline here!
    oxiGraphStore.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://www.w3.org/ns/prov#atTime`),
        oxigraph.literal(
          now,
          oxigraph.namedNode("http://www.w3.org/2001/XMLSchema#dateTime")
        ),
        oxigraph.defaultGraph()
      )
    );
    if (mesh.parent instanceof THREE.Scene === false) {
      oxiGraphStore.add(
        oxigraph.quad(
          oxigraph.namedNode(newTransformURI),
          oxigraph.namedNode(`http://example.org/scenegraph#hasParent`),
          oxigraph.namedNode(mesh.parent.uuid),
          oxigraph.defaultGraph()
        )
      );
    }
    for (let i = 0; i < mesh.matrix.elements.length; i++) {
      let matrixElement: oxigraph.Quad = oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://example.org/scenegraph#m${i + 1}`),
        oxigraph.literal(
          mesh.matrix.elements[i].toFixed(3).toString(),
          oxigraph.namedNode("http://www.w3.org/2001/XMLSchema#string")
        ),
        oxigraph.defaultGraph()
      );
      oxiGraphStore.add(matrixElement);
    }
    console.log("Save Graph");
    await saveGraphToTtl();
    reRenderViewer();
  }

  function setTransformFromMatrix(mesh: THREE.Mesh, matrix: THREE.Matrix4) {
    mesh.position.setFromMatrixPosition(matrix);
    mesh.rotation.setFromRotationMatrix(matrix);
    mesh.scale.setFromMatrixScale(matrix);
    mesh.updateMatrix();
  }

  async function saveGraphToTtl() {
    let graphData = await oxiGraphStore.dump(
      "text/turtle",
      oxigraph.defaultGraph()
    );

    console.log(graphData);
    // Send the FormData object in a fetch request
    await fetch("http://localhost:3001/save_graph", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: graphData,
    })
      .then((response) => {
        console.log("File uploaded successfully", response);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  }

  // This function takes a map of key-value pairs and a URI and returns a THREE.Matrix4 object.
  function getMatrixFromGraph(map: any, uri: string): THREE.Matrix4 {
    // Create a new THREE.Matrix4 object.
    let matrix: THREE.Matrix4 = new THREE.Matrix4();
    // Get the keys of the map.
    const keys = Object.keys(map);
    // Loop through keys representing the matrix elements.
    for (let i = 1; i <= 16; i++) {
      // Create a key representing the current matrix element.
      const key = `http://example.org/scenegraph#m${i}`;
      // Get the index of the key in the keys array.
      const index = keys.indexOf(key);
      // If the key exists in the map, set the corresponding matrix element.
      if (index !== -1) {
        matrix.elements[i - 1] = parseFloat(map[key]);
      }
    }
    // Return the matrix.
    return matrix;
  }

  /**
   * Recursively remove a mesh from an object and its children.
   * @param {string} query - The SPARQL query that should be sent to the server
   */
  async function simpleQuery(query: string): Promise<any[]> {
    const results: any[] = await oxiGraphStore.query(query);

    return results;
  }

  function uriToPrefixString(uri: string): string {
    // Create an object with the URI prefixes and their replacements
    const prefixMap = {
      "http://example.org/scenegraph#": "sg:",
      "http://example.org/ex#": "ex:",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf:",
      "http://www.w3.org/2000/01/rdf-schema#": "rdfs:",
      "http://www.w3.org/2001/XMLSchema#": "xsd:",
      "http://purl.org/dc/terms/": "dcterms:",
      "https://w3id.org/omg#": "omg:",
    };

    // Loop through the keys in the prefixMap object and replace the URI if found
    for (const key in prefixMap) {
      if (uri.includes(key)) {
        return uri.replace(key, prefixMap[key]);
      }
    }

    // Return the original URI if no matches were found
    return uri;
  }

  return (
    <GraphContext.Provider
      value={{
        oxiGraphStore,
        setOxiGraphStore,
        currentDate,
        setCurrentDate,
        dates,
        setDates,
        currentDatePercentage,
        setCurrentDatePercentage,
        initOxi,
        updateSceneGraphActor,
        getAllSceneGraphActors,
        getAllDates,
        simpleQuery,
        uriToPrefixString,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphProvider;
