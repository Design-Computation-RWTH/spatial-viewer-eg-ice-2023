/* eslint-disable react-hooks/exhaustive-deps */
import { useContext } from "react";
import { ActionIcon, Menu } from "@mantine/core";
import {
  CalendarTime,
  Camera,
  Cut,
  Menu2,
  RulerMeasure,
} from "tabler-icons-react";
import {
  ViewerContext,
  ViewerContextType,
} from "../Core/Context/ViewerContext";
import { GraphContext, GraphContextType } from "../Core/Context/GraphContext";

export function ViewerMenu() {
  const {} = useContext(ViewerContext) as ViewerContextType;

  const {} = useContext(GraphContext) as GraphContextType;

  const iconSize: number = 20;

  return (
    <Menu position="top" shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon color="blue" size="lg" radius="xl">
          <Menu2 />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Viewer</Menu.Label>
        <Menu.Item icon={<RulerMeasure size={iconSize} />}>Measure</Menu.Item>
        <Menu.Item icon={<Cut size={iconSize} />}>Section Box</Menu.Item>
        <Menu.Item icon={<Camera size={iconSize} />}>Screenshot</Menu.Item>

        <Menu.Divider />
        <Menu.Label>Timeline</Menu.Label>
        <Menu.Item icon={<CalendarTime size={iconSize} />}>
          Adjust Timeline
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
