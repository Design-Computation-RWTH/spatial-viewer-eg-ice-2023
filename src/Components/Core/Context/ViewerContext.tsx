import React, { ReactNode } from "react";
import { createContext, useState } from "react";
import * as THREE from "three";

  
import {ViewerContextType} from "../../../../@types/viewerTypes"

export const ViewerContext = createContext<ViewerContextType | null>(null);

const ViewerProvider: React.FC<{children: ReactNode}> = ({children}) => {

    const [scene, setScene] = useState<THREE.Scene | null>();
    const [selMesh, setSelMesh] = useState<THREE.Mesh | null>();

    return (
        <ViewerContext.Provider value={{
            scene,
            setScene,
            selMesh,
            setSelMesh
            }}>
            {children}
        </ViewerContext.Provider>
    );
};

export default ViewerProvider;