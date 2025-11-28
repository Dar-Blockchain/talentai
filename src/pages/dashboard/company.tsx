import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Box, Container, Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchBids } from "@/store/slices/bidSlice";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsError,
  selectMyPostsLoading,
  fetchJobMatches,
  selectJobMatches,
  selectJobMatchesError,
  selectJobMatchesLoading,
  deletePost,
  selectDeletePostLoading,
} from "@/store/slices/postSlice";
import { fetchHRAgents } from "@/store/slices/hrAgentsSlice";
import CompanyOnly from "@/components/CompanyOnly";
import CompanyProfilesAssessments from "@/components/dashboard-company/CompanyProfilesAssessments";
import BidHistory from "@/components/dashboard-company/BidHistory";
import CompanyInfoHeader from "@/components/dashboard-company/CompanyInfoHeader";
import AddBidDialog from "@/components/dashboard-company/AddBidDialog";
import FilterDialog from "@/components/dashboard-company/FilterDialog";
import MatchingProfiles from "@/components/dashboard-company/MatchingProfiles";
import MyJobPosts from "@/components/dashboard-company/MyJobPosts";
import HRAgentsTable from "@/components/dashboard-company/HRAgentsTable";
import HeaderDashboard from "@/components/HeaderDashboard";
import UnlockCandidate from "@/components/dashboard-company/UnlockCandidate";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: "white",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid #EEF0F2",
}));

// Update the MatchingCandidate interface
interface MatchingCandidate {
  candidateId: {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    role: string;
  };
  name: string;
  firstName: string;
  lastName: string;
  score: number;
  finalBid: number;
  matchedSkills: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
    _id: string;
    ScoreTest?: number;
  }>;
  requiredSkills: Array<{
    name: string;
    level: string;
    importance: string;
    category: string;
    _id: string;
  }>;
}

const DashboardCompany = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile);
  const matchingProfiles = useSelector(selectJobMatches) as MatchingCandidate[];
  const isLoadingMatches = useSelector(selectJobMatchesLoading);
  const matchError = useSelector(selectJobMatchesError);
  const myJobs = useSelector(selectMyPosts);
  const [selectedJob, setSelectedJob] = useState("");
  const isLoadingJobs = useSelector(selectMyPostsLoading);
  const jobsError = useSelector(selectMyPostsError);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isDeleting = useSelector(selectDeletePostLoading);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [jobToDelete, setJobToDelete] = useState<string>("");

  // Fetch HR agents when profile is loaded (profile fetching is handled by CompanyOnly wrapper)
  useEffect(() => {
    if (profile?._id) {
      dispatch(fetchHRAgents(profile._id));
    }
  }, [dispatch, profile?._id]);

  // Fetch job posts via Redux
  const fetchMyJobs = () => dispatch(fetchMyPosts());

  // Add handler for job selection
  const handleJobChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedJob(event.target.value);
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  // MatchingProfiles component handles this now

  const handleDeleteJob = async (jobId: string) => {
    await dispatch(deletePost(jobId));
    setDeleteDialogOpen(false);
    setJobToDelete("");
    // Refresh list to be safe
    fetchMyJobs();
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setJobToDelete("");
  };

  // Add handler for bid dialog
  const handleBidDialogOpen = (candidate: any) => {
    setSelectedCandidate(candidate);
    setBidDialogOpen(true);
  };

  const handleBidDialogClose = () => {
    setBidDialogOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <CompanyOnly>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgba(251, 254, 255, 1)",
          py: 2,
        }}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Container maxWidth="lg">
          <HeaderDashboard />
          <CompanyInfoHeader profile={profile} />
          {!selectedJob ? (
            <MyJobPosts
              myJobs={myJobs}
              isLoadingJobs={isLoadingJobs}
              jobsError={jobsError}
              onViewMatches={(jobId) => {
                setSelectedJob(jobId);
                dispatch(fetchJobMatches(jobId));
              }}
              onDeleteJob={(jobId) => {
                setJobToDelete(jobId);
                setDeleteDialogOpen(true);
              }}
              onRefresh={fetchMyJobs}
              deleteDialogOpen={deleteDialogOpen}
              isDeleting={isDeleting}
              onCancelDelete={handleCancelDelete}
              onConfirmDelete={() => handleDeleteJob(jobToDelete)}
            />
          ) : (
            <MatchingProfiles
              matchingProfiles={matchingProfiles}
              isLoadingMatches={isLoadingMatches}
              matchError={matchError}
              displayCount={displayCount}
              selectedJob={selectedJob}
              onBackToJobs={() => setSelectedJob("")}
              onLoadMore={() => setDisplayCount((prev) => prev + 3)}
              onBidDialogOpen={handleBidDialogOpen}
            />
          )}

          {/* HR Agents Section */}
          {profile?._id && <HRAgentsTable companyId={profile._id} />}

          {/* Add Bid Dialog */}
          <UnlockCandidate
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            selectedCandidate={selectedCandidate}
            selectedJob={selectedJob}
            companyId={profile?.userId?._id || ""}
          />
          {/* Company Profiles & Assessments Section */}
          <CompanyProfilesAssessments profile={profile} />
        </Container>
      </Box>
    </CompanyOnly>
  );
};

export default DashboardCompany;
