import { MantineProvider, Text } from '@mantine/core';
import { Shell } from './Components/Core/Shell';
import ViewerProvider from './Components/Core/Context/ViewerContext';

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ViewerProvider>
        <Shell/>
      </ViewerProvider>
    </MantineProvider>
  );
}