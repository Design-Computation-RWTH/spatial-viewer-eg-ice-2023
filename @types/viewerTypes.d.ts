import { Dispatch, SetStateAction } from "react";
import { IfcViewerAPI } from "web-ifc-viewer";

// @types.viewerTypes.ts

export type ViewerContextType = {
  ifcViewer: IfcViewerAPI | null;
  setIfcViewer: Dispatch<SetStateAction<IfcViewerAPI>>;
};
