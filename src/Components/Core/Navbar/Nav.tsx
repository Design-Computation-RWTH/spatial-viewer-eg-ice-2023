import { Navbar } from "@mantine/core";
import { BinaryTree, ChartDots3, Upload } from "tabler-icons-react";
import { HomeTab } from "./HomeTab";
import { Tabs } from "@mantine/core";
import { DetailsTab } from "./DetailsTab";
import { ViewerTab } from "./ViewerTab";

export function CoreNavbar() {
  return (
    <Navbar
      //width={{ base: "40%" }}
      height={"100%"}
      p="0"
      style={{ width: "30%", overflow: "hidden" }}
    >
      <Navbar.Section grow mt="">
        <Tabs
          variant="outline"
          radius="xl"
          defaultValue="details"
          orientation="vertical"
          style={{ height: "90%" }}
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

          <Tabs.Panel value="details" style={{ paddingLeft: 10 }}>
            <DetailsTab />
          </Tabs.Panel>
          <Tabs.Panel value="home" style={{ paddingLeft: 10 }}>
            <HomeTab />
          </Tabs.Panel>
          <Tabs.Panel value="settings" style={{ paddingLeft: 10 }}>
            <ViewerTab />
          </Tabs.Panel>
        </Tabs>
      </Navbar.Section>
    </Navbar>
  );
}
