import { Navbar, Stack, ActionIcon } from "@mantine/core";
import { Eyeglass, Hexagon3d, Home } from "tabler-icons-react";

export function CoreNavbar() {
  return (
    <Navbar width={{ base: "50px" }} height={"90%"} p="xs">
      {/* <Navbar.Section>Logo</Navbar.Section> */}
      <Navbar.Section grow mt="md">
        <Stack justify="flex-start" spacing="lg">
          <ActionIcon>
            <Home />
          </ActionIcon>
          <ActionIcon>
            <Eyeglass />
          </ActionIcon>
          <ActionIcon>
            <Hexagon3d />
          </ActionIcon>
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}
