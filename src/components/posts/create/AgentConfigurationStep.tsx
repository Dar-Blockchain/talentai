import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import AgentConfigurationForm, {
  AgentConfigurationFormValues,
} from "./components/AgentConfigurationForm";
import { Box } from "@mui/material";
import { updateCreateConfigValue } from "@/store/slices/agentConfigSlice";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";

const AgentConfigurationStep = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedPost } = useSelector((state: any) => state.post.savePost);
  const { data: createdAgent } = useSelector(
    (state: any) => state.hrAgents.createdAgent
  );
  const agentConfig = useSelector(
    (state: any) => state.agentConfig.createConfig.value
  );

  useEffect(() => {
    if (savedPost?.jobData?._id) {
      dispatch(updateCreateConfigValue({ postId: savedPost.jobData._id }));
    }
  }, [savedPost?.jobData?._id]);

  useEffect(() => {
    if (createdAgent?._id) {
      dispatch(updateCreateConfigValue({ agentId: createdAgent._id }));
    }
  }, [createdAgent]);

  const handleAgentConfigChange = useCallback(
    (update: Partial<AgentConfigurationFormValues>) => {
      dispatch(updateCreateConfigValue(update));
    },
    []
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        p: 3,
        bgcolor: "white",
        minHeight: "100vh",
        mb: 3,
      }}
    >
      <AgentConfigurationForm
        value={agentConfig}
        onChange={handleAgentConfigChange}
      />
    </Box>
  );
};

export default AgentConfigurationStep;
