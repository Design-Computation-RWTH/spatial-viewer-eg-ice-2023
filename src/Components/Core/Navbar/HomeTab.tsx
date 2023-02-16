import { Text, Title } from "@mantine/core";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { useContext, useEffect, useState } from "react";

export function HomeTab() {
  const { selMesh } = useContext(ViewerContext) as ViewerContextType;

  const [meshName, setMeshName] = useState<string>("empty");

  useEffect(() => {
    if (selMesh) {
      setMeshName(selMesh.uuid);
    }
  }, [selMesh]);

  return (
    <div>
      <Title order={2}>Details</Title>
      <Text>{meshName}</Text>
    </div>
  );
}
