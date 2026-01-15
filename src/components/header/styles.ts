export const appBarStyle = {
  backgroundColor: "transparent",
  boxShadow: "none",
  // height: "50px",
  py: 1.7,
};

export const toolbarStyle = {
  justifyContent: "space-between",
  height: "50px",
  minHeight: "50px!important",
  paddingLeft: "0!important",
  paddingRight: "0!important",
};

export const desktopMenuStyle = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  height: "50px",
  "@media (max-width:750px)": {
    display: "none",
  },
};

export const containerStyle = {
  maxWidth: 1300,
  mx: "auto",
  width: "100%",
  height: "100%",
};