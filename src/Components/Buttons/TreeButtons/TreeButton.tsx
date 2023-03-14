/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Text } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import * as THREE from "three";
import {
  ViewerContext,
  ViewerContextType,
} from "../../Core/Context/ViewerContext";

interface TreeButtonProps {
  buttonText: string;
  object3D?: THREE.Object3D | null;
}

export function TreeButton(props: TreeButtonProps) {
  const { selMesh, addTransformToMesh, getChangedDocument } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [selected, setSelected] = useState<boolean>(false);
  const [italic, setItalic] = useState<string>("");
  const [bold, setBold] = useState<number>(0);
  const [star, setStar] = useState<string>("");

  useEffect(() => {}, [selected]);

  useEffect(() => {
    if (selMesh === props.object3D) {
      setSelected(true);
      if (getChangedDocument(selMesh.uuid) != null) {
        setItalic("italic");
        setBold(2000);
        setStar(" *");
      } else {
        setItalic("");
        setBold(0);
        setStar("");
      }
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
      <Text fs={italic} fw={bold}>
        {props.buttonText}
        {star}
      </Text>
    </Button>
  );
}
