import { useState } from "react";
import { Box } from "@mui/material";
import PostDescription from "./PostDescription";
import PostPreview from "./PostPreview";

const PostDetailsStep = () => {
  const [generating, setGenerating] = useState(false);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
        alignItems: "stretch",
      }}
    >
      <PostDescription onGeneratingChange={setGenerating} />
      <PostPreview generating={generating} />
    </Box>
  );
};

export default PostDetailsStep;
