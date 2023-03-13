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
    // <AppShell
    //   fixed
    //   styles={(theme) => ({
    //     root: {
    //       height: "100vh",
    //       width: "100vw",
    //     },
    //     main: {
    //       display: "flex",
    //       alignContent: "stretch",
    //       justifyContent: "space-evenly",
    //       alignItems: "stretch",
    //       flexDirection: "column",
    //       // position: "relative",
    //       width: "100%",
    //       height: "100%",
    //       minHeight: "90%",
    //       // paddingLeft: "30%",
    //       backgroundColor:
    //         theme.colorScheme === "dark"
    //           ? theme.colors.dark[8]
    //           : theme.colors.gray[0],
    //     },
    //     body: {
    //       height: "90%",
    //       width: "100%",
    //       maxHeight: "100%",
    //       maxWidth: "100%",
    //     },
    //   })}
    //   header={
    //     <Header height={"5%"} style={{ position: "relative" }} p="md">
    //       <div
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           height: "100%",
    //           justifyContent: "space-between",
    //         }}
    //       >
    //         <Text size="xl" weight="bolder">
    //           spatial-viewer
    //         </Text>
    //         <Group>
    //           <ActionIcon
    //             variant="transparent"
    //             color={dark ? "blue" : "blue"}
    //             onClick={() => toggleColorScheme()}
    //             title="Toggle Color Scheme"
    //           >
    //             {dark ? <SunHigh /> : <MoonStars />}
    //           </ActionIcon>
    //         </Group>
    //       </div>
    //     </Header>
    //   }
    //   navbar={<CoreNavbar />}
    //   footer={
    //     <Footer
    //       height={"5%"}
    //       style={{
    //         position: "relative",
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //       }}
    //       p="md"
    //     >
    //       <Group position="center" spacing="xl">
    //         <SegmentedControl
    //           defaultValue={sidebarWidth}
    //           onChange={setSidebarWidth}
    //           data={[
    //             {
    //               label: (
    //                 <Center>
    //                   <LayoutSidebarLeftExpand />
    //                 </Center>
    //               ),
    //               value: "100%",
    //             },
    //             {
    //               label: (
    //                 <Center>
    //                   <LayoutSidebar />
    //                 </Center>
    //               ),
    //               value: "30%",
    //             },
    //             {
    //               label: (
    //                 <Center>
    //                   <LayoutSidebarRightExpand />
    //                 </Center>
    //               ),
    //               value: "0%",
    //             },
    //           ]}
    //         ></SegmentedControl>
    //       </Group>
    //     </Footer>
    //   }
    // >
    //   <div style={{ height: "100%", width: "100%" }}>
    //     <ViewerComponent />
    //     <div
    //       style={{
    //         position: "fixed",
    //         left: "40%",
    //         bottom: "10%",
    //         width: "60%",
    //       }}
    //     >
    //       <Timeline />
    //     </div>
    //   </div>
    // </AppShell>
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
            height: "8%",
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
