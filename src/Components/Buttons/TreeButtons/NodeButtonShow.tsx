/* eslint-disable react-hooks/exhaustive-deps */
import { ActionIcon } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { GridDots, Lamp, Line, ThreeDCubeSphere } from "tabler-icons-react";
import * as THREE from "three";
import {
  ViewerContext,
  ViewerContextType,
} from "../../Core/Context/ViewerContext";

interface NodeButtonShowProps {
  object3D?: THREE.Object3D | null;
  node?: any;
}

//TODO: Fix visibility update!
export function NodeButtonShow(props: NodeButtonShowProps) {
  const { scene, reRenderViewer } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    if (scene) {
      let object;
      if (props.object3D) {
        object = scene.getObjectById(props.object3D.id);
        setSelected(!object.visible);
      }
    }
  }, []);

  function onSelect(event) {
    if (scene.getObjectById(props.object3D.id)) {
      let object = scene.getObjectById(props.object3D.id);
      object.visible = !object.visible;
      reRenderViewer();
    }
  }
  let icon;
  if (props.node.data.type === "Mesh") icon = <ThreeDCubeSphere />;
  else if (props.node.data.type === "GridHelper") icon = <GridDots />;
  else if (props.node.data.type === "DirectionalLight") icon = <Lamp />;
  else if (props.node.data.name === "Lighthelper") icon = <Lamp />;
  else if (props.node.data.type === "Line") icon = <Line />;

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
