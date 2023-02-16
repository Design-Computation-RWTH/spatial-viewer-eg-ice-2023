import { Button, Text, Title } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import * as THREE from "three";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { ViewerContext } from "../../Core/Context/ViewerContext";

interface TreeButtonProps {
  buttonText: string;
  object3D?: THREE.Object3D | null;
}

export function TreeButton(props: TreeButtonProps) {
  const { selMesh, setSelMesh, addTransformToMesh, detachControls } =
    useContext(ViewerContext) as ViewerContextType;

  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {}, [selected]);

  useEffect(() => {
    if (selMesh === props.object3D) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [selMesh]);

  function onSelect(event) {
    if (!selected) addTransformToMesh(props.object3D);
    setSelected(!selected);
  }

  return (
    <Button
      onClick={onSelect}
      variant={selected ? "filled" : "subtle"}
      color={"gray"}
      compact
    >
      <Text>{props.buttonText}</Text>
    </Button>
  );
}
