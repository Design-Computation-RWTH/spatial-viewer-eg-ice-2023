import { Button, Text } from "@mantine/core";
import SceneGraphService from "../../../Services/SceneGraphService";
import * as rdf from "rdflib";
import * as THREE from "three";
import { useContext } from "react";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";

export function ViewerTab() {
  const {
    scene,
    setScene,
    renderer,
    setRenderer,
    currentCamera,
    setCurrentCamera,
    reRenderViewer,
    setRenderTree,
    reparentMesh,
    control,
    setControl,
    orbit,
    setOrbit,
    addTransformToMesh,
    detachControls,
  } = useContext(ViewerContext) as ViewerContextType;

  function getMatrixFromGraph(graph: rdf.Store, node: rdf.Node): THREE.Matrix4 {
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

  function getParentURIFromGraph(
    graph: rdf.Store,
    subject: string
  ): string | null {
    let URI: string | null = null;

    graph.match(rdf.sym(subject), null, null).forEach((sub) => {
      if (sub.predicate.value === "http://example.org/scenegraph#hasParent")
        URI = sub.object.value;
    });

    return URI;
  }

  async function constructQuery(event) {
    const scenegraphservice = new SceneGraphService();

    const graph: rdf.Store | null =
      await scenegraphservice.contructSparqlQuery();

    let meshes: THREE.Object3D[] = [];
    graph
      .each(
        null,
        rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        rdf.sym("http://example.org/scenegraph#SpatialActor")
      )
      .forEach((subject) => {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshNormalMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = subject.value.split("#")[1];
        mesh.uuid = subject.value;

        mesh.applyMatrix4(getMatrixFromGraph(graph, subject));

        scene.add(mesh);
        meshes.push(mesh);
      });
    meshes.forEach((mesh) => {
      let parent = getParentURIFromGraph(graph, mesh.uuid);
      if (parent) {
        scene.getObjectByProperty("uuid", parent).add(mesh);
      }
    });
    reRenderViewer();
    setRenderTree("parent");
  }

  return (
    <div>
      <Button onClick={constructQuery}>Query Graph</Button>
    </div>
  );
}
