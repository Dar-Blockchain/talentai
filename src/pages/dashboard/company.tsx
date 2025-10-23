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
import Navbar from "@/components/dashboard-company/Navbar";
import MyJobPosts from "@/components/dashboard-company/MyJobPosts";
import HRAgentsTable from "@/components/dashboard-company/HRAgentsTable";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: "white",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 25px rgba(0,0,0,0.3)",
  },
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
  const [displayCount, setDisplayCount] = useState(3); // For job posts pagination
  const [candidatesPerPage] = useState(3); // Candidates per page
  const [currentCandidatesPage, setCurrentCandidatesPage] = useState(1); // Current page for candidates
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
    dispatch(getMyProfile());
    dispatch(fetchBids());
    // Fetch HR agents when profile is loaded
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

  // Calculate pagination data for candidates
  const totalCandidatesPages = Math.ceil(matchingProfiles.length / candidatesPerPage);
  const startIndex = (currentCandidatesPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = matchingProfiles.slice(startIndex, endIndex);

  // Handle page change for candidates
  const handleCandidatesPageChange = (page: number) => {
    setCurrentCandidatesPage(page);
  };

  return (
    <CompanyOnly>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "white",
          py: 2,
        }}
      >
        {/* Navbar */}

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
          {/* Filter Dialog */}
          <Navbar profile={profile} />

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
          <CompanyInfoHeader profile={profile} />

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
                  deleteDialogOpen={deleteDialogOpen}
                  isDeleting={isDeleting}
                  jobToDelete={jobToDelete}
                  onCancelDelete={handleCancelDelete}
                  onConfirmDelete={() => handleDeleteJob(jobToDelete)}
                />
              ) : (
                <StyledCard>
                  <MatchingProfiles
                    matchingProfiles={currentCandidates}
                    isLoadingMatches={isLoadingMatches}
                    matchError={matchError}
                    displayCount={candidatesPerPage}
                    selectedJob={selectedJob}
                    onRetry={handleFilterApply}
                    onBackToJobs={() => setSelectedJob("")}
                    onCreateNewJob={() => router.push("/posts/create")}
                    onLoadMore={() => {}} // Not used with pagination
                    onBidDialogOpen={handleBidDialogOpen}
                    currentPage={currentCandidatesPage}
                    totalPages={totalCandidatesPages}
                    onPageChange={handleCandidatesPageChange}
                    totalCandidates={matchingProfiles.length}
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
          />
          {/* Company Profiles & Assessments Section */}
          <CompanyProfilesAssessments profile={profile} />
        </Container>
      </Box>
    </CompanyOnly>
  );
};

export default DashboardCompany;
