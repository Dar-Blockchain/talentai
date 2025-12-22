import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCreationType } from "@/store/slices/postGenerationSlice";
import PostDescription from "./PostDescription";
import PostPreview from "./PostPreview";
import ManualPostForm from "./ManualPostForm";

const PostDetailsStep = () => {
  const creationType = useSelector(selectCreationType);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        bgcolor: "white",
        minHeight: "100vh",
        mb: 3,
      }}
    >
      {creationType === "ai" && (
        <>
          {/* LEFT SECTION */}
          <PostDescription />

          {/* RIGHT SECTION */}
          <PostPreview />
        </>
      )}

      {creationType === "manual" && <ManualPostForm />}
    </Box>
  );
};

export default PostDetailsStep;
