"use client";
import { Box, Tooltip, Typography } from "@mui/material";
import { useCallback } from "react";
import { Node } from "reactflow";
import "reactflow/dist/style.css";
import styled from "@emotion/styled";
import Image from "next/image";

const Sidebar = styled(Box)({
  width: "120px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "5px 10px",
  gap: "15px",
  overflowY: "auto",
});
const ActionButton = styled(Box)<{ actionType: string }>(({ actionType }) => ({
  width: "90px",
  height: "70px",
  borderRadius: "6px",
  border: "1px solid rgba(98, 111, 134, 0.18)",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  gap: "4px",
  boxShadow: "0px 0px 6.1px 0px rgba(0, 0, 0, 0.06)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8fafc",
    transform: "scale(1.05)",
  },
  ...(actionType === "technical" && {
    "& .MuiSvgIcon-root": { color: "#2563eb" },
  }),
  ...(actionType === "soft" && {
    "& .MuiSvgIcon-root": { color: "#7c3aed" },
  }),
  ...(actionType === "interview" && {
    "& .MuiSvgIcon-root": { color: "#059669" },
  }),
  ...(actionType === "task" && {
    "& .MuiSvgIcon-root": { color: "#dc2626" },
  }),
  ...(actionType === "condition" && {
    "& .MuiSvgIcon-root": { color: "#ec4899" },
  }),
  ...(actionType === "email" && {
    "& .MuiSvgIcon-root": { color: "#f59e0b" },
  }),
}));

// Menu items configuration
const menuItems = [
  {
    type: "technical",
    icon: (
      <Image
        src="/icons/technical.svg"
        alt="technical"
        width={17}
        height={17}
      />
    ),
    label: "Technical Skills",
    subtitle: "Validate technical skills",
  },
  {
    type: "soft",
    icon: <Image src="/icons/soft.svg" alt="soft" width={17} height={17} />,
    label: "Soft Skills",
    subtitle: "Assess soft skills",
  },
  {
    type: "interview",
    icon: <Image src="/icons/hr.svg" alt="hr" width={17} height={17} />,
    label: "HR Interview",
    subtitle: "Conduct HR interview",
  },
  {
    type: "task",
    icon: <Image src="/icons/task.svg" alt="task" width={17} height={17} />,
    label: "Task Creation",
    subtitle: "Create assessment task",
  },
  {
    type: "condition",
    icon: (
      <Image
        src="/icons/condition.svg"
        alt="condition"
        width={17}
        height={17}
      />
    ),
    label: "Condition",
    subtitle: "Add conditional logic",
  },
  {
    type: "email",
    icon: <Image src="/icons/email.svg" alt="email" width={17} height={17} />,
    label: "Email",
    subtitle: "Send email notification",
  },
];
interface SidebarMenuProps {
  flowWrapper: React.RefObject<HTMLDivElement>;
  nodes: any;
  setNodes: any;
}
const SidebarMenu: React.FC<SidebarMenuProps> = ({
  flowWrapper,
  nodes,
  setNodes,
}) => {
  const addNode = useCallback(
    (type: string) => {
      const menuItem = menuItems.find((item) => item.type === type);

      const lastNode = nodes[nodes.length - 1];

      let newX = 200;
      let newY = 50; // default top padding

      // If FIRST node
      if (!lastNode && flowWrapper.current) {
        const rect = flowWrapper.current.getBoundingClientRect();

        // Center horizontally, up top vertically
        newX = rect.width / 2 - 75; // assuming ~150px node width
        newY = 50;
      }

      // For next nodes → offset
      if (lastNode) {
        newX = lastNode.position.x + 40;
        newY = lastNode.position.y + 40;
      }

      const nodeCount =
        nodes.filter((node) => node.data.type === type).length + 1;

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type: "custom",
        position: { x: newX, y: newY },
        data: {
          label: `${menuItem?.label || type} ${nodeCount}`,
          type,
          subtitle: menuItem?.subtitle,
          config: {
            nodeNumber: nodeCount,
            title: `${menuItem?.label || type} ${nodeCount}`,
            configured: false,
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, menuItems, nodes, flowWrapper]
  );

  return (
    <Sidebar>
      {menuItems.map((item) => {
        return (
          <Tooltip key={item.type} title={item.label} placement="right">
            <ActionButton
              actionType={item.type}
              onClick={() => addNode(item.type)}
            >
              {item.icon}

              <Typography
                variant="caption"
                sx={{
                  fontSize: "10px",
                  fontWeight: 500,
                  textAlign: "center",
                  color: "rgba(32, 45, 57, 1)",
                }}
              >
                {item.label.split(" ")[0]}
              </Typography>
            </ActionButton>
          </Tooltip>
        );
      })}
    </Sidebar>
  );
};

export default SidebarMenu;