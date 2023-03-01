import React, { ReactNode, useContext, useEffect, useState } from "react";
import { ActionIcon, Group, Paper, Slider } from "@mantine/core";
import { CircleCheck, CloudDownload, TestPipe2 } from "tabler-icons-react";
import { showNotification, updateNotification } from "@mantine/notifications";
import { generateUUID } from "three/src/math/MathUtils";
import { ViewerContext } from "../Context/ViewerContext";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import SceneGraphService from "../../../Services/SceneGraphService";

interface DatePercentage {
  value: number;
  label?: ReactNode;
}

export function Timeline() {
  const { scene, reRenderViewer, setRenderTree, oxiGraph } = useContext(
    ViewerContext
  ) as ViewerContextType;

  const [dates, setDates] = useState<string[]>([]);
  const [currentDatePercentage, setCurrentDatePercentage] =
    useState<number>(100);
  const [currentDate, setCurrentDate] = useState<Date>();

  useEffect(() => {
    getDates();
  }, [oxiGraph]);

  useEffect(() => {
    getDates();
  }, [reRenderViewer]);

  async function getDates() {
    console.log("Get Dates!!");
    let sgs = new SceneGraphService();
    let tDates = await sgs.getAllDates();
    setDates(tDates);
  }

  function setSliderValue(event) {
    setCurrentDatePercentage(event);
  }

  function testDateValue(event) {
    let dateString = valueLabelFormat(currentDatePercentage);
    let toDate = new Date(dateString);
    console.log(toDate.toISOString());
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

      datePercentages = tDates.map((date) => {
        const percentage =
          (date.getTime() - oldestDate.getTime()) * percentageMultiplier;
        const label = date.toLocaleDateString();
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

  function setMarksForTime(): DatePercentage[] {
    let marks: DatePercentage[] = [];
    if (dates.length > 0) {
      marks = normalizeDates(dates);
    }

    return marks;
  }

  async function loadSceneGraph(event) {
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

    const scenegraphservice = new SceneGraphService();
    await scenegraphservice.getAllSceneGraphActors(scene, toDate);

    getDates();

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
          <ActionIcon
            onClick={loadSceneGraph}
            color="blue"
            size="lg"
            radius="xl"
            variant="filled"
          >
            <CloudDownload size={26} />
          </ActionIcon>
          <ActionIcon
            onClick={testDateValue}
            color="blue"
            size="lg"
            radius="xl"
            variant="filled"
          >
            <TestPipe2 size={26} />
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
