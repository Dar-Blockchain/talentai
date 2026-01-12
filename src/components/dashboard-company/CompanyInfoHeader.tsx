import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";
import Image from "next/image";
import AddMemberModal from "./AddMemberModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  addEmployee,
  selectMembers,
  clearAddMemberSuccess,
  MemberRole
} from "@/store/slices/memberSlice";
import { usePermissions } from "@/hooks/usePermissions";

// Styled Components
const ProfileHeader = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 1)",
  color: "#000000",
  padding: "35px 30px",
  marginBottom: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "38px",
  padding: "12px 24px",
  height: 42,
  maxWidth: "228px",
  background: "rgba(77, 217, 163, 1)",
  color: "#ffffff",
  letterSpacing: 0.3,
  boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
  "&:hover": {
    background: "rgba(77, 217, 163, 0.8)",
    boxShadow: "0 4px 12px rgba(16,185,129,0.4)",
  },
}));

interface CompanyInfoHeaderProps {
  companyProfile: any;
  companyUser: any;
}

const CompanyInfoHeader: React.FC<CompanyInfoHeaderProps> = ({ companyProfile, companyUser }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const { sharedAccountId, addMemberSuccess } = useSelector(selectMembers);

  // Get user permissions
  const userId = profile?.userId?._id;
  const profileId = profile?._id;
  const { hasPermission, loading: loadingPermissions } = usePermissions(userId, profileId);

  // Close modal when member is added successfully
  useEffect(() => {
    if (addMemberSuccess) {
      setAddMemberModalOpen(false);
      dispatch(clearAddMemberSuccess());
    }
  }, [addMemberSuccess, dispatch]);

  // Map UI roles to API roles
  const roleMapping: Record<string, MemberRole> = {
    'hr': 'RH',
    'technical_leader': 'TechLead',
    'supervisor': 'Supervisor',
    'manager': 'Manager'
  };

  const handleAddMember = async (email: string, role: string) => {
    const apiRole = roleMapping[role] || 'RH';
    const accountId = sharedAccountId || companyProfile?._id || '';

    if (!accountId) {
      console.error('❌ [CompanyInfoHeader] No account ID found!');
      throw new Error('Account ID not found. Please try again.');
    }

    // Dispatch the add employee action
    const result = await dispatch(addEmployee({
      accountId,
      email,
      role: apiRole
    }));

    // Check if the action was rejected
    if (addEmployee.rejected.match(result)) {
      console.error('❌ [CompanyInfoHeader] addEmployee was rejected:', result.payload);
      throw new Error(result.payload as string || 'Failed to add member');
    }

  };

  return (
    <ProfileHeader>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        {/* Header with Company Info and Post Job Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "#f3f4f6",
                color: "#111827",
                width: 66,
                height: 66,
                fontSize: 24,
                fontWeight: 600,
                border: "2px solid #e5e7eb",
              }}
            >
              {
                (companyProfile?.companyDetails?.name || "C")?.[0]
              }
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    fontSize: "24px",
                    lineHeight: 1,
                    letterSpacing: 0,
                    verticalAlign: "middle",
                    color: "rgba(0, 0, 0, 1)",
                  }}
                >
                  {companyProfile?.companyDetails?.name || "Company Name"}
                </Typography>
                {companyUser?.isVerified && (
                  <CheckCircleIcon
                    sx={{
                      color: "rgba(41, 210, 145, 0.83)",
                      width: 24,
                      height: 24,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: 1,
                  letterSpacing: 0,
                  verticalAlign: "middle",
                  color: "rgba(144, 152, 163, 1)",
                  mt: 0.5,
                }}
              >
                {companyUser?.email || "company@contact.com"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => setAddMemberModalOpen(true)}
              startIcon={<PersonAddIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "38px",
                padding: "12px 24px",
                height: 42,
                background: "linear-gradient(135deg, #8310FF 0%, #a855f7 100%)",
                color: "#ffffff",
                letterSpacing: 0.3,
                boxShadow: "0 2px 8px rgba(131, 16, 255, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6b0fd9 0%, #9333ea 100%)",
                  boxShadow: "0 4px 12px rgba(131, 16, 255, 0.4)",
                },
              }}
            >
              Add Member
            </Button>
            <Tooltip
              title={!hasPermission('canCreateJobPosts') ? "You don't have permission to create job posts" : ""}
              arrow
            >
              <span>
                <GradientButton
                  onClick={() => router.push("/posts/create")}
                  startIcon={<AddIcon />}
                  disabled={loadingPermissions || !hasPermission('canCreateJobPosts')}
                  sx={{
                    opacity: !hasPermission('canCreateJobPosts') ? 0.5 : 1,
                  }}
                >
                  Post Job
                </GradientButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Info Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              background: "rgba(255, 255, 255, 1)",
              padding: 2,
              borderRadius: "8px",
              border: "1px solid rgba(189, 133, 255, 0.18)",
              boxShadow: "0px 0px 18px 0px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "0.25px solid rgba(189, 133, 255, 0.4)",
                background: "rgba(189, 133, 255, 0.04)",
              }}
            >
              <Image
                src="/icons/industry.svg"
                alt="search"
                width={24}
                height={24}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(84, 98, 116, 0.53)",
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: 10,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                INDUSTRY
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(49, 56, 66, 1)",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: 15,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                {companyProfile?.companyDetails?.industry || "Technology"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              background: "rgba(255, 255, 255, 1)",
              padding: 2,
              borderRadius: "8px",
              border: "1px solid rgba(189, 133, 255, 0.18)",
              boxShadow: "0px 0px 18px 0px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "0.25px solid rgba(189, 133, 255, 0.4)",
                background: "rgba(189, 133, 255, 0.04)",
              }}
            >
              <Image
                src="/icons/people.svg"
                alt="search"
                width={24}
                height={24}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              {" "}
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(84, 98, 116, 0.53)",
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: 10,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                COMPANY SIZE
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(49, 56, 66, 1)",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: 15,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                {companyProfile?.companyDetails?.size?.replace(" employees", "") ||
                  "11 - 50"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              background: "rgba(255, 255, 255, 1)",
              padding: 2,
              borderRadius: "8px",
              border: "1px solid rgba(189, 133, 255, 0.18)",
              boxShadow: "0px 0px 18px 0px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "0.25px solid rgba(189, 133, 255, 0.4)",
                background: "rgba(189, 133, 255, 0.04)",
              }}
            >
              <Image
                src="/icons/location2.svg"
                alt="search"
                width={24}
                height={24}
              />{" "}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              {" "}
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(84, 98, 116, 0.53)",
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: 10,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                LOCATION
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(49, 56, 66, 1)",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: 15,
                  lineHeight: "18.78px",
                  letterSpacing: "0px",
                }}
              >
                {companyProfile?.companyDetails?.location || "On-site"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Add Member Modal */}
      <AddMemberModal
        open={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSave={handleAddMember}
      />
    </ProfileHeader>
  );
};

export default CompanyInfoHeader;