import { Box } from "@mui/material";
import PostDescription from "./PostDescription";
import PostPreview from "./PostPreview";

const PostDetailsStep = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
        alignItems: "stretch",
      }}
    >
      <PostDescription />
      <PostPreview />
    </Box>
  );
};

export default PostDetailsStep;
