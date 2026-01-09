import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

const UserIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 22 22"
      sx={{
        fontSize: 22,
        ...props.sx,
      }}
    >
      <path
        d="M10.9987 9.1672C13.0237 9.1672 14.6654 7.52557 14.6654 5.50053C14.6654 3.47548 13.0237 1.83386 10.9987 1.83386C8.97365 1.83386 7.33203 3.47548 7.33203 5.50053C7.33203 7.52557 8.97365 9.1672 10.9987 9.1672Z"
        fill="currentColor"
      />
      <path
        d="M18.3346 16.0411C18.3346 18.3191 18.3346 20.1661 11.0013 20.1661C3.66797 20.1661 3.66797 18.3191 3.66797 16.0411C3.66797 13.7632 6.95147 11.9161 11.0013 11.9161C15.0511 11.9161 18.3346 13.7632 18.3346 16.0411Z"
        fill="currentColor"
        opacity={0.5}
      />
    </SvgIcon>
  );
};

export default UserIcon;
