import React, { ReactNode } from "react";
import { createContext, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { ViewerContextType } from "../../../../@types/viewerTypes";

export const ViewerContext = createContext<ViewerContextType | null>(null);

const ViewerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scene, setScene] = useState<THREE.Scene | null>();
  const [selMesh, setSelMesh] = useState<THREE.Mesh | null>();
  const [renderer, setRenderer] = useState<THREE.Renderer | null>();
  const [currentCamera, setCurrentCamera] =
    useState<THREE.PerspectiveCamera | null>();
  const [control, setControl] = useState<TransformControls | null>();
  const [orbit, setOrbit] = useState<OrbitControls | null>();

  function reRenderViewer() {
    renderer.render(scene, currentCamera);
    console.log("Render");
  }

  function reparentMesh(
    childObject: THREE.Object3D,
    parentObject: THREE.Object3D
  ) {
    let currentWorldPos = new THREE.Vector3();
    childObject.getWorldPosition(currentWorldPos); // get original world position
    //childObject.parent.remove(childObject);

    // reparent the object
    parentObject.add(childObject);
    childObject.updateMatrix();
    let newWorldPos = new THREE.Vector3();
    childObject.getWorldPosition(newWorldPos); // get new world position

    // calculate the difference between the original and new positions
    const posDiff = new THREE.Vector3();
    posDiff.subVectors(currentWorldPos, newWorldPos);

    // apply the difference to the object's local position
    childObject.position.add(posDiff);
    // update the object's matrix so it reflects the new position
    childObject.updateMatrix();
    parentObject.updateMatrix();
  }

  function addTransformToMesh(selectedMesh: any) {
    if (control) {
      detachControls(false);
    }

    const tControl = new TransformControls(currentCamera, renderer.domElement);
    tControl.addEventListener("change", () =>
      renderer.render(scene, currentCamera)
    );

    tControl.addEventListener("dragging-changed", function (event) {
      orbit.enabled = !event.value;
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
        reRenderViewer,
        reparentMesh,
        addTransformToMesh,
        detachControls,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
};

export default ViewerProvider;
