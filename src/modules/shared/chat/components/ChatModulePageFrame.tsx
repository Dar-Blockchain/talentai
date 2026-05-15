import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { chatModulePageSx } from "@/modules/shared/chat/styles/modulePage";
import { companyChatSx } from "@/modules/shared/chat/styles/companyChat";

interface ChatModulePageFrameProps {
  title: string;
  /** Omitted or empty = no subtitle row (chat-focused layouts). */
  subtitle?: string;
  /** Shown before the title (e.g. icon tile). */
  titleStartAdornment?: React.ReactNode;
  headerAside?: React.ReactNode;
  /** Full-width row inside body card, above children (e.g. Messages / Colleagues). */
  bodyTopBar?: React.ReactNode;
  fillHeight?: boolean;
  /** With `fillHeight`, fill dashboard flex column instead of vh-based `rootFillViewport`. */
  expandToParentHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  /** Tighter padding / gap so borders sit closer to chat content. */
  dense?: boolean;
  children: React.ReactNode;
}

const ChatModulePageFrame: React.FC<ChatModulePageFrameProps> = ({
  title,
  subtitle,
  titleStartAdornment,
  headerAside,
  bodyTopBar,
  fillHeight = false,
  expandToParentHeight = false,
  embeddedInCompanyHub = false,
  dense = false,
  children,
}) => {
  const bodyPaperSx = {
    ...chatModulePageSx.bodyPaper,
    ...(dense
      ? {
          px: { xs: 0.75, sm: 1 },
          pt: { xs: 0.75, sm: 1 },
          pb: { xs: 0.5, sm: 0.75 },
        }
      : {}),
  };

  if (embeddedInCompanyHub) {
    const embeddedRootSx = fillHeight
      ? { ...chatModulePageSx.root, ...chatModulePageSx.rootFill, gap: 0 }
      : { ...chatModulePageSx.root, gap: 0 };

    const toolbarSx = dense
      ? { ...companyChatSx.toolbar, px: 1.25, py: 0.75, gap: 1 }
      : companyChatSx.toolbar;

    const bodyTopBarSx = dense
      ? {
          flexShrink: 0,
          mx: { xs: -0.75, sm: -1 },
          mt: { xs: -0.75, sm: -1 },
          px: { xs: 0.75, sm: 1 },
          pt: { xs: 0.5, sm: 0.75 },
          pb: { xs: 0.75, sm: 1 },
          borderBottom: "1px solid #F3F4F6",
          bgcolor: "#FCFCFD",
        }
      : {
          flexShrink: 0,
          px: 2,
          py: 1.25,
          borderBottom: "1px solid #F3F4F6",
          bgcolor: "#FCFCFD",
        };

    return (
      <Box sx={embeddedRootSx}>
        <Paper elevation={0} sx={bodyPaperSx}>
          {headerAside && (
            <Box sx={toolbarSx}>
              {headerAside}
            </Box>
          )}
          {bodyTopBar ? <Box sx={bodyTopBarSx}>{bodyTopBar}</Box> : null}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {children}
          </Box>
        </Paper>
      </Box>
    );
  }

  const standaloneRootSx =
    fillHeight && expandToParentHeight
      ? {
          display: "flex",
          flexDirection: "column",
          gap: dense ? 1 : 2,
          ...chatModulePageSx.rootFill,
        }
      : fillHeight
        ? { ...chatModulePageSx.root, ...chatModulePageSx.rootFillViewport, ...(dense ? { gap: 1 } : {}) }
        : { ...chatModulePageSx.root, ...(dense ? { gap: 1 } : {}) };

  const headerPaperSx = {
    ...chatModulePageSx.headerPaper,
    ...(dense ? { px: 1.5, py: 1.25 } : {}),
    ...(headerAside
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: dense ? 1.25 : 2,
          flexWrap: "wrap",
        }
      : {}),
  };

  const hasSubtitle = Boolean(subtitle?.trim());
  const titleTypographySx = {
    ...chatModulePageSx.title,
    ...(dense ? chatModulePageSx.titleDense : {}),
  };

  const titleBlock = titleStartAdornment ? (
    <Box
      sx={{
        display: "flex",
        alignItems: hasSubtitle ? "flex-start" : "center",
        gap: dense ? 1.25 : 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(hasSubtitle ? { mt: 0.25 } : {}),
        }}
      >
        {titleStartAdornment}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h1" sx={titleTypographySx}>
          {title}
        </Typography>
        {hasSubtitle ? <Typography sx={chatModulePageSx.subtitle}>{subtitle}</Typography> : null}
      </Box>
    </Box>
  ) : (
    <Box>
      <Typography component="h1" sx={titleTypographySx}>
        {title}
      </Typography>
      {hasSubtitle ? <Typography sx={chatModulePageSx.subtitle}>{subtitle}</Typography> : null}
    </Box>
  );

  const standaloneBodyTopBarSx = dense
    ? {
        flexShrink: 0,
        mx: { xs: -0.75, sm: -1 },
        mt: { xs: -0.75, sm: -1 },
        px: { xs: 0.75, sm: 1 },
        pt: { xs: 0.5, sm: 0.75 },
        pb: { xs: 0.75, sm: 1 },
        borderBottom: "1px solid #F3F4F6",
        bgcolor: "#FCFCFD",
      }
    : {
        flexShrink: 0,
        px: 2.5,
        py: 1.5,
        borderBottom: "1px solid #F3F4F6",
        bgcolor: "#FCFCFD",
      };

  return (
    <Box sx={standaloneRootSx}>
      <Paper elevation={0} sx={headerPaperSx}>
        {titleBlock}
        {headerAside}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          ...bodyPaperSx,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {bodyTopBar ? <Box sx={standaloneBodyTopBarSx}>{bodyTopBar}</Box> : null}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatModulePageFrame;
