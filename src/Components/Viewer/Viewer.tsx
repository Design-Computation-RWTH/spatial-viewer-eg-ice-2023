/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useContext, useEffect, useState } from "react";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as BVH from "three-mesh-bvh";
import { ViewerContextType } from "../../../@types/viewerTypes";
import { ViewerContext } from "../Core/Context/ViewerContext";

// based on: https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_transform.html
// example: https://observablehq.com/@vicapow/three-js-transformcontrols-example

export const ViewerComponent = memo(() => {
  // Setting up state vars
  const [cameraPersp, setCameraPersp] = useState<THREE.PerspectiveCamera>();
  const [cameraOrtho, setCameraOrtho] = useState<THREE.OrthographicCamera>();

  const {
    scene,
    setScene,
    renderer,
    setRenderer,
    currentCamera,
    setCurrentCamera,
    reRenderViewer,
    reparentMesh,
    control,
    setControl,
    orbit,
    setOrbit,
    addTransformToMesh,
    detachControls,
  } = useContext(ViewerContext) as ViewerContextType;

  const { setSelMesh } = useContext(ViewerContext) as ViewerContextType;

  // Setting up raycaster & mouse
  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = true;
  const mouse = new THREE.Vector2();

  // Init Effect
  useEffect(() => {
    const canvas = document.getElementById("ifc-viewer-container");
    const width: number = canvas.clientWidth;
    const height: number = canvas.clientHeight;
    const tRenderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    tRenderer.setSize(width, height);
    tRenderer.setClearColor(0x000000, 0);
    document
      .getElementById("ifc-viewer-container")
      .appendChild(tRenderer.domElement);
    const aspect: number = width / height;

    // Adding Cameras
    const tCameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
    const tCameraOrtho = new THREE.OrthographicCamera(
      -600 * aspect,
      600 * aspect,
      -600,
      0.01,
      30000
    );
    const tCurrentCamera = tCameraPersp;

    tCurrentCamera.position.set(1000, 500, 1000);
    tCurrentCamera.lookAt(0, 200, 0);

    const tScene = new THREE.Scene();

    // Adding a grid and a simple light
    tScene.add(new THREE.GridHelper(1000, 10, 0x888888, 0x444444));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    tScene.add(light);

    // Adding Orbit Controls
    const tOrbit = new OrbitControls(tCurrentCamera, tRenderer.domElement);
    tOrbit.update();
    tOrbit.addEventListener("change", () =>
      tRenderer.render(tScene, tCurrentCamera)
    );

    // Creating testing geometry and material
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "TestMesh_1";
    const mesh2 = new THREE.Mesh(geometry, material);
    mesh2.name = "TestMesh_2";
    const mesh3 = new THREE.Mesh(geometry, material);
    mesh3.name = "TestMesh_3";
    tScene.add(mesh);
    tScene.add(mesh2);
    tScene.add(mesh3);

    mesh2.translateX(-200);
    mesh2.translateY(200);
    mesh2.translateZ(-200);
    mesh2.updateMatrix();

    let Mesh2Pos = new THREE.Vector3();
    mesh2.getWorldPosition(Mesh2Pos);

    mesh3.translateX(-400);
    mesh3.translateY(400);
    mesh3.translateZ(-400);
    mesh3.updateMatrix();

    let Mesh3Pos = new THREE.Vector3();
    mesh3.getWorldPosition(Mesh3Pos);

    reparentMesh(mesh2, mesh);
    reparentMesh(mesh3, mesh2);

    // Adding a initial dummy control

    const tControl = new TransformControls(
      tCurrentCamera,
      tRenderer.domElement
    );

    // Initial rerender. Later use the function
    tRenderer.render(tScene, tCurrentCamera);

    // Setting the state variables. ToDo: replace with ViewerContext
    setCameraOrtho(tCameraOrtho);
    setCameraPersp(tCameraPersp);
    setCurrentCamera(tCurrentCamera);
    setRenderer(tRenderer);
    setScene(tScene);
    setControl(tControl);
    setOrbit(tOrbit);
  }, []);

  // Init the resizer function listener
  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, [cameraOrtho, cameraPersp, currentCamera, scene]);

  // Init the click function listener
  useEffect(() => {
    let canvas: any = null;
    if (renderer) {
      canvas = renderer.domElement;
      canvas.addEventListener("click", onClick);
    }
    return () => {
      if (renderer) canvas.removeEventListener("click", onClick);
    };
  }, [control]);

  function onClick(event) {
    if (currentCamera) {
      const canvas = event.target;
      const x = (event.offsetX / canvas.clientWidth) * 2 - 1;
      const y = -(event.offsetY / canvas.clientHeight) * 2 + 1;

      // Places it on the camera pointing to the mouse
      raycaster.setFromCamera({ x, y }, currentCamera);

      // Casts a ray
      const intersection = raycaster.intersectObjects(
        scene.children.filter((obj) => obj.type === "Mesh")
      );

      // Filter out ControlPlane if it is hit
      if (intersection.length > 0) {
        let currentPos = new THREE.Vector3();
        intersection[0].object.getWorldPosition(currentPos);
        addTransformToMesh(intersection[0].object);
      } else {
        if (control) {
          detachControls(true);
        }
      }
    }
  }

  function onWindowResize() {
    const canvas = document.getElementById("ifc-viewer-container");
    const width: number = canvas.clientWidth;
    const height: number = canvas.clientHeight;
    const aspect: number = width / height;
    cameraPersp.aspect = aspect;
    cameraPersp.updateProjectionMatrix();

    cameraOrtho.left = cameraOrtho.bottom * aspect;
    cameraOrtho.right = cameraOrtho.top * aspect;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);

    reRenderViewer();
  }

  return (
    <div style={{ height: "100%" }} id="ifc-viewer-container">
      {/* <input type="file" name="load" id="file-input" /> */}
    </div>
  );
});
