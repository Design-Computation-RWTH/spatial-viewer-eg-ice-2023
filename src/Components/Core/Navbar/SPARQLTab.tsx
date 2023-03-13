/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { ScrollArea } from "@mantine/core";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";

export function SparqlTab() {
  useEffect(() => {
    const yasgui = new Yasgui(document.getElementById("yasgui"), {
      requestConfig: {
        endpoint: "http://localhost:3001/sparql"
      },
      yasr: {
        prefixes: {
          sg: "http://example.org/scenegraph#",
          ex: "http://example.org/ex#",
          rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          rdfs: "http://www.w3.org/2000/01/rdf-schema#",
          xsd: "http://www.w3.org/2001/XMLSchema#",
          dcterms: "http://purl.org/dc/terms/",
          dcat: "http://www.w3.org/ns/dcat#",
          prov: "http://www.w3.org/ns/prov#"
        }
      },
      copyEndpointOnNewTab: true
    });
    document.getElementById("yasgui").replaceChildren(yasgui.rootEl);
    console.log("Test");
    console.log(yasgui);
    yasgui.on("query", (instance: Yasgui, tab) => {
      console.log("query!!!", tab);
    });
    return () => {};
  }, []);

  return (
    <ScrollArea
      offsetScrollbars
      type="always"
      style={{ width: "100%", height: "100%" }}
    >
      <div style={{ width: "100%", height: "100%" }} id="yasgui" />
    </ScrollArea>
  );
}
