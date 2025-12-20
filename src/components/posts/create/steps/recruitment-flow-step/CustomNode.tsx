"use client";
import { Box, Typography } from "@mui/material";
import { NodeTypes, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getNodeStyle = (type: string) => {
    switch (type) {
      case "technical":
        return {
          backgroundColor: "rgba(252, 249, 255, 1)",
          borderColor: "rgba(189, 133, 255, 1)",
          color: "rgba(189, 133, 255, 1)",
        };
      case "soft":
        return {
          backgroundColor: "rgba(255, 252, 247, 1)",
          borderColor: "rgba(250, 180, 70, 1)",
          color: "rgba(250, 180, 70, 1)",
        };
      case "interview":
        return {
          backgroundColor: "rgba(248, 255, 253, 1)",
          borderColor: "rgba(98, 172, 155, 1)",
          color: "rgba(98, 172, 155, 1)",
        };
      case "task":
        return {
          backgroundColor: "rgba(255, 249, 249, 1)",
          borderColor: "rgba(200, 65, 75, 1)",
          color: "rgba(200, 65, 75, 1)",
        };
      case "condition":
        return {
          backgroundColor: "rgba(245, 243, 255, 1)",
          borderColor: "rgba(94, 77, 178, 1)",
          color: "rgba(94, 77, 178, 1)",
        };
      case "email":
        return {
          backgroundColor: "rgba(254, 255, 246, 1)",
          borderColor: "rgba(165, 190, 0, 1)",
          color: "rgba(165, 190, 0, 1)",
        };
      default:
        return {
          backgroundColor: "#f1f5f9",
          borderColor: "#64748b",
          color: "#475569",
        };
    }
  };

  const style = getNodeStyle(data.type);

  return (
    <Box
      sx={{
        padding: "12px 16px",
        borderRadius: "10px",
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
        minWidth: "167px",
        minHeight: "93px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: selected ? `0 0 0 3px ${style.borderColor}` : "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Connection handles - larger and more visible */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: style.borderColor,
          width: 12,
          height: 12,
          border: "2px solid white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />

      {/* Condition nodes have two output handles (Yes/No) */}
      {data.type === "condition" ? (
        <>
          {/* YES label */}
          <Typography
            sx={{
              position: "absolute",
              bottom: -2, // slightly above handle
              left: "24%", // aligns with YES handle
              transform: "translateY(-100%)",
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(41, 210, 145, 0.83)",
              pointerEvents: "none",
            }}
          >
            YES
          </Typography>

          {/* NO label */}
          <Typography
            sx={{
              position: "absolute",
              bottom: -2,
              left: "64%", // aligns with NO handle
              transform: "translateY(-100%)",
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(221, 0, 4, 0.83)",
              pointerEvents: "none",
            }}
          >
            NO
          </Typography>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{
              background: "rgba(41, 210, 145, 0.83)",
              width: 12,
              height: 12,
              border: "2px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              left: "30%",
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{
              background: "rgba(221, 0, 4, 0.83)",
              width: 12,
              height: 12,
              border: "2px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              left: "70%",
            }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: style.borderColor,
            width: 12,
            height: 12,
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontSize: "12px", fontWeight: 600 }}
        >
          {data.label}
        </Typography>
        {data.config?.configured && (
          <Box
            sx={{
              width: 8,
              height: 8,
              backgroundColor: "#10b981",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {data.subtitle && (
        <Typography
          variant="caption"
          sx={{
            mb: 0.5,
            color: "rgba(75, 88, 101, 1)",
            fontSize: "12px",
            fontWeight: 400,
          }}
        >
          {data.subtitle}
        </Typography>
      )}
      {/* Show condition details if configured */}
      {data.type === "condition" &&
        data.config?.field &&
        data.config?.operator &&
        data.config?.value && (
          <Box sx={{ fontSize: "11px", opacity: 0.9, marginBottom: 3 }}>
            <Typography variant="caption">
              {data.config.field} {data.config.operator} {data.config.value}
            </Typography>
          </Box>
        )}

      {!data.config?.configured && (
        <Typography
          variant="caption"
          sx={{
            color: "rgba(250, 180, 70, 1)",
            display: "block",
            fontWeight: 400,
            fontSize: "10px",
          }}
        >
          Not configured
        </Typography>
      )}
    </Box>
  );
};

export const nodeTypes: NodeTypes = {
  custom: CustomNode,
};