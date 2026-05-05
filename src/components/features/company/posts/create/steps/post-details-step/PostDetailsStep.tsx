import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCreationType } from "@/store/slices/postGenerationSlice";
import PostDescription from "./PostDescription";
import PostPreview from "./PostPreview";
import ManualPostForm from "./ManualPostForm";

const PostDetailsStep = () => {
  const creationType = useSelector(selectCreationType);

  if (creationType === "manual") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <ManualPostForm />
      </Box>
    );
  }

  // AI: side-by-side input + preview
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
