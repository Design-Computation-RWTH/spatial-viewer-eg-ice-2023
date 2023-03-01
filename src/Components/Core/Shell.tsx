import { useContext, useEffect } from "react";
import {
  ActionIcon,
  AppShell,
  Footer,
  Group,
  Header,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { CoreNavbar } from "./Navbar/Nav";
import { ViewerComponent } from "../Viewer/Viewer";
import { MoonStars, SunHigh } from "tabler-icons-react";
import { ViewerContextType } from "../../../@types/viewerTypes";
import { ViewerContext } from "./Context/ViewerContext";
import { Timeline } from "./Timeline/Timeline";
import { GraphContext, GraphContextType } from "./Context/GraphContext";

export const Shell = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "light";

  const { setOxiGraph } = useContext(ViewerContext) as ViewerContextType;

  const { initOxi } = useContext(GraphContext) as GraphContextType;

  useEffect(() => {
    initGraph();
  }, []);

  async function initGraph() {
    let graph = await initOxi();
    setOxiGraph(graph);
  }

  return (
    <AppShell
      styles={(theme) => ({
        main: {
          display: "flex",
          alignContent: "stretch",
          justifyContent: "space-evenly",
          alignItems: "stretch",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
          paddingLeft: "30%",
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
        body: { height: "100vh" },
      })}
      fixed
      footer={
        <Footer height={60} p="md">
          <Group position="center" spacing="xl">
            <Text size="sm">
              <span style={{ fontWeight: "bolder" }}>
                powered by design computation
              </span>
            </Text>
          </Group>
        </Footer>
      }
      header={
        <Header height={70} p="md">
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
    >
      <div style={{ height: "100%", width: "100%" }}>
        <ViewerComponent />
        <Timeline />
      </div>
    </AppShell>
  );
};
