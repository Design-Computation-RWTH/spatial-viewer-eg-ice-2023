import React from "react";
import { AppShell, Footer, Group, Header, Text } from "@mantine/core";
import { CoreNavbar } from "./Nav";
import ViewerComponent from "../Viewer/Viewer";

export const Shell = () => {
  return (
    <AppShell
      styles={{
        main: {
          background: "#FFFFFF",
          width: "100vw",
          height: "100vh",
          paddingLeft: "50px",
        },
      }}
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
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Text size="xl" weight="bolder">
              spatial-viewer
            </Text>
          </div>
        </Header>
      }
      navbar={<CoreNavbar />}
    >
      <div style={{ height: "100%", width: "100%" }}>
        <ViewerComponent />
      </div>
    </AppShell>
  );
};
