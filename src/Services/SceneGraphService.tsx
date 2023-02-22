import * as rdf from "rdflib";
import * as THREE from "three";

export default class SceneGraphService {
  async contructSparqlQuery(scene: THREE.Scene) {
    const graph = rdf.graph();
    const endpointUrl = "http://localhost:7200/repositories/scenegraphtests";

    const query = `
        
        PREFIX sg: <http://example.org/scenegraph#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        construct { 
            ?s ?p ?o
            }  
        where {
            ?s a sg:SpatialActor;
            ?p ?o.
        }

        `;

    await rdf
      .fetcher(graph, {})
      .load(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
        },
        mode: "cors",
        body: query,
      })
      .then(() => {
        return graph;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    let meshes: THREE.Object3D[] = [];

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial();
    graph
      .each(
        null,
        rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        rdf.sym("http://example.org/scenegraph#SpatialActor")
      )
      .forEach((subject) => {
        let mesh: THREE.Object3D;

        // Check if mesh already exists.
        if (scene.getObjectByProperty("uuid", subject.value)) {
          // If it exists return it to its original position (retrieved from the grap)
          mesh = scene.getObjectByProperty("uuid", subject.value);
          // First remove it from its parent and add it to the scene
          if (mesh.parent instanceof THREE.Scene === false) {
            mesh.removeFromParent();
            scene.add(mesh);
          }
          // Reset position, rotation, and scale TODO: Check this for rotation and scale!
          mesh.position.setFromMatrixPosition(
            this.getMatrixFromGraph(graph, subject)
          );
          mesh.rotation.setFromRotationMatrix(
            this.getMatrixFromGraph(graph, subject)
          );
          mesh.scale.setFromMatrixScale(
            this.getMatrixFromGraph(graph, subject)
          );
          // Update Matrix
          mesh.updateMatrix();
        } else {
          // Create new mesh TODO: replace by retrieving mesh from graph!
          mesh = new THREE.Mesh(geometry, material);
          // Set name and uuid
          mesh.name = subject.value.split("#")[1];
          mesh.uuid = subject.value;
          // Apply Matrix and add to the scene
          mesh.applyMatrix4(this.getMatrixFromGraph(graph, subject));
          mesh.updateMatrix();
          scene.add(mesh);
        }
        // Add to Mesh Array
        meshes.push(mesh);
      });
    // For every member in the meshes array check for the parent and attach it to it
    meshes.forEach((mesh) => {
      let parent = this.getParentURIFromGraph(graph, mesh.uuid);
      if (parent) {
        scene.getObjectByProperty("uuid", parent).add(mesh);
      }
    });
  }

  getMatrixFromGraph(graph: rdf.Store, node: rdf.Node): THREE.Matrix4 {
    let matrix: THREE.Matrix4 = new THREE.Matrix4();

    graph.match(rdf.sym(node.value), null, null).forEach((sub) => {
      if (sub.predicate.value === "http://example.org/scenegraph#m1")
        matrix.elements[0] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m2")
        matrix.elements[1] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m3")
        matrix.elements[2] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m4")
        matrix.elements[3] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m5")
        matrix.elements[4] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m6")
        matrix.elements[5] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m7")
        matrix.elements[6] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m8")
        matrix.elements[7] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m9")
        matrix.elements[8] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m10")
        matrix.elements[9] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m11")
        matrix.elements[10] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m12")
        matrix.elements[11] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m13")
        matrix.elements[12] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m14")
        matrix.elements[13] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m15")
        matrix.elements[14] = Number(sub.object.value);
      else if (sub.predicate.value === "http://example.org/scenegraph#m16")
        matrix.elements[15] = Number(sub.object.value);
    });

    return matrix;
  }

  getParentURIFromGraph(graph: rdf.Store, subject: string): string | null {
    let URI: string | null = null;

    graph.match(rdf.sym(subject), null, null).forEach((sub) => {
      if (sub.predicate.value === "http://example.org/scenegraph#hasParent")
        URI = sub.object.value;
    });

    return URI;
  }
}
