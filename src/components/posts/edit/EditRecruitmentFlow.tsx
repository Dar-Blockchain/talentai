"use client";
import { useEffect } from 'react'
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  postRecruitmentSteps,
  selectCurrentJob,
  selectPostStepsLoading,
} from "@/store/slices/postSlice";
import SidebarMenu from "../create/steps/recruitment-flow-step/SidebarMenu";
import { nodeTypes } from "../create/steps/recruitment-flow-step/CustomNode";
import NodeConfigurationModal from "../create/steps/recruitment-flow-step/NodeConfigurationModal";
import { useSelector } from "react-redux";
import {
  buildRecruitmentSteps,
  extractNodesAndEdges,
  generateDefaultPipelineNodes,
} from "@/utils/postHelpers";
import { useToast } from "@/hooks/useToast";

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

interface EditRecruitmentFlowProps {
  onCancel?: () => void;
}

const EditRecruitmentFlow: React.FC<EditRecruitmentFlowProps> = ({
  onCancel,
}) => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectPostStepsLoading)
  
  const { nodes: jobNodes, edges: jobEdges } = extractNodesAndEdges(
    job?.post_Steps || []
  );
  const flowWrapper = useRef<HTMLDivElement | null>(null);
  const defaultPipeline = useMemo(() => generateDefaultPipelineNodes(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    jobNodes?.length ? jobNodes : defaultPipeline.nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    jobEdges?.length ? jobEdges : defaultPipeline.edges
  );
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

  const handleSave = async () => {
    const steps = buildRecruitmentSteps(nodes, edges);
    await dispatch(
      postRecruitmentSteps({
        postId: job?._id,
        steps,
      })
    ).unwrap();
    onCancel();
    showToast({
      message: "Recruitment flow updated. All changes are now active.",
      severity: "success",
    });
  };

  return (
    <>
      {" "}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Title */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(234, 255, 247, 1)",
              width: 45,
              height: 45,
              borderRadius: "5px",
            }}
          >
            <Image src="/icons/edit.svg" alt="file" width={25} height={25} />
          </Box>

          <Box>
            <Typography
              sx={{
                color: "rgba(41, 210, 145, 1)",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              Edit Recruitment Flow
            </Typography>

            <Typography sx={{ fontSize: "12px", color: "#546274" }}>
              Update and fine-tune each step of your recruitment process
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Cancel */}

          <Button
            variant="outlined"
            onClick={() => {
              onCancel();
            }}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(133, 169, 227, 1)",
              textDecoration: "none",
              "&:hover": {
                background: "none",
                textDecoration: "none",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            Cancel
          </Button>

          {/* Save */}
          <Button
            variant="contained"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
            sx={{
              textTransform: "none",
              height: "42px",
              width: "120px",
              maxWidth: "230px",
              borderRadius: "38px",
              background: "rgba(0, 234, 144, 1)",
              color: "white",
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
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
    </>
  );
};

export default EditRecruitmentFlow;
