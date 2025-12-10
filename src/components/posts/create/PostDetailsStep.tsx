import { Box } from "@mui/material";
import PostDescription from "./components/PostDescription";
import PostPreview from "./components/PostPreview";

const PostDetailsStep = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        bgcolor: "white",
        minHeight: "100vh",
        mb: 3
      }}
    >
      {/* LEFT SECTION */}
      <PostDescription />
      
      {/* RIGHT SECTION */}
      <PostPreview />
    </Box>
  );
};

export default PostDetailsStep;
