import React, { useState } from "react";
import { Box } from "@mui/material";
import { Campaign, CampaignModule, CampaignStatus, ModuleType } from "@/types/campaign";
import CampaignHeader from "./CampaignHeader";
import CampaignDetailsCard from "./CampaignDetailsCard";
import CampaignModulesCard from "./CampaignModulesCard";
import CampaignSidebar from "./CampaignSidebar";
import DeleteCampaignDialog from "./DeleteCampaignDialog";
import ConfigureModuleModal from "./configure/ConfigureModuleModal";

interface Props {
  campaign: Campaign;
  onDelete: (id: string, title: string) => void;
  onChangeStatus: (id: string, status: CampaignStatus) => void;
  onSaveModuleConfig?: (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => void;
}

const CampaignDetail: React.FC<Props> = ({
  campaign,
  onDelete,
  onChangeStatus,
  onSaveModuleConfig,
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [configureModuleType, setConfigureModuleType] = useState<ModuleType | null>(null);

  const currentModuleConfig = configureModuleType
    ? (campaign.modules.find((m) => m.type === configureModuleType)?.config ?? null)
    : null;

  const handleSaveConfig = (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => {
    onSaveModuleConfig?.(campaignId, moduleType, config);
    setConfigureModuleType(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <CampaignHeader
        campaign={campaign}
        onChangeStatus={onChangeStatus}
        onDeleteClick={() => setDeleteOpen(true)}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 280px" },
          gap: 1.5,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <CampaignDetailsCard campaign={campaign} />
          <CampaignModulesCard
            modules={campaign.modules}
            onConfigureModule={(type) => setConfigureModuleType(type as ModuleType)}
          />
        </Box>

        <CampaignSidebar campaign={campaign} />
      </Box>

      <DeleteCampaignDialog
        open={deleteOpen}
        campaignTitle={campaign.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete(campaign._id, campaign.title);
        }}
      />

      <ConfigureModuleModal
        open={configureModuleType !== null}
        campaignId={campaign._id}
        moduleType={configureModuleType}
        currentConfig={currentModuleConfig}
        onClose={() => setConfigureModuleType(null)}
        onSave={handleSaveConfig}
      />
    </Box>
  );
};

export default CampaignDetail;
