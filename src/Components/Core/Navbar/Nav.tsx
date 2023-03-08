import { Navbar } from "@mantine/core";
import { BinaryTree, ChartDots3, Upload } from "tabler-icons-react";
import { HomeTab } from "./HomeTab";
import { Tabs } from "@mantine/core";
import { DetailsTab } from "./DetailsTab";
import { QueryTab } from "./QueryTab";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { useContext } from "react";
import { ViewerContext } from "../Context/ViewerContext";

export function CoreNavbar() {
  const { sidebarWidth } = useContext(ViewerContext) as ViewerContextType;

  return (
    <Navbar
      //width={{ base: "40%" }}
      height={"100%"}
      p="0"
      style={{
        height: "90%",
        width: sidebarWidth,
        overflow: "hidden",
        top: "5%",
        // position: "relative",
      }}
    >
      <Navbar.Section
        style={{ height: "100%", width: "100%", marginTop: 0 }}
        grow
      >
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
            <Tabs.Tab value="home">
              <Upload />
            </Tabs.Tab>
            <Tabs.Tab value="settings">
              <ChartDots3 />
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel
            value="details"
            style={{
              paddingLeft: 10,
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <DetailsTab />
          </Tabs.Panel>
          <Tabs.Panel
            value="home"
            style={{
              paddingLeft: 10,
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <HomeTab />
          </Tabs.Panel>
          <Tabs.Panel
            value="settings"
            style={{
              paddingLeft: 10,
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <QueryTab />
          </Tabs.Panel>
        </Tabs>
      </Navbar.Section>
    </Navbar>
  );
}
