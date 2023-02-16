/* eslint-disable react-hooks/exhaustive-deps */
import { ActionIcon } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { GridDots, Hexagon3d, Lamp } from "tabler-icons-react";
import * as THREE from "three";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { ViewerContext } from "../../Core/Context/ViewerContext";

interface NodeButtonShowProps {
  object3D?: THREE.Object3D | null;
  node?: any;
}

//TODO: Fix visibility update!
export function NodeButtonShow(props: NodeButtonShowProps) {
  const { scene, selMesh, reRenderViewer } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    if (scene) {
      let object;
      if (props.object3D) {
        object = scene.getObjectById(props.object3D.id);
        console.log("Visibility: ", object.visible);
        setSelected(!object.visible);
      }
    }
  }, []);

  function onSelect(event) {
    if (scene.getObjectById(props.object3D.id)) {
      let object = scene.getObjectById(props.object3D.id);
      console.log("hide?", object.visible);
      object.visible = !object.visible;
      reRenderViewer();
    }
  }
  let icon;
  console.log(props.node.data.type);
  if (props.node.data.type === "Mesh") icon = <Hexagon3d />;
  else if (props.node.data.type === "GridHelper") icon = <GridDots />;
  else if (props.node.data.type === "DirectionalLight") icon = <Lamp />;

  return props.node.data.type === undefined ? (
    <></>
  ) : (
    <ActionIcon
      onClick={onSelect}
      variant={selected ? "subtle" : "default"}
      color={"gray"}
    >
      {icon}
    </ActionIcon>
  );
}
