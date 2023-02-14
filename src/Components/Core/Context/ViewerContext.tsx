import React, { ReactNode } from "react";
import { createContext, useState } from "react";
import { IfcViewerAPI } from "web-ifc-viewer";

  
import {ViewerContextType} from "../../../../@types/viewerTypes"

export const ViewerContext = createContext<ViewerContextType | null>(null);

const ViewerProvider: React.FC<{children: ReactNode}> = ({children}) => {

    const [ifcViewer, setIfcViewer] = useState<IfcViewerAPI| null>();

    return (
        <ViewerContext.Provider value={{
            ifcViewer,
            setIfcViewer}}>
            {children}
        </ViewerContext.Provider>
    );
};

export default ViewerProvider;