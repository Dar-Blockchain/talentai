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
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Function to generate default pipeline nodes with unique IDs
const generateDefaultPipelineNodes = (): { nodes: Node[]; edges: Edge[] } => {
  const timestamp = Date.now();
  const randomSuffix1 = Math.random().toString(36).substr(2, 9);
  const randomSuffix2 = Math.random().toString(36).substr(2, 9);
  const randomSuffix3 = Math.random().toString(36).substr(2, 9);

  const technicalId = `technical_${timestamp}_${randomSuffix1}`;
  const softId = `soft_${timestamp}_${randomSuffix2}`;
  const interviewId = `interview_${timestamp}_${randomSuffix3}`;

  const nodes: Node[] = [
    {
      id: technicalId,
      type: "custom",
      position: { x: 250, y: 50 },
      data: {
        label: "Technical Skills 1",
        type: "technical",
        subtitle: "Validate technical skills",
        config: {
          nodeNumber: 1,
          title: "Technical Skills 1",
          configured: false,
        },
      },
    },
    {
      id: softId,
      type: "custom",
      position: { x: 250, y: 180 },
      data: {
        label: "Soft Skills 1",
        type: "soft",
        subtitle: "Assess soft skills",
        config: {
          nodeNumber: 2,
          title: "Soft Skills 1",
          configured: false,
        },
      },
    },
    {
      id: interviewId,
      type: "custom",
      position: { x: 250, y: 310 },
      data: {
        label: "HR Interview 1",
        type: "interview",
        subtitle: "Conduct HR interview",
        config: {
          nodeNumber: 3,
          title: "HR Interview 1",
          configured: false,
        },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: `edge-${technicalId}-${softId}`,
      source: technicalId,
      target: softId,
      type: "default",
    },
    {
      id: `edge-${softId}-${interviewId}`,
      source: softId,
      target: interviewId,
      type: "default",
    },
  ];

  return { nodes, edges };
};

const RecruitmentFlowStep = () => {
  const dispatch = useDispatch<AppDispatch>();

  const flowWrapper = useRef<HTMLDivElement | null>(null);
  const defaultPipeline = useMemo(() => generateDefaultPipelineNodes(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultPipeline.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultPipeline.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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

    // For condition nodes, don't start with chat - show form directly
    if (node.data.type === "condition") {
      setChatMessages([]);
    } else {
      setChatMessages([
        {
          id: "1",
          text: `Hi! I'm here to help you configure your ${node.data.label} step. What would you like this step to do?`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
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
    dispatch(setFlowNodes(nodes));
  }, [nodes]);

  useEffect(() => {
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
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
      />
    </Box>
  );
};

export default RecruitmentFlowStep;