import React, { useEffect } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CategoryIcon from "@mui/icons-material/Category";
import GroupsIcon from "@mui/icons-material/Groups";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchTokenBalance,
  selectTokenBalance,
  selectTokenLoading,
} from "@/store/slices/tokenSlice";
import TokenBalanceCard from "./TokenBalanceCard";
import Image from "next/image";

// Styled Components
const ProfileHeader = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 1)",
  color: "#000000",
  padding: "35px 30px",
  marginBottom: theme.spacing(6),
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
  maxWidth: '228px', 
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
  profile: any;
}

const CompanyInfoHeader: React.FC<CompanyInfoHeaderProps> = ({ profile }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const tokenBalance = useSelector(selectTokenBalance);
  const tokenLoading = useSelector(selectTokenLoading);

  // Fetch token balance on component mount and when returning from payment
  useEffect(() => {
    dispatch(fetchTokenBalance());
  }, [dispatch]);

  // Refresh balance if returning from payment page
  useEffect(() => {
    const { refreshBalance } = router.query;
    if (refreshBalance === "true") {
      dispatch(fetchTokenBalance());
      // Clean up the query parameter
      router.replace("/dashboard/company", undefined, { shallow: true });
    }
  }, [router.query, dispatch, router]);

  const handleBuyTokens = () => {
    router.push("/payment");
  };

  const handleRefreshBalance = async () => {
    await dispatch(fetchTokenBalance());
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
                (profile?.companyDetails?.name ||
                  profile?.userId?.username ||
                  "C")?.[0]
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
                  {profile?.companyDetails?.name || "Company Name"}
                </Typography>
                {profile?.userId?.isVerified && (
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
                {profile?.userId?.email || "company@contact.com"}
              </Typography>
            </Box>
          </Box>
          <GradientButton
            onClick={() => router.push("/posts/create")}
            startIcon={<AddIcon />}
          >
            Post Job
          </GradientButton>
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
            <Box sx={{    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column'}}>
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
                {profile?.companyDetails?.industry || "Technology"}
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
            <Box sx={{    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column'}}>              <Typography
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
                {profile?.companyDetails?.size?.replace(' employees', '') || "11 - 50"}
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
            <Box sx={{    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column'}}>              <Typography
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
                {profile?.companyDetails?.location || "On-site"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ProfileHeader>
  );
};

export default CompanyInfoHeader;
