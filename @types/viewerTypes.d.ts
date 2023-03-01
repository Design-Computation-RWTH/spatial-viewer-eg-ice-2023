import { Dispatch, SetStateAction } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

// @types.viewerTypes.ts

export interface ChangedDocument {
  uri: string;
  initialLocation: THREE.Matrix4;
}

export type ViewerContextType = {
  scene: THREE.Scene | null;
  setScene: Dispatch<SetStateAction<THREE.Scene>>;
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
