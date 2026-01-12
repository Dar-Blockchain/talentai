import React from "react";

interface UserOutlineIconProps {
  size?: number;
  color?: string;
}

const UserOutlineIcon: React.FC<UserOutlineIconProps> = ({
  size = 14,
  color = "#626F86",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.9974 5.83342C8.28606 5.83342 9.33073 4.78875 9.33073 3.50008C9.33073 2.21142 8.28606 1.16675 6.9974 1.16675C5.70873 1.16675 4.66406 2.21142 4.66406 3.50008C4.66406 4.78875 5.70873 5.83342 6.9974 5.83342Z"
        stroke={color}
        strokeWidth="0.875"
      />
      <path
        d="M11.6654 10.207C11.6654 11.6566 11.6654 12.832 6.9987 12.832C2.33203 12.832 2.33203 11.6566 2.33203 10.207C2.33203 8.75745 4.42153 7.58203 6.9987 7.58203C9.57587 7.58203 11.6654 8.75745 11.6654 10.207Z"
        stroke={color}
        strokeWidth="0.875"
      />
    </svg>
  );
};

export default UserOutlineIcon;
