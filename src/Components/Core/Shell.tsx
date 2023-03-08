/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import {
  ActionIcon,
  AppShell,
  Center,
  Footer,
  Group,
  Header,
  SegmentedControl,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { CoreNavbar } from "./Navbar/Nav";
import { ViewerComponent } from "../Viewer/Viewer";
import {
  LayoutSidebar,
  LayoutSidebarLeftExpand,
  LayoutSidebarRightExpand,
  MoonStars,
  SunHigh,
} from "tabler-icons-react";
import { Timeline } from "./Timeline/Timeline";
import { GraphContext, GraphContextType } from "./Context/GraphContext";
import { ViewerContext } from "./Context/ViewerContext";
import { ViewerContextType } from "../../../@types/viewerTypes";

export const Shell = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "light";

  const { initOxi, setOxiGraphStore } = useContext(
    GraphContext
  ) as GraphContextType;

  const { sidebarWidth, setSidebarWidth } = useContext(
    ViewerContext
  ) as ViewerContextType;

  useEffect(() => {
    initGraph();
  }, []);

  async function initGraph() {
    let graph = await initOxi();
    setOxiGraphStore(graph);
  }

  return (
    <AppShell
      fixed
      styles={(theme) => ({
        root: {
          height: "100vh",
          width: "100vw",
        },
        main: {
          display: "flex",
          alignContent: "stretch",
          justifyContent: "space-evenly",
          alignItems: "stretch",
          flexDirection: "column",
          // position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "90%",
          // paddingLeft: "30%",
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
        body: {
          height: "90%",
          width: "100%",
          maxHeight: "100%",
          maxWidth: "100%",
        },
      })}
      header={
        <Header height={"5%"} style={{ position: "relative" }} p="md">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text size="xl" weight="bolder">
              spatial-viewer
            </Text>
            <Group>
              <ActionIcon
                variant="transparent"
                color={dark ? "blue" : "blue"}
                onClick={() => toggleColorScheme()}
                title="Toggle Color Scheme"
              >
                {dark ? <SunHigh /> : <MoonStars />}
              </ActionIcon>
            </Group>
          </div>
        </Header>
      }
      navbar={<CoreNavbar />}
      footer={
        <Footer height={"5%"} style={{ position: "relative" }} p="md">
          <Group position="center" spacing="xl">
            <SegmentedControl
              defaultValue={sidebarWidth}
              onChange={setSidebarWidth}
              data={[
                {
                  label: (
                    <Center>
                      <LayoutSidebarLeftExpand />
                    </Center>
                  ),
                  value: "100%",
                },
                {
                  label: (
                    <Center>
                      <LayoutSidebar />
                    </Center>
                  ),
                  value: "30%",
                },
                {
                  label: (
                    <Center>
                      <LayoutSidebarRightExpand />
                    </Center>
                  ),
                  value: "0%",
                },
              ]}
            ></SegmentedControl>
          </Group>
        </Footer>
      }
    >
      <div style={{ height: "100%", width: "100%" }}>
        <ViewerComponent />
        <div style={{ paddingLeft: "30%", height: "100%", width: "100%" }}>
          <Timeline />
        </div>
      </div>
    </AppShell>
  );
};
