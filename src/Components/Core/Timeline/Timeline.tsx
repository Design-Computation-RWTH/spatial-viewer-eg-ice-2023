/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, useContext, useEffect } from "react";
import { ActionIcon, Group, Menu, Paper, Slider, Text } from "@mantine/core";
import {
  ArrowLeftRight,
  CircleCheck,
  Menu2,
  MessageCircle,
  Photo,
  Reload,
  Search,
  Settings,
  Trash,
} from "tabler-icons-react";
import { showNotification, updateNotification } from "@mantine/notifications";
import { generateUUID } from "three/src/math/MathUtils";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import { GraphContext, GraphContextType } from "../Context/GraphContext";

interface DatePercentage {
  value: number;
  label?: ReactNode;
}

export function Timeline() {
  const { reRenderViewer, setRenderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const {
    getAllDates,
    getAllSceneGraphActors,
    setCurrentDate,
    currentDatePercentage,
    setCurrentDatePercentage,
    dates,
    setDates,
    oxiGraphStore,
  } = useContext(GraphContext) as GraphContextType;

  useEffect(() => {
    getDates();
    setCurrentDate(new Date(valueLabelFormat(100)));
  }, [oxiGraphStore]);

  useEffect(() => {
    getDates();
  }, [reRenderViewer]);

  async function getDates() {
    let tDates = await getAllDates();
    setDates(tDates);
  }

  function setSliderValue(event) {
    setCurrentDatePercentage(event);
  }

  function normalizeDates(dateStrings: string[]): DatePercentage[] {
    if (dateStrings) {
      const tDates = dateStrings.map((dateString) => new Date(dateString));
      tDates.sort((a, b) => a.getTime() - b.getTime());

      const oldestDate = tDates[0];
      const newestDate = tDates[tDates.length - 1];

      tDates.push(newestDate);
      let datePercentages;

      const elapsedTime = newestDate.getTime() - oldestDate.getTime();
      const percentageMultiplier = 100 / elapsedTime;

      datePercentages = tDates.map((date, index) => {
        const percentage =
          (date.getTime() - oldestDate.getTime()) * percentageMultiplier;
        let label = "";

        if (index === 0 || index === tDates.length - 1) {
          label = date.toLocaleDateString();
        }
        return { value: percentage, label };
      });

      return datePercentages;
    }
  }

  function valueLabelFormat(value: number) {
    let newDateString = "";
    if (dates.length > 0) {
      const tDates = dates.map((dateString) => new Date(dateString));
      tDates.sort((a, b) => a.getTime() - b.getTime());

      tDates.push(new Date());

      const oldestDate = tDates[0];
      const newestDate = tDates[tDates.length - 1];

      const elapsedTime = newestDate.getTime() - oldestDate.getTime();
      const elapsedPercentage = value / 100;

      if (elapsedPercentage < 0 || elapsedPercentage > 1) {
        // percentage is out of range, return null
        return null;
      }

      const elapsedMillis = elapsedTime * elapsedPercentage;
      const correspondingTime = oldestDate.getTime() + elapsedMillis;

      let newDate = new Date(correspondingTime);
      newDateString = newDate.toString();
    }

    return newDateString;
  }

  // Generate the first and last time mark for the timeline
  function setMarksForTime(): DatePercentage[] {
    let marks: DatePercentage[] = [];
    if (dates.length > 0) {
      marks = normalizeDates(dates);
    }

    return marks;
  }

  // Loading the scene graph and displaying a notification
  async function loadSceneGraph() {
    showNotification({
      id: "load-graph",
      loading: true,
      title: "Loading your Graph",
      message:
        "Loading the spatial representations from the graph. This may take a while",
      autoClose: false,
      disallowClose: true,
    });

    let dateString = valueLabelFormat(currentDatePercentage);

    let toDate = new Date(dateString);

    await getAllSceneGraphActors(toDate);

    getDates();

    // TODO: Show error messages
    updateNotification({
      id: "load-graph",
      color: "teal",
      title: "Data was loaded",
      message:
        "Notification will close in 2 seconds, you can close this notification now",
      icon: <CircleCheck size={16} />,
      autoClose: 2000,
    });

    reRenderViewer();
    setRenderTree(generateUUID);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "60%",
        left: "0",
        right: "0",
        bottom: "12%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Paper withBorder shadow="xl" radius="xl" p="xl" color="grey">
        <Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon color="blue" size="lg" radius="xl" variant="filled">
                <Menu2 size={26} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item icon={<Settings size={14} />}>Settings</Menu.Item>
              <Menu.Item icon={<MessageCircle size={14} />}>Messages</Menu.Item>
              <Menu.Item icon={<Photo size={14} />}>Gallery</Menu.Item>
              <Menu.Item
                icon={<Search size={14} />}
                rightSection={
                  <Text size="xs" color="dimmed">
                    ⌘K
                  </Text>
                }
              >
                Search
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item icon={<ArrowLeftRight size={14} />}>
                Transfer my data
              </Menu.Item>
              <Menu.Item color="red" icon={<Trash size={14} />}>
                Delete my account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            onClick={loadSceneGraph}
            color="blue"
            size="lg"
            radius="xl"
            variant="filled"
          >
            <Reload size={26} />
          </ActionIcon>
          <Slider
            style={{ width: "80%" }}
            size="xl"
            radius="xl"
            onChange={setSliderValue}
            label={valueLabelFormat}
            marks={setMarksForTime()}
            value={currentDatePercentage}
          />
        </Group>
      </Paper>
    </div>
  );
}
