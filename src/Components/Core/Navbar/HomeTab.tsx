/* eslint-disable react-hooks/exhaustive-deps */
import { Button, FileButton, Group, Text, Title } from "@mantine/core";
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
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (file) {
      console.log("File selected", file.webkitRelativePath);
      const fileURL = URL.createObjectURL(file);
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(fileURL);
      console.log(textureLoader);

      const img = new Image();
      img.src = fileURL;

      img.onload = function () {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        //const material = new THREE.MeshNormalMaterial();

        const geometry = new THREE.PlaneGeometry(img.width, img.height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-1.5708);
        mesh.name = file.name;
        console.log("id", mesh.id);
        scene.add(mesh);
        setRenderTree(mesh.id.toString());
        reRenderViewer();
      };
    }
  }, [file]);

  return (
    <div>
      <Group position="center">
        <FileButton onChange={setFile} accept="image/png,image/jpeg">
          {(props) => <Button {...props}>Upload image</Button>}
        </FileButton>
      </Group>
    </div>
  );
}
