"use client";
import { Box, Button, Tooltip } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import { nodeTypes } from "./CustomNode";
import NodeConfigurationModal from "./NodeConfigurationModal";
import SidebarMenu from "./SidebarMenu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setFlowEdges, setFlowNodes } from "@/store/slices/postSlice";
import { generateDefaultPipelineNodes } from "@/utils/postHelpers";

const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.default),
  { ssr: false }
);
const MiniMap = dynamic(() => import("reactflow").then((mod) => mod.MiniMap), {
  ssr: false,
});
const Controls = dynamic(
  () => import("reactflow").then((mod) => mod.Controls),
  { ssr: false }
);
const Background = dynamic(
  () => import("reactflow").then((mod) => mod.Background),
  { ssr: false }
);

const RecruitmentFlowStep = () => {
  const dispatch = useDispatch<AppDispatch>();

  const flowWrapper = useRef<HTMLDivElement | null>(null);
  const defaultPipeline = useMemo(() => generateDefaultPipelineNodes(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultPipeline.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultPipeline.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodes(selectedNodes);
    },
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map((node) => node.id);

    // Remove nodes
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));

    // Remove connected edges
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      )
    );

    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  useEffect(() => {
    console.log("Nodes updated:", nodes);
    dispatch(setFlowNodes(nodes));
  }, [nodes]);

  useEffect(() => {
    console.log("Edges updated:", edges);
    dispatch(setFlowEdges(edges));
  }, [edges]);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", pt: 2 }}>
      <SidebarMenu
        flowWrapper={flowWrapper}
        nodes={nodes}
        setNodes={setNodes}
      />
      <Box
        sx={{
          display: "flex",
          jutifyContent: "center",
          flex: 1,
          height: "600px",
          width: "900px",
          mx: "auto",
        }}
        ref={flowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{
            position: "relative",
            borderRadius: "12px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            boxShadow: "0px 0px 8.7px 0px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Controls />
          <MiniMap />
          <Background
            variant={"dots" as any}
            gap={12}
            size={1}
            style={{ backgroundColor: "rgba(75, 88, 101, 0.04)" }}
          />
          {/* Floating Delete Button */}
          {selectedNodes.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Tooltip title={"Or press Delete/Backspace"} placement="bottom">
                <Button
                  variant="contained"
                  startIcon={
                    <Image
                      src="/icons/delete.svg"
                      alt="search"
                      width={20}
                      height={20}
                    />
                  }
                  onClick={deleteSelectedNodes}
                  sx={{
                    borderRadius: "20px",
                    px: 3,
                    border: "1px solid rgba(224, 62, 92, 1)",
                    color: "rgba(224, 62, 92, 1)",
                    backgroundColor: "rgba(224, 62, 92, 0.08)",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      borderColor: "rgba(224, 62, 92, 1)",
                      boxShadow: "none",
                    },
                  }}
                >
                  Delete {selectedNodes.length} item
                  {selectedNodes.length > 1 ? "s" : ""}
                </Button>
              </Tooltip>
            </Box>
          )}
        </ReactFlow>
      </Box>
      {/* Configuration Modal */}
      <NodeConfigurationModal
        open={modalOpen}
        selectedNode={selectedNode}
        setNodes={setNodes}
        setEdges={setEdges}
        onClose={() => setModalOpen(false)}
        onSelectedNodeChange={setSelectedNode}
        onSelectedNodesChange={setSelectedNodes}
      />
    </Box>
  );
};

export default RecruitmentFlowStep;