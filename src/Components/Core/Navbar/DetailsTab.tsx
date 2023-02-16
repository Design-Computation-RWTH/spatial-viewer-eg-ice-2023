import { ScrollArea, Stack, Table, Title } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { ViewerContext } from "../Context/ViewerContext";
import { MyTreeView } from "../TreeView/TreeView";

export function DetailsTab() {
  const { scene, selMesh } = useContext(ViewerContext) as ViewerContextType;

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

  return (
    <Stack style={{ height: "100%", width: "100%" }} justify="space-between">
      <Title order={2}>Scene</Title>
      <ScrollArea style={{ height: "100%", width: "100%" }} type="always">
        <MyTreeView />
      </ScrollArea>
      <Title order={2}>Details</Title>
      <ScrollArea
        style={{ height: "100%", width: "100%" }}
        type="always"
        offsetScrollbars
      >
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
            <tr key={"details-table-position"}>
              <td>Position</td>
              <td>
                {mesh.position.x.toFixed(2)},{mesh.position.y.toFixed(2)},
                {mesh.position.z.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
