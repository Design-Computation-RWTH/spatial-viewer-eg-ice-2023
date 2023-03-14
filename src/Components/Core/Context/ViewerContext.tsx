import React, { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { generateUUID } from "three/src/math/MathUtils";
import * as oxigraph from "oxigraph";

export interface ChangedDocument {
  uri: string;
  initialLocation: THREE.Matrix4;
}

export type ViewerContextType = {
  scene: THREE.Scene | null;
  setScene: Dispatch<SetStateAction<THREE.Scene>>;
  sidebarWidth: string;
  setSidebarWidth: Dispatch<SetStateAction<string>>;
  selMesh: THREE.Mesh | null;
  setSelMesh: Dispatch<SetStateAction<THREE.Mesh>>;
  renderer: THREE.Renderer | null;
  setRenderer: Dispatch<SetStateAction<THREE.Renderer>>;
  currentCamera: THREE.PerspectiveCamera | null;
  setCurrentCamera: Dispatch<SetStateAction<THREE.PerspectiveCamera>>;
  control: TransformControls | null;
  setControl: Dispatch<SetStateAction<TransformControls>>;
  orbit: OrbitControls | null;
  setOrbit: Dispatch<SetStateAction<OrbitControls>>;
  canvas: HTMLCanvasElement | null;
  setCanvas: Dispatch<SetStateAction<HTMLCanvasElement>>;
  changedDocuments: ChangedDocument[] | null;
  setChangedDocuments: Dispatch<SetStateAction<ChangedDocument[]>>;
  getChangedDocument: (uri: string) => ChangedDocument;
  renderTree: string | null;
  setRenderTree: Dispatch<SetStateAction<string>>;
  oxiGraph: oxigraph.Store | null;
  setOxiGraph: Dispatch<SetStateAction<oxigraph.Store>>;
  reRenderViewer: () => void;
  reparentMesh: (
    childObject: THREE.Object3D,
    parentObject: THREE.Object3D
  ) => void;
  addTransformToMesh: (selectedMesh: any) => void;
  detachControls: (rerender: boolean) => void;
  addChangedDocument: (
    documentURI: string,
    documentMatrix: THREE.Matrix
  ) => void;
};

export const ViewerContext = createContext<ViewerContextType | null>(null);

const ViewerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scene, setScene] = useState<THREE.Scene | null>();
  const [sidebarWidth, setSidebarWidth] = useState<string>("500px");
  const [selMesh, setSelMesh] = useState<THREE.Mesh | null>();
  const [renderer, setRenderer] = useState<THREE.Renderer | null>();
  const [currentCamera, setCurrentCamera] =
    useState<THREE.PerspectiveCamera | null>();
  const [control, setControl] = useState<TransformControls | null>();
  const [orbit, setOrbit] = useState<OrbitControls | null>();
  const [renderTree, setRenderTree] = useState<string | null>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const [changedDocuments, setChangedDocuments] = useState<ChangedDocument[]>(
    []
  );
  const [oxiGraph, setOxiGraph] = useState<oxigraph.Store>();

  function reRenderViewer() {
    renderer.render(scene, currentCamera);
  }

  function reparentMesh(
    childObject: THREE.Object3D,
    parentObject: THREE.Object3D
  ) {
    let currentWorldPos = new THREE.Vector3();
    let currentWorldScale = new THREE.Vector3();
    let currentWorldQuaternion = new THREE.Quaternion();

    childObject.getWorldPosition(currentWorldPos); // get original world position
    childObject.getWorldScale(currentWorldScale); // get original world scale
    childObject.getWorldQuaternion(currentWorldQuaternion); // get original world quaternion

    parentObject.add(childObject); // reparent the object

    // apply the original world position, scale, and quaternion to the child's local transform
    childObject.position.setFromMatrixPosition(childObject.matrixWorld);
    childObject.scale.setFromMatrixScale(childObject.matrixWorld);
    childObject.quaternion.setFromRotationMatrix(childObject.matrixWorld);

    // apply the difference between the original and new parent transform to the child's local transform
    childObject.applyMatrix4(parentObject.matrixWorld.invert());

    // update the child's matrix and parent's matrix
    childObject.updateMatrix();
    parentObject.updateMatrix();
  }

  function getChangedDocument(uri: string): ChangedDocument {
    let document: ChangedDocument | null = null;
    if (changedDocuments != null) {
      // eslint-disable-next-line array-callback-return
      changedDocuments.find((child) => {
        if (child.uri === uri) document = child;
      });
    }
    return document;
  }

  function addChangedDocument(
    documentURI: string,
    documentMatrix: THREE.Matrix4
  ) {
    if (getChangedDocument(documentURI) === null) {
      let tChangedDocuments = changedDocuments;
      tChangedDocuments.push({
        uri: documentURI,
        initialLocation: documentMatrix,
      });
      setChangedDocuments(tChangedDocuments);
      setRenderTree(generateUUID);
    } else {
      setRenderTree(generateUUID);
    }
  }

  function addTransformToMesh(selectedMesh: any) {
    if (control) {
      detachControls(false);
    }
    let initTransform: THREE.Matrix4 = selectedMesh.matrix;

    const tControl = new TransformControls(currentCamera, renderer.domElement);
    tControl.addEventListener("change", (event) => {
      renderer.render(scene, currentCamera);
    });

    tControl.addEventListener("mouseUp", (event) => {
      console.log(event);
      addChangedDocument(selectedMesh.uuid, initTransform);
    });

    tControl.addEventListener("dragging-changed", function (event) {
      orbit.enabled = !event.value;
      console.log(selectedMesh);
      if (!event.value) {
        // console.log("new matrix", selectedMesh.matrix);
      }
    });

    tControl.attach(selectedMesh);
    scene.add(tControl);
    setControl(tControl);
    setSelMesh(selectedMesh);
    reRenderViewer();
  }

  function detachControls(rerender: boolean) {
    control.detach();
    control.dispose();
    scene.remove(control);
    setSelMesh(null);
    // Only rerender in specific cases
    if (rerender) reRenderViewer();
  }

  return (
    <ViewerContext.Provider
      value={{
        scene,
        setScene,
        sidebarWidth,
        setSidebarWidth,
        selMesh,
        setSelMesh,
        renderer,
        setRenderer,
        currentCamera,
        setCurrentCamera,
        control,
        setControl,
        orbit,
        setOrbit,
        canvas,
        setCanvas,
        changedDocuments,
        setChangedDocuments,
        getChangedDocument,
        renderTree,
        setRenderTree,
        oxiGraph,
        setOxiGraph,
        reRenderViewer,
        reparentMesh,
        addTransformToMesh,
        detachControls,
        addChangedDocument,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
