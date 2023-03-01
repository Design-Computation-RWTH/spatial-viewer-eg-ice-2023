import * as THREE from "three";
import fetch from "node-fetch";
import * as oxigraph from "oxigraph";
import init from "oxigraph/web";
import { generateUUID } from "three/src/math/MathUtils";

let repository: oxigraph.Store;

export default class SceneGraphService {
  async initOxiGraph() {}

  async getAllSceneGraphActors(scene: THREE.Scene, date: Date) {
    const query = `        
    PREFIX sg: <http://example.org/scenegraph#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT
        ?s 
    where {
        ?s a sg:SpatialActor;
          sg:created ?created .
        
        FILTER (?created <= "${date.toISOString()}"^^xsd:dateTime)
    }`;

    const spatialActorsresults: any[] = await repository.query(query);

    let ids: string[] = [];

    for (let spatialActorResult of spatialActorsresults) {
      spatialActorResult.forEach((value, key) => {
        ids.push(value.value);
        this.construcSpatialActor(value.value, scene, date);
      });
    }

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !ids.includes(child.uuid)) {
        this.removeMesh(scene, child);
      }
    });
  }

  removeMesh(object, mesh) {
    if (object.children) {
      for (let i = object.children.length - 1; i >= 0; i--) {
        const child = object.children[i];
        if (child === mesh) {
          object.remove(child);
        } else {
          this.removeMesh(child, mesh);
        }
      }
    }
  }

  async initOxi(): Promise<oxigraph.Store> {
    await init(); // Required to compile the WebAssembly code.

    let data: string;
    repository = new oxigraph.Store();
    await this.loadFileAsString("../../testgraph.ttl").then((loadData) => {
      data = loadData;
      repository.load(
        data,
        "text/turtle",
        "http://example.com/",
        oxigraph.defaultGraph()
      );
    });

    return repository;
    // const dump = await repository.dump("text/turtle", oxigraph.defaultGraph());

    // We can use here Oxigraph methods
  }

  async loadFileAsString(filePath: string): Promise<string> {
    const response = await fetch(filePath);
    const data = await response.text();
    return data;
  }

  async getAllDates(): Promise<any[]> {
    let dates = [];
    if (repository) {
      const findDatesQuery = `        
      PREFIX sg: <http://example.org/scenegraph#>
      PREFIX ex: <http://example.org/ex#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT ?transformation ?created WHERE {
        ?transformation rdf:type sg:Transformation ;
                         sg:created ?created ;
                         sg:targets ex:box1 .
      } ORDER BY DESC(?created)
      `;
      const dateResults: any[] = await repository.query(findDatesQuery);

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

  async construcSpatialActor(
    spatialActor: string,
    scene: THREE.Scene,
    date: Date
  ) {
    this.saveGraphToTtl();
    let query = `
    PREFIX sg: <http://example.org/scenegraph#>
    PREFIX ex: <http://example.org/ex#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    CONSTRUCT {
      ?latestTransform rdf:type sg:Transformation ;
                      sg:created ?latestCreated ;
                      sg:targets ?subject ;
                      ?transformProp ?transformObj .
    }
    WHERE {
      <${spatialActor}> a sg:SpatialActor .
      <${spatialActor}> ?p ?o .
      OPTIONAL {
        ?transform rdf:type sg:Transformation ;
                  sg:targets <${spatialActor}> ;
                  ?transformProp ?transformObj ;
                  sg:created ?created .
        FILTER (?created <= "${date.toISOString()}"^^xsd:dateTime)
        FILTER NOT EXISTS {
          ?otherTransform rdf:type sg:Transformation ;
                          sg:targets <${spatialActor}> ;
                          sg:created ?otherCreated .
          FILTER (?otherCreated < ?created && ?otherCreated >= "${date.toISOString()}"^^xsd:date)
        }
        BIND(?transform AS ?latestTransform)
        BIND(?created AS ?latestCreated)
      }
    }

    `;
    let result: oxigraph.Quad[] = await repository.query(query);
    let cleanResult: any = {};
    for (let quad of result) {
      cleanResult[quad.predicate.value] = quad.object.value;
    }

    let subject: string = result[0].subject.value;
    let mesh: THREE.Object3D;
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial();

    // Check if mesh already exists.
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
        this.setTransformFromMatrix(
          mesh,
          this.getMatrixFromGraph(cleanResult, subject)
        );
      // Update Matrix
    } else {
      // Create new mesh TODO: replace by retrieving mesh from graph!
      mesh = new THREE.Mesh(geometry, material);
      // Set name and uuid
      mesh.name = spatialActor.split("#")[1];
      mesh.uuid = spatialActor;
      // Apply Matrix and add to the scene
      mesh.applyMatrix4(this.getMatrixFromGraph(cleanResult, subject));
      mesh.updateMatrix();
      scene.add(mesh);
    }
    if (cleanResult["http://example.org/scenegraph#hasParent"]) {
      mesh.userData["parent"] =
        cleanResult["http://example.org/scenegraph#hasParent"];
    }
    this.reparentAll(scene);
  }

  reparentAll(scene: THREE.Scene) {
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
  }

  async updateSceneGraphActor(mesh: THREE.Mesh) {
    let now: string = new Date().toISOString();
    const newTransformURI = "http://example.org/ex#" + generateUUID();
    repository.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#type`),
        oxigraph.namedNode("http://example.org/scenegraph#Transformation"),
        oxigraph.defaultGraph()
      )
    );
    repository.add(
      oxigraph.quad(
        oxigraph.namedNode(newTransformURI),
        oxigraph.namedNode(`http://example.org/scenegraph#targets`),
        oxigraph.namedNode(mesh.uuid),
        oxigraph.defaultGraph()
      )
    );
    repository.add(
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
      repository.add(
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
      repository.add(matrixElement);
    }
    this.saveGraphToTtl();
  }

  saveGraphToTtl() {
    let dump = repository.dump("text/turtle", oxigraph.defaultGraph());
  }
  setTransformFromMatrix(mesh: THREE.Mesh, matrix: THREE.Matrix4) {
    mesh.position.setFromMatrixPosition(matrix);
    mesh.rotation.setFromRotationMatrix(matrix);
    mesh.scale.setFromMatrixScale(matrix);
    mesh.updateMatrix();
  }

  getMatrixFromGraph(map: any, uri: string): THREE.Matrix4 {
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
}
