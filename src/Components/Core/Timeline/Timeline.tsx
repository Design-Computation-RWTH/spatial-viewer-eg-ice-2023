/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, useContext, useEffect } from "react";
import { ActionIcon, Group, Paper, Slider } from "@mantine/core";
import { CircleCheck, Reload } from "tabler-icons-react";
import { showNotification, updateNotification } from "@mantine/notifications";
import { generateUUID } from "three/src/math/MathUtils";
import { ViewerContext, ViewerContextType } from "../Context/ViewerContext";
import { GraphContext, GraphContextType } from "../Context/GraphContext";
import { ViewerMenu } from "../../Menu/Menu";

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
    <Paper withBorder shadow="xl" radius="lg" p="xl" color="grey">
      <Group spacing="xs" style={{ gap: "4px" }} grow>
        <ViewerMenu />

        <Slider
          style={{ minWidth: "70%", maxWidth: "80%", width: "70%" }}
          size="xl"
          radius="xl"
          onChange={setSliderValue}
          label={valueLabelFormat}
          marks={setMarksForTime()}
          value={currentDatePercentage}
        />
        <ActionIcon
          style={{ zIndex: 2 }}
          onClick={loadSceneGraph}
          color="blue"
          size="lg"
          radius="xl"
        >
          <Reload />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
