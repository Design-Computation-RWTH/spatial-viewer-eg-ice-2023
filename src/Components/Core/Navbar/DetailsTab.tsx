import { Button, Group, ScrollArea, Stack, Table, Title } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { generateUUID } from "three/src/math/MathUtils";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import SceneGraphService from "../../../Services/SceneGraphService";
import { Coordinates } from "../../Coordinates/Coordinates";
import { ViewerContext } from "../Context/ViewerContext";
import { MyTreeView } from "../TreeView/TreeView";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck } from "tabler-icons-react";

export function DetailsTab() {
  const { selMesh, scene, reRenderViewer, setRenderTree, getChangedDocument } =
    useContext(ViewerContext) as ViewerContextType;

  const [mesh, setMesh] = useState<any>({
    name: "",
    id: "",
    uuid: "",
    type: "",
    position: { x: 0, y: 0, z: 0 },
  });

  useEffect(() => {
    if (selMesh) {
      setMesh(selMesh);
    } else {
      setMesh({
        name: "",
        id: "",
        uuid: "",
        type: "",
        position: { x: 0, y: 0, z: 0 },
      });
    }
  }, [selMesh]);

  async function loadSceneGraph(event) {
    showNotification({
      id: "load-graph",
      loading: true,
      title: "Loading your Graph",
      message:
        "Loading the spatial representations from the graph. This may take a while",
      autoClose: false,
      disallowClose: true,
    });

    const scenegraphservice = new SceneGraphService();
    await scenegraphservice.getAllSceneGraphActors(scene);

    updateNotification({
      id: "load-graph",
      color: "teal",
      title: "Data was loaded",
      message:
        "Notification will close in 2 seconds, you can close this notification now",
      icon: <CircleCheck size={16} />,
      autoClose: 2000,
    });

    reRenderViewer();
    setRenderTree(generateUUID);
  }

  async function resetDocument(event) {
    let sgs = new SceneGraphService();
    // await sgs.getSpecificSceneGraphActor(scene, selMesh.uuid);
    reRenderViewer();
  }

  async function updateDocument(event) {
    if (selMesh) {
      let sgs = new SceneGraphService();
      showNotification({
        id: "update-representation",
        loading: true,
        title: "Updating spatial representation",
        message:
          "Updating spatial representation to the graph. This may take a while",
        autoClose: false,
        disallowClose: true,
      });
      await sgs.updateSceneGraphActor(selMesh);
      updateNotification({
        id: "update-representation",
        color: "teal",
        title: "Data was updated",
        message:
          "Notification will close in 2 seconds, you can close this notification now",
        icon: <CircleCheck size={16} />,
        autoClose: 2000,
      });
      reRenderViewer();
    }
  }

  return (
    <Stack style={{ height: "100%", width: "100%" }} justify="space-between">
      <Title order={2}>Scene</Title>
      <ScrollArea style={{ height: "100%", width: "100%" }} type="always">
        <MyTreeView />
      </ScrollArea>
      <Group grow>
        <Button onClick={loadSceneGraph}>Load from Scene Graph</Button>
      </Group>
      <Title order={2}>Details</Title>
      <ScrollArea
        style={{ height: "100%", width: "100%" }}
        type="always"
        offsetScrollbars
      >
        <Stack>
          <Coordinates />
          <Table striped highlightOnHover withColumnBorders>
            <thead>
              <tr key={"details-table-header"}>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr key={"details-table-name"}>
                <td>Name</td>
                <td>{mesh.name}</td>
              </tr>
              <tr key={"details-table-id"}>
                <td>ID</td>
                <td>{mesh.id}</td>
              </tr>
              <tr key={"details-table-uuid"}>
                <td>UUID</td>
                <td>{mesh.uuid}</td>
              </tr>
              <tr key={"details-table-type"}>
                <td>Type</td>
                <td>{mesh.type}</td>
              </tr>
            </tbody>
          </Table>
          <Button onClick={updateDocument}>Update Document</Button>
          <Button onClick={resetDocument}>Reset Document</Button>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
