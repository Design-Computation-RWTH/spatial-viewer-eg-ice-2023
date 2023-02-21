/* eslint-disable react-hooks/exhaustive-deps */
import { Button, FileButton, Group, Text, Title } from "@mantine/core";
import * as IFC from "web-ifc-three/IFCLoader";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import * as THREE from "three";
import { useContext, useEffect, useState } from "react";

//TODO: Load Geometry
//TODO: Load Images (Viewpoints)
//TODO: Load IFCs
//TODO: Load from graph, extent graph!
export function HomeTab() {
  const { scene, reRenderViewer, setRenderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ifcFile, setIfcFile] = useState<File | null>(null);

  useEffect(() => {
    if (imageFile) {
      const fileURL = URL.createObjectURL(imageFile);
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(fileURL);

      const img = new Image();
      img.src = fileURL;

      img.onload = function () {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        //const material = new THREE.MeshNormalMaterial();

        const geometry = new THREE.PlaneGeometry(img.width, img.height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-1.5708);
        mesh.name = imageFile.name;
        scene.add(mesh);
        setRenderTree(mesh.id.toString());
        reRenderViewer();
      };
    }
  }, [imageFile]);

  useEffect(() => {
    if (ifcFile) {
      const fileURL = URL.createObjectURL(ifcFile);
      const ifcLoader = new IFC.IFCLoader();
      ifcLoader.ifcManager.setWasmPath("../../../");
      ifcLoader.load(fileURL, (ifcModel) => {
        scene.add(ifcModel);
        setRenderTree(ifcModel.id.toString());
        reRenderViewer();
      });
    }
  }, [ifcFile]);

  return (
    <div>
      <Group position="center">
        <FileButton onChange={setImageFile} accept="image/png,image/jpeg">
          {(props) => <Button {...props}>Upload image</Button>}
        </FileButton>
        <FileButton onChange={setIfcFile} accept="ifc">
          {(props) => <Button {...props}>Upload IFC</Button>}
        </FileButton>
      </Group>
    </div>
  );
}
