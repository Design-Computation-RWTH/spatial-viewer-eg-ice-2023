import { Dispatch, SetStateAction } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

// @types.viewerTypes.ts

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
  renderTree: string | null;
  setRenderTree: Dispatch<SetStateAction<string>>;
  reRenderViewer: () => void;
  reparentMesh: (
    childObject: THREE.Object3D,
    parentObject: THREE.Object3D
  ) => void;
  addTransformToMesh: (selectedMesh: any) => void;
  detachControls: (rerender: boolean) => void;
};
