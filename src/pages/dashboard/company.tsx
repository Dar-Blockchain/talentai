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
  const [filterDialog, setFilterDialog] = useState(false);
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
  const { data, status, error } = useSelector(
    (state: RootState) => state.bid.bids
  );
  const [jobToDelete, setJobToDelete] = useState<string>("");

  const handleFilterApply = async () => {
    if (!selectedJob) {
      setFilterDialog(false);
      return;
    }

    dispatch(fetchJobMatches(selectedJob));
    setFilterDialog(false);
  };

  useEffect(() => {
    dispatch(fetchBids());
  }, [dispatch]);

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

  // Update the filter dialog open handler
  const handleFilterDialogOpen = () => {
    setFilterDialog(true);
    fetchMyJobs(); // Fetch jobs when dialog opens
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

          <FilterDialog
            open={filterDialog}
            onClose={() => setFilterDialog(false)}
            selectedJob={selectedJob}
            onJobChange={handleJobChange}
            onApplyFilter={handleFilterApply}
            onCancel={() => {
              setSelectedJob("");
              setFilterDialog(false);
            }}
            jobs={myJobs}
            isLoadingJobs={isLoadingJobs}
            jobsError={jobsError}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Box sx={{ flex: 2 }}>
              {!selectedJob ? (
                <MyJobPosts
                  myJobs={myJobs}
                  isLoadingJobs={isLoadingJobs}
                  jobsError={jobsError}
                  displayCount={displayCount}
                  onViewMatches={(jobId) => {
                    setSelectedJob(jobId);
                    handleFilterDialogOpen();
                  }}
                  onDeleteJob={(jobId) => {
                    setJobToDelete(jobId);
                    setDeleteDialogOpen(true);
                  }}
                  onLoadMore={() => setDisplayCount((prev: number) => prev + 3)}
                  onCreateNewJob={() => router.push("/posts/create")}
                  onRefresh={fetchMyJobs}
                  deleteDialogOpen={deleteDialogOpen}
                  isDeleting={isDeleting}
                  jobToDelete={jobToDelete}
                  onCancelDelete={handleCancelDelete}
                  onConfirmDelete={() => handleDeleteJob(jobToDelete)}
                />
              ) : (
                <StyledCard>
                  <MatchingProfiles
                    matchingProfiles={matchingProfiles}
                    isLoadingMatches={isLoadingMatches}
                    matchError={matchError}
                    displayCount={displayCount}
                    selectedJob={selectedJob}
                    onRetry={handleFilterApply}
                    onBackToJobs={() => setSelectedJob("")}
                    onCreateNewJob={() => router.push("/posts/create")}
                    onLoadMore={() => setDisplayCount((prev) => prev + 3)}
                    onBidDialogOpen={handleBidDialogOpen}
                  />
                </StyledCard>
              )}
            </Box>
          </Box>

          {/* Bid History Section */}
          <BidHistory
            bids={data}
            status={status}
            error={error}
            onPostNewJob={() => router.push("/posts/create")}
          />
          
          {/* HR Agents Section */}
          {profile?._id && (
            <HRAgentsTable companyId={profile._id} />
          )}
          
          {/* Add Bid Dialog */}
          <AddBidDialog
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            selectedCandidate={selectedCandidate}
            selectedJob={selectedJob}
            companyId={profile?.userId?._id || ''}
          />
          {/* Company Profiles & Assessments Section */}
          <CompanyProfilesAssessments profile={profile} />
        </Container>
      </Box>
    </CompanyOnly>
  );
};

export default DashboardCompany;
