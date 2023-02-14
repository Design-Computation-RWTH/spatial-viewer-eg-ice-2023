import { Dispatch, SetStateAction } from "react";
import * as THREE from "three";

// @types.viewerTypes.ts

export type ViewerContextType = {
  scene: THREE.Scene | null;
  setScene: Dispatch<SetStateAction<THREE.Scene>>;
  selMesh: THREE.Mesh | null;
  setSelMesh: Dispatch<SetStateAction<THREE.Mesh>>;
};
