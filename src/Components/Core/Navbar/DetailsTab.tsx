import {
  Button,
  ScrollArea,
  Stack,
  Table,
  Title,
  Group,
  ActionIcon,
  FileButton,
} from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { Coordinates } from "../../Coordinates/Coordinates";
import { ViewerContext, ViewerContextType } from "../Context/ViewerContext";
import { MyTreeView } from "../TreeView/TreeView";
import { showNotification, updateNotification } from "@mantine/notifications";
import * as IFC from "web-ifc-three/IFCLoader";
import { CircleCheck, Upload, Download } from "tabler-icons-react";
import { GraphContext, GraphContextType } from "../Context/GraphContext";

export function DetailsTab() {
  const { selMesh, scene, reRenderViewer, setRenderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const { updateSceneGraphActor } = useContext(
    GraphContext
  ) as GraphContextType;

  const [mesh, setMesh] = useState<any>({
    name: "",
    id: "",
    uuid: "",
    type: "",
    position: { x: 0, y: 0, z: 0 },
  });

  const [newDocument, setNewDocument] = useState<File | null>();

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

  useEffect(() => {
    if (newDocument) {
      console.log("File Loaded");
      console.log(newDocument.name);
      if (newDocument.name.includes(".ifc")) {
        const fileURL = URL.createObjectURL(newDocument);
        const ifcLoader = new IFC.IFCLoader();
        ifcLoader.ifcManager.setWasmPath("../../../");
        ifcLoader.load(fileURL, (ifcModel) => {
          ifcModel.name = newDocument.name;
          scene.add(ifcModel);
          setRenderTree(ifcModel.id.toString());
          reRenderViewer();
        });
      }
    }
  }, [newDocument]);

  async function updateDocument(event) {
    if (selMesh) {
      showNotification({
        id: "update-representation",
        loading: true,
        title: "Updating spatial representation",
        message:
          "Updating spatial representation to the graph. This may take a while",
        autoClose: false,
        disallowClose: true,
      });
      await updateSceneGraphActor(selMesh);
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
      <Group position="apart">
        <Title order={2}>Scene</Title>
        <Group>
          <ActionIcon color="blue" size="sm">
            <Download />
          </ActionIcon>
          <FileButton onChange={setNewDocument} accept="ifc">
            {(props) => (
              <ActionIcon {...props} color="blue" size="sm">
                <Upload />
              </ActionIcon>
            )}
          </FileButton>
        </Group>
      </Group>
      <ScrollArea style={{ height: "100%", width: "100%" }} type="always">
        <MyTreeView />
      </ScrollArea>
      <Title order={2}>Details</Title>
      <ScrollArea
        style={{ height: "100%", width: "100%" }}
        type="always"
        offsetScrollbars
      >
        <Stack>
          <Coordinates />
          <Button variant="outline" onClick={updateDocument}>
            Update Document
          </Button>
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
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
