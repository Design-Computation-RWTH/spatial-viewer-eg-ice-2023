/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Footer,
  Group,
  Header,
  Navbar,
  Text,
  useMantineColorScheme,
  Burger,
  MediaQuery,
  useMantineTheme,
} from "@mantine/core";
import { CoreNavbar } from "./Navbar/Nav";
import { ViewerComponent } from "../Viewer/Viewer";
import { MoonStars, SunHigh } from "tabler-icons-react";
import { Timeline } from "./Timeline/Timeline";
import { GraphContext, GraphContextType } from "./Context/GraphContext";

export const Shell = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const dark = colorScheme === "light";

  const { initOxi, setOxiGraphStore } = useContext(
    GraphContext
  ) as GraphContextType;

  useEffect(() => {
    initGraph();
  }, []);

  async function initGraph() {
    let graph = await initOxi();
    setOxiGraphStore(graph);
  }

  return (
    <div>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 400, lg: 500 }}
          >
            <CoreNavbar />
          </Navbar>
        }
        footer={
          <Footer height={60} p="md">
            <></>
          </Footer>
        }
        header={
          <Header
            height={{ base: 50, md: 70 }}
            style={{ width: "100%" }}
            p="md"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <Group style={{ width: "100%" }} position="apart">
                <Text size="xl" weight="bolder">
                  spatial-scene-viewer
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
              </Group>
            </div>
          </Header>
        }
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <ViewerComponent />
        </div>
      </AppShell>
      <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
        <div
          style={{
            width: "40%",
            height: "10%",
            position: "relative",
            bottom: "250px",
            marginLeft: "50%",
          }}
        >
          <Timeline />
        </div>
      </MediaQuery>
    </div>
  );
};
