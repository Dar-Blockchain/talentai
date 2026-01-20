import { SvgIcon, SvgIconProps } from "@mui/material";

const HourglassIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 14 14"
    >
      <g clipPath="url(#hourglassClip)">
        <path
          d="M0.583984 0.583252H13.4173
             M2.91732 0.583252V3.49992
             C2.91732 5.24992 5.83398 5.387 5.83398 6.99992
             C5.83398 8.61284 2.91732 8.74992 2.91732 10.4999V13.4166
             M11.084 0.583252V3.49992
             C11.084 5.24992 8.16732 5.387 8.16732 6.99992
             C8.16732 8.61284 11.084 8.74992 11.084 10.4999V13.4166
             M0.583984 13.4166H13.4173
             M5.83398 2.62492H8.16732V3.49992
             C8.16732 4.08325 7.00065 4.66659 7.00065 4.66659
             C7.00065 4.66659 5.83398 4.08325 5.83398 3.49992V2.62492Z
             M4.66732 12.2499
             C4.66732 11.0833 7.00065 9.91658 7.00065 9.91658
             C7.00065 9.91658 9.33398 11.0833 9.33398 12.2499V13.4166H4.66732V12.2499Z"
          stroke="currentColor"
          strokeWidth="1.16667"
          fill="none"
        />
      </g>
      <defs>
        <clipPath id="hourglassClip">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </SvgIcon>
  );
};

export default HourglassIcon;
