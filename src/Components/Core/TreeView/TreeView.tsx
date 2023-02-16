/* eslint-disable react-hooks/exhaustive-deps */
import { ActionIcon, Group, Space } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { ViewerContextType } from "../../../../@types/viewerTypes";
import * as Arborist from "react-arborist";
import { ViewerContext } from "../Context/ViewerContext";
import { NodeApi, NodeRendererProps } from "react-arborist";
import {
  CaretDown,
  CaretRight,
  GridDots,
  Hexagon3d,
  Lamp,
} from "tabler-icons-react";
import * as THREE from "three";
import { TreeButton } from "../../Buttons/TreeButtons/TreeButton";
import { NodeButtonShow } from "../../Buttons/TreeButtons/NodeButtonShow";

// Defining Tree type
export type TreeData = {
  id: string;
  isOpen?: boolean;
  type?: string;
  name: string;
  children: TreeData[];
};

// Component for creating a tree view representing the scene graph
export function MyTreeView() {
  const { scene, reRenderViewer, reparentMesh, renderTree } = useContext(
    ViewerContext
  ) as ViewerContextType;

  // State for the internal tree view data
  const [treeView, setTreeView] = useState<TreeData[]>([
    {
      id: "Root",
      name: "Root",
      type: "Root",
      children: [],
    },
  ]);

  // useEffect for updating the tree view
  useEffect(() => {}, [treeView]);

  // useEffect for updating when the scene graph changes
  useEffect(() => {
    if (scene) {
      let tTreeView: any[] = [];
      console.log("Render Tree");
      tTreeView.push(convertToTree());
      setTreeView(tTreeView);
    }
  }, [scene]);

  useEffect(() => {
    if (scene) {
      let tTreeView: any[] = [];
      console.log("Render Tree");
      tTreeView.push(convertToTree());
      setTreeView(tTreeView);
    }
  }, [renderTree]);

  // Function for converting the scene graph to a tree for the tree view
  function convertToTree() {
    let sceneGraph = scene.children;
    let tree = {
      id: "Root",
      name: "Root",
      children: [],
    };

    for (let element in sceneGraph) {
      let node = convertToTreeNode(sceneGraph[element]);
      tree.children.push(node);
    }

    return tree;
  }

  // Function for converting an element to a tree node
  function convertToTreeNode(element) {
    let name: string;
    let id: string;
    let type: string = element.type;
    if (element.name) name = element.name;
    else name = element.type;
    id = element.id.toString();
    let node: TreeData = {
      id: id,
      name: name,
      children: [],
      type: type,
    };

    // Add a check to see if the element has any children
    if (element.children.length > 0) {
      let children = [];
      for (let child in element.children) {
        // Add another check to see if the child is an array
        if (Array.isArray(element.children)) {
          let childNode = convertToTreeNode(element.children[child]);
          children.push(childNode);
        }
      }
      node.children = children;
    }
    return node;
  }

  // Function for moving a node in the tree
  function moveNode(args: {
    dragIds: string[];
    dragNodes: NodeApi<any>[];
    parentId: string;
    parentNode: NodeApi<any>;
    index: number;
  }) {
    let dragNode: TreeData = args.dragNodes[0].data;
    let parentNode: TreeData = args.parentNode.data;

    // Recursive function to search for nodes and add to the new parent
    function findAddNode(currentNode: TreeData): boolean {
      if (currentNode === parentNode) {
        currentNode.children = [...currentNode.children, dragNode];
      } else {
        for (let childNode in currentNode.children) {
          if (findAddNode(currentNode.children[childNode])) break;
        }
        return false;
      }
    }

    // Recursive function to search for nodes and remove from the old parent
    function findRemoveNode(currentNode: TreeData): boolean {
      for (let child in currentNode.children) {
        if (currentNode.children[child] === dragNode) {
          currentNode.children.splice(Number(child), 1);
          return true;
        } else {
          if (findRemoveNode(currentNode.children[child])) {
            break;
          }
        }
      }
    }

    // Check if both parents are actually findable?
    if (
      scene.getObjectById(parseInt(dragNode.id)) &&
      scene.getObjectById(parseInt(parentNode.id))
    ) {
      let parentObject: THREE.Object3D = scene.getObjectById(
        parseInt(parentNode.id)
      );
      let childObject: THREE.Object3D = scene.getObjectById(
        parseInt(dragNode.id)
      );
      reparentMesh(childObject, parentObject);
    }
    // if not it has to be attached to the Root
    else if (parentNode.id === "Root") {
      let childObject: THREE.Object3D = scene.getObjectById(
        parseInt(dragNode.id)
      );
      reparentMesh(childObject, scene);
    }

    // First rerender the scene, than update the tree view
    reRenderViewer();
    const newTree = [...treeView];
    findRemoveNode(newTree[0]);
    findAddNode(newTree[0]);
    setTreeView(newTree);
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Arborist.Tree
        data={treeView}
        padding={0}
        rowHeight={30}
        indent={23}
        onMove={moveNode}
      >
        {Node}
      </Arborist.Tree>
    </div>
  );
}

// Defines the appearance and functionality of the individual nodes
function Node({ node, style, dragHandle }: NodeRendererProps<TreeData>) {
  const { scene } = useContext(ViewerContext) as ViewerContextType;

  let object: THREE.Object3D | null = null;
  if (scene) object = scene.getObjectById(parseInt(node.data.id));

  return (
    <div ref={dragHandle} style={style}>
      <Group style={{ flexWrap: "nowrap" }} spacing="xs">
        <FolderArrow node={node} />
        <TreeButton object3D={object} buttonText={node.data.name}></TreeButton>
      </Group>
    </div>
  );
}

// Styling for the appearance if the node has chidlren
function FolderArrow({ node }: { node: NodeApi<TreeData> }) {
  const { scene } = useContext(ViewerContext) as ViewerContextType;

  let object: THREE.Object3D | null = null;
  if (scene) object = scene.getObjectById(parseInt(node.data.id));

  let icon;
  let caret;
  if (node.isOpen && node.data.children.length > 0)
    caret = (
      <ActionIcon onClick={() => node.isInternal && node.toggle()}>
        <CaretDown />
      </ActionIcon>
    );
  else if (!node.isOpen && node.data.children.length > 0)
    caret = (
      <ActionIcon onClick={() => node.isInternal && node.toggle()}>
        <CaretRight />
      </ActionIcon>
    );
  else
    caret = (
      <Space style={{ paddingRight: "20px", marginRight: "5px" }} w="xl" />
    );
  if (node.data.type === "Mesh") icon = <Hexagon3d />;
  else if (node.data.type === "GridHelper") icon = <GridDots />;
  else if (node.data.type === "DirectionalLight") icon = <Lamp />;
  return (
    <Group spacing="xs" style={{ gap: "0px" }}>
      {caret}
      <NodeButtonShow object3D={object} node={node} />
      {/* <ActionIcon >{icon}</ActionIcon> */}
    </Group>
  );
}
