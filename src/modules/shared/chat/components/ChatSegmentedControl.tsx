import React from "react";
import { Box, Typography } from "@mui/material";
import { chatSegmentedControlSx } from "@/modules/shared/chat/styles/segmentedControl";

export interface ChatSegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface ChatSegmentedControlProps<T extends string> {
  value: T;
  options: ChatSegmentedOption<T>[];
  onChange: (value: T) => void;
}

function ChatSegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: ChatSegmentedControlProps<T>) {
  return (
    <Box sx={chatSegmentedControlSx.root}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            onClick={() => onChange(option.value)}
            sx={{
              ...chatSegmentedControlSx.item,
              ...(isActive ? chatSegmentedControlSx.itemActive : {}),
            }}
          >
            <Typography component="span" sx={chatSegmentedControlSx.label}>
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default ChatSegmentedControl;
