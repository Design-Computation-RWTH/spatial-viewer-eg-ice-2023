import { Button } from "@mantine/core";
import SceneGraphService from "../../../Services/SceneGraphService";
import { useContext } from "react";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";

export function ViewerTab() {
  const { scene, reRenderViewer, setRenderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;

  async function constructQuery(event) {
    const scenegraphservice = new SceneGraphService();
    await scenegraphservice.contructSparqlQuery(scene);

    reRenderViewer();
    setRenderTree("parent");
  }

  return (
    <div>
      <Button onClick={constructQuery}>Query Graph</Button>
    </div>
  );
}
