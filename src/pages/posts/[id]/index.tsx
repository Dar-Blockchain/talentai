import React, { useEffect } from "react";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { fetchJobById } from "@/store/slices/postSlice";
import { Box, Button, Container } from "@mui/material";
import HeaderDashboard from "@/components/HeaderDashboard";
import { ArrowBack } from "@mui/icons-material";
import PostBasicDetails from "@/components/posts/details/PostBasicDetails";

const PostDetails: React.FC = () => {

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
    }
  }, [id, dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "rgba(251, 254, 255, 1)",
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <HeaderDashboard />
        <Button
            startIcon={
              <ArrowBack
                sx={{
                  color: "#10b981",
                  transition: "transform 0.2s easeIn",
                }}
              />
            }
            onClick={() => router.back()}
            sx={{
              mt: 2,
              textTransform: "none",
              px: 0,
              color: "#111827",
              "&:hover": {
                background: "transparent",
                transform: "scale(1.05)",
              },
            }}
          >
            Back
          </Button>
          <Box sx={{p: 2, border: '1px solid rgba(238, 240, 242, 1)', borderRadius: '12px', background: 'rgba(255, 255, 255, 1)'}}>
            <PostBasicDetails/>
          </Box>
      </Container>
    </Box>
  );
};

export default PostDetails;