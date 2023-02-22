import { Group, NumberInput, Select, Stack, Text } from "@mantine/core";
import * as THREE from "three";
import { useContext, useEffect, useState } from "react";
import { ViewerContext } from "../Core/Context/ViewerContext";
import { ViewerContextType } from "../../../@types/viewerTypes";

export function Coordinates() {
  const { selMesh, reRenderViewer } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [position, setPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0)
  );
  const [rotation, setRotation] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0)
  );
  const [scale, setScale] = useState<THREE.Vector3>(new THREE.Vector3(1, 1, 1));

  function setXPos(val) {
    selMesh.position.setX(val);
    reRenderViewer();
  }
  function setYPos(val) {
    selMesh.position.setY(val);
    reRenderViewer();
  }
  function setZPos(val) {
    selMesh.position.setZ(val);
    reRenderViewer();
  }

  function setXRot(val) {
    selMesh.rotation.x = (val * Math.PI) / 180;
    reRenderViewer();
  }
  function setYRot(val) {
    selMesh.rotation.y = (val * Math.PI) / 180;
    reRenderViewer();
  }
  function setZRot(val) {
    selMesh.rotation.z = (val * Math.PI) / 180;
    reRenderViewer();
  }

  function setXSca(val) {
    selMesh.scale.setX(val);
    reRenderViewer();
  }
  function setYSca(val) {
    selMesh.scale.setY(val);
    reRenderViewer();
  }
  function setZSca(val) {
    selMesh.scale.setZ(val);
    reRenderViewer();
  }

  useEffect(() => {
    if (selMesh) {
      setScale(selMesh.scale);
      setRotation(
        new THREE.Vector3(
          selMesh.rotation.x,
          selMesh.rotation.y,
          selMesh.rotation.z
        )
      );
      setPosition(selMesh.position);
    } else {
      setScale(new THREE.Vector3(1, 1, 1));
      setRotation(new THREE.Vector3(0, 0, 0));
      setPosition(new THREE.Vector3(0, 0, 0));
    }
  }, [selMesh]);

  return (
    <Stack>
      <Group grow>
        <Select
          defaultValue="relPos"
          data={[
            { value: "relPos", label: "Location Relative" },
            { value: "worldPos", label: "Location World" },
          ]}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={position.x}
          onChange={setXPos}
          icon={<Text color={"red"}>X</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={position.y}
          onChange={setYPos}
          icon={<Text color={"green"}>Y</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={position.z}
          onChange={setZPos}
          icon={<Text color={"blue"}>Z</Text>}
          size="xs"
        />
      </Group>
      <Group grow>
        <Select
          defaultValue="relRot"
          data={[
            { value: "relRot", label: "Rotation Relative" },
            { value: "worldRot", label: "Rotation World" },
          ]}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={(rotation.x * 180) / Math.PI}
          onChange={setXRot}
          icon={<Text color={"red"}>X</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={(rotation.y * 180) / Math.PI}
          onChange={setYRot}
          icon={<Text color={"green"}>Y</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={(rotation.z * 180) / Math.PI}
          onChange={setZRot}
          icon={<Text color={"blue"}>Z</Text>}
          size="xs"
        />
      </Group>
      <Group grow>
        <Select
          defaultValue="relScale"
          data={[
            { value: "relScale", label: "Scale Relative" },
            { value: "worldScale", label: "Scale World" },
          ]}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={scale.x}
          onChange={setXSca}
          icon={<Text color={"red"}>X</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={scale.y}
          onChange={setYSca}
          icon={<Text color={"green"}>Y</Text>}
          size="xs"
        />
        <NumberInput
          precision={2}
          value={scale.z}
          onChange={setZSca}
          icon={<Text color={"blue"}>Z</Text>}
          size="xs"
        />
      </Group>
    </Stack>
  );
}
