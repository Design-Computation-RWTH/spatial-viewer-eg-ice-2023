import { BinaryTree, Search } from "tabler-icons-react";
import { Tabs } from "@mantine/core";
import { DetailsTab } from "./DetailsTab";
import { SparqlTab } from "./SPARQLTab";

export function CoreNavbar() {
  return (
    <Tabs
      variant="outline"
      radius="xl"
      defaultValue="details"
      orientation="vertical"
      style={{ height: "100%", width: "100%" }}
    >
      <Tabs.List>
        <Tabs.Tab value="details">
          <BinaryTree />
        </Tabs.Tab>
        <Tabs.Tab
          onClick={() => {
            console.log("settings");
          }}
          value="settings"
        >
          <Search />
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        value="details"
        style={{
          paddingLeft: 10,
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%"
        }}
      >
        <DetailsTab />
      </Tabs.Panel>
      <Tabs.Panel
        value="settings"
        style={{
          paddingLeft: 10,
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%"
        }}
      >
        <SparqlTab />
      </Tabs.Panel>
    </Tabs>
  );
}
