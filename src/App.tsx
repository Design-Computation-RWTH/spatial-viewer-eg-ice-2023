import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Shell } from "./Components/Core/Shell";
import ViewerProvider from "./Components/Core/Context/ViewerContext";
import { useEffect } from "react";
import SceneGraphService from "./Services/SceneGraphService";

export default function App() {
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    const sgs = new SceneGraphService();
    sgs.initOxiGraph();
  }, []);

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme: colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <header>
          <title>spatial-viewer</title>
        </header>
        <ViewerProvider>
          <Shell />
        </ViewerProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
