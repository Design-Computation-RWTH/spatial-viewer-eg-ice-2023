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
  const { scene, reRenderViewer } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [oxiGraphStore, setOxiGraphStore] = useState<oxigraph.Store>();
  const [currentDate, setCurrentDate] = useState<Date>();
  const [currentDatePercentage, setCurrentDatePercentage] =
    useState<number>(100);
  const [dates, setDates] = useState<string[]>([]);

  async function initOxi(): Promise<oxigraph.Store> {
    await init(); // Required to compile the WebAssembly code.

    let data: string;
    let repository = new oxigraph.Store();

    await fetch("http://localhost:3001/load_graph")
      .then((response) => response.text())
      .then((content) => {
        data = content;
      })
      .catch((error) => {
        console.log(error);
      });

    repository.load(
      data,
      "text/turtle",
      "http://example.com/",
      oxigraph.defaultGraph()
    );

    await loadFileAsString("../../testgraph.ttl").then((loadData) => {
      data = loadData;
    });

    setOxiGraphStore(repository);

    let tDates = await getAllDates();
    setDates(tDates);
    return repository;
    // const dump = await repository.dump("text/turtle", oxigraph.defaultGraph());

    // We can use here Oxigraph methods
  }

  function removeMesh(object, mesh) {
    if (object.children) {
      for (let i = object.children.length - 1; i >= 0; i--) {
        const child = object.children[i];
        if (child === mesh) {
          object.remove(child);
        } else {
          removeMesh(child, mesh);
        }
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
      const findDatesQuery = `        
      PREFIX sg: <http://example.org/scenegraph#>
      PREFIX ex: <http://example.org/ex#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX prov: <http://www.w3.org/ns/prov#>
      
      SELECT ?transformation ?created WHERE {
        ?transformation rdf:type sg:Transformation ;
                         prov:generatedAtTime ?created .
      } ORDER BY DESC(?created)
      `;
      const dateResults: any[] = await oxiGraphStore.query(findDatesQuery);

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

  async function getAllSceneGraphActors(date: Date) {
    const spatialActorsresults: any[] = await oxiGraphStore.query(
      selectSceneGraphActors(date)
    );

    let ids: string[] = [];

    for (let spatialActorResult of spatialActorsresults) {
      spatialActorResult.forEach((value) => {
        ids.push(value.value);
        construcSpatialActor(value.value, date);
      });
    }

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !ids.includes(child.uuid)) {
        removeMesh(scene, child);
      }
    });
  }

  async function construcSpatialActor(spatialActor: string, date: Date) {
    let selResult: any = await oxiGraphStore.query(
      selectTransform(spatialActor, date)
    );

    let transformSubject: string = selResult
      .values()
      .next()
      .value.values()
      .next().value.value;

    let transformResults: oxigraph.Quad[] = await oxiGraphStore.query(
      constructTransformMatrix(transformSubject)
    );

    let cleanResult: any = {};
    for (let quad of transformResults) {
      cleanResult[quad.predicate.value] = quad.object.value;
    }

    // SELECT query for finding all necessary information to create our scenen actors

    let fileResult: any[] = await oxiGraphStore.query(fileQuery(spatialActor));

    let filename: string;
    let mediatype: string;
    let downloadURL: string;

    // Filter out the desired variables
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

    console.log(filename, mediatype, downloadURL);

    let subject: string = transformResults[0].subject.value;
    let mesh: THREE.Object3D;

    if (mediatype.includes("png")) {
      console.log("Its a picture!");
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      doRest(mesh, spatialActor, cleanResult, subject, filename);
    } else if (mediatype.includes("ifc")) {
      console.log("Its an IFC!");
      if (!scene.getObjectByProperty("uuid", spatialActor)) {
        console.log("Ifc is not yet here");
        let ifc = await downloadIfc(downloadURL);
        console.log("ifcblob:", ifc);
        const fileURL = URL.createObjectURL(ifc);
        const ifcLoader = await new IFC.IFCLoader();
        ifcLoader.ifcManager.setWasmPath("../../../");
        console.log("load!");
        await ifcLoader.load(fileURL, (ifcModel) => {
          mesh = ifcModel;
          console.log("after load", mesh);
          doRest(mesh, spatialActor, cleanResult, subject, filename);
        });
      }
    }
  }

  function doRest(mesh, spatialActor, cleanResult, subject, filename) {
    if (scene.getObjectByProperty("uuid", spatialActor)) {
      // If it exists return it to its original position (retrieved from the grap)
      mesh = scene.getObjectByProperty("uuid", spatialActor);
      // First remove it from its parent and add it to the scene
      if (mesh.parent instanceof THREE.Scene === false) {
        mesh.removeFromParent();
        scene.add(mesh);
      }
      // Reset position, rotation, and scale
      if (mesh instanceof THREE.Mesh)
        setTransformFromMatrix(mesh, getMatrixFromGraph(cleanResult, subject));
      // Update Matrix
    } else {
      // Set name and uuid
      mesh.name = filename;
      mesh.uuid = spatialActor;
      // Apply Matrix and add to the scene
      mesh.applyMatrix4(getMatrixFromGraph(cleanResult, spatialActor));
      mesh.updateMatrix();
      console.log(mesh, "add!");
      scene.add(mesh);
    }
    if (cleanResult["http://example.org/scenegraph#hasParent"]) {
      mesh.userData["parent"] =
        cleanResult["http://example.org/scenegraph#hasParent"];
    }
    reparentAll();
    reRenderViewer();
  }

  function reparentAll() {
    scene.traverse((object) => {
      if (object.userData["parent"]) {
        if (scene.getObjectByProperty("uuid", object.userData["parent"])) {
          object.removeFromParent();
          scene.add(object);
          scene
            .getObjectByProperty("uuid", object.userData["parent"])
            .add(object);
        }
      }
    });
    reRenderViewer();
  }

  async function downloadIfc(downloadURL: string): Promise<Blob> {
    let ifc;

    await fetch(downloadURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        ifc = response.blob();
        return;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

    return ifc;
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
        oxigraph.namedNode(`http://example.org/scenegraph#targets`),
        oxigraph.namedNode(mesh.uuid),
        oxigraph.defaultGraph()
      )
    );
    oxiGraphStore.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://example.org/scenegraph#created`),
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

  function getMatrixFromGraph(map: any, uri: string): THREE.Matrix4 {
    let matrix: THREE.Matrix4 = new THREE.Matrix4();
    for (let key in map) {
      if (key === "http://example.org/scenegraph#m1")
        matrix.elements[0] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m2")
        matrix.elements[1] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m3") {
        matrix.elements[2] = parseFloat(map[key]);
      } else if (key === "http://example.org/scenegraph#m4")
        matrix.elements[3] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m5")
        matrix.elements[4] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m6")
        matrix.elements[5] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m7")
        matrix.elements[6] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m8")
        matrix.elements[7] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m9")
        matrix.elements[8] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m10")
        matrix.elements[9] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m11")
        matrix.elements[10] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m12")
        matrix.elements[11] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m13")
        matrix.elements[12] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m14")
        matrix.elements[13] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m15")
        matrix.elements[14] = parseFloat(map[key]);
      else if (key === "http://example.org/scenegraph#m16")
        matrix.elements[15] = parseFloat(map[key]);
    }
    return matrix;
  }

  async function simpleQuery(query: string): Promise<any[]> {
    const results: any[] = await oxiGraphStore.query(query);

    return results;
  }

  function uriToPrefixString(uri: string): string {
    let newString: string = uri;

    if (uri.includes("http://example.org/scenegraph#"))
      newString = newString.replace("http://example.org/scenegraph#", "sg:");
    else if (uri.includes("http://example.org/ex#"))
      newString = newString.replace("http://example.org/ex#", "ex:");
    else if (uri.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#"))
      newString = newString.replace(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdf:"
      );
    else if (uri.includes("http://www.w3.org/2000/01/rdf-schema#"))
      newString = newString.replace(
        "http://www.w3.org/2000/01/rdf-schema#",
        "rdfs:"
      );
    else if (uri.includes("http://www.w3.org/2001/XMLSchema#"))
      newString = newString.replace(
        "http://www.w3.org/2001/XMLSchema#",
        "xsd:"
      );
    else if (uri.includes("http://purl.org/dc/terms/"))
      newString = newString.replace("http://purl.org/dc/terms/", "dcterms::");
    else if (uri.includes("https://w3id.org/omg#"))
      newString = newString.replace("https://w3id.org/omg#", "omg:");

    return newString;
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
