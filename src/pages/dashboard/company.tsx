import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Box, Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsError,
  selectMyPostsLoading,
  selectMyPostsPagination,
  fetchJobMatches,
  selectJobMatches,
  selectJobMatchesError,
  selectJobMatchesLoading,
  selectJobMatchesPagination,
} from "@/store/slices/postSlice";
import { fetchUnlockedCandidates } from "@/store/slices/candidateSlice";
import { fetchHRAgents } from "@/store/slices/hrAgentsSlice";
import CompanyProfilesAssessments from "@/components/dashboard-company/CompanyProfilesAssessments";
import CompanyInfoHeader from "@/components/dashboard-company/CompanyInfoHeader";
import MatchingProfiles from "@/components/dashboard-company/MatchingProfiles";
import MyJobPosts from "@/components/dashboard-company/MyJobPosts";
import HRAgentsTable from "@/components/dashboard-company/HRAgentsTable";
import Header from "@/components/layout/Header";
import UnlockCandidate from "@/components/dashboard-company/UnlockCandidate";
import UnlockedCandidates from "@/components/dashboard-company/UnlockedCandidates";
import RoleGuard from "@/components/guards/RoleGuard";
import PageContainer from "@/components/layout/PageContainer";

// Update the MatchingCandidate interface
export interface MatchingCandidate {
  candidateId: string;
  name: string;
  firstName: string;
  lastName: string;
  unlockPrice: number;
  email: string;
  targetRole: string;
  score: number;
  finalBid: number;
  unlocked: boolean;
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
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);
  const matchingProfiles = useSelector(selectJobMatches) as MatchingCandidate[];
  const isLoadingMatches = useSelector(selectJobMatchesLoading);
  const matchError = useSelector(selectJobMatchesError);
  const matchesPagination = useSelector(selectJobMatchesPagination);
  const myJobs = useSelector(selectMyPosts);
  const pagination = useSelector(selectMyPostsPagination);
  const unlockedCandidatesData = useSelector((state: any) => state.candidate.unlockedData);
  const [activeSection, setActiveSection] = useState<"jobs" | "unlockedCandidates" | "matches" | "all">("all");

  const [selectedJob, setSelectedJob] = useState("");
  const isLoadingJobs = useSelector(selectMyPostsLoading);
  const jobsError = useSelector(selectMyPostsError);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10); // Set items per page
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");

  // Unlocked candidates state
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [candidatesPerPage] = useState(10);

  // Job matches pagination state
  const [matchesPage, setMatchesPage] = useState(1);
  const [matchesPerPage] = useState(10);

  // Track ongoing fetch to prevent duplicates with timestamp-based deduplication
  const isFetchingMatchesRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Fetch HR agents when profile is loaded (profile fetching is handled by CompanyOnly wrapper)
  useEffect(() => {
    if (profile?._id) {
      dispatch(fetchHRAgents(profile._id));
    }
  }, [dispatch, profile?._id]);

  // Map frontend sort values to backend format
  const mapSortToBackend = (sort: "newest" | "oldest" | "title-asc" | "title-desc") => {
    switch (sort) {
      case "newest":
        return "newest";
      case "oldest":
        return "oldest";
      case "title-asc":
        return "title_asc";
      case "title-desc":
        return "title_desc";
      default:
        return "newest";
    }
  };

  // Fetch job posts via Redux with pagination, search, and sort
const fetchMyJobs = useCallback(
  (
    page = currentPage,
    limit = jobsPerPage,
    search = searchQuery,
    sort = sortBy
  ) => {
    dispatch(
      fetchMyPosts({
        page,
        limit,
        search,
        sort: mapSortToBackend(sort),
      })
    );
  },
  [dispatch, currentPage, jobsPerPage, searchQuery, sortBy]
);

  useEffect(() => {
    fetchMyJobs();
  }, [currentPage, searchQuery, sortBy]); // Refetch when page, search, or sort changes

  // Fetch unlocked candidates via Redux with pagination
  const fetchCandidates = (page = candidatesPage, limit = candidatesPerPage) =>
    dispatch(fetchUnlockedCandidates({ page, limit }));

  useEffect(() => {
    // Only fetch when in unlockedCandidates full view (not in "all" overview)
    if (activeSection === "unlockedCandidates") {
      fetchCandidates();
    }
  }, [candidatesPage, activeSection]); // Refetch when page or section changes


  // Add handler for bid dialog
  const handleBidDialogOpen = (candidate: any) => {
    setSelectedCandidate(candidate);
    setBidDialogOpen(true);
  };

  const handleBidDialogClose = () => {
    setBidDialogOpen(false);
    setSelectedCandidate(null);
  };

  // Memoized callback to prevent duplicate API calls
  const handleViewMatches = useCallback((jobId: string) => {
    const now = Date.now();

    // Prevent duplicate calls within 1000ms or if already fetching
    if (isFetchingMatchesRef.current) {
      console.log('⚠️ Already fetching, skipping duplicate call');
      return;
    }

    if (now - lastFetchTimeRef.current < 1000) {
      console.log('⚠️ Called too soon (within 1s), skipping duplicate call');
      return;
    }

    console.log('✅ Initiating fetchJobMatches for job:', jobId);
    lastFetchTimeRef.current = now;
    isFetchingMatchesRef.current = true;

    setSelectedJob(jobId);
    setMatchesPage(1);

    dispatch(fetchJobMatches({ selectedJobId: jobId, page: 1, limit: matchesPerPage }))
      .finally(() => {
        // Reset the flag after completion
        setTimeout(() => {
          isFetchingMatchesRef.current = false;
          console.log('🔓 Fetch lock released');
        }, 500);
      });
  }, [dispatch, matchesPerPage]);

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <PageContainer>
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
          <Header />
          <CompanyInfoHeader companyProfile={profile} companyUser={user}/>
          {!selectedJob ? (
            <MyJobPosts
              myJobs={myJobs}
              isLoadingJobs={isLoadingJobs}
              jobsError={jobsError}
              onViewMatches={handleViewMatches}
              onRefresh={fetchMyJobs}
              pagination={activeSection === "all" ? undefined : pagination}
              onPageChange={(page) => setCurrentPage(page)}
              onSearchChange={(search) => setSearchQuery(search)}
              onSortChange={(sort) => setSortBy(sort)}
              searchQuery={searchQuery}
              sortBy={sortBy}
              onViewAll={() => setActiveSection("jobs")}
              onBackToAll={() => setActiveSection("all")}
              hidden={activeSection !== "all" && activeSection !== "jobs"}
              showViewAll={activeSection === "all"}
              initialDisplayCount={3}
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
              currentPage={matchesPage}
              totalPages={matchesPagination.totalPages}
              onPageChange={(page) => {
                setMatchesPage(page);
                dispatch(fetchJobMatches({ selectedJobId: selectedJob, page, limit: matchesPerPage }));
              }}
            />
          )}

          {/* Only show when activeSection is "all" or "unlockedCandidates" */}
          {(activeSection === "all" || activeSection === "unlockedCandidates") && (
            <UnlockedCandidates
              onViewAll={() => setActiveSection("unlockedCandidates")}
              onBackToAll={() => setActiveSection("all")}
              hidden={activeSection !== "all" && activeSection !== "unlockedCandidates"}
              showViewAll={activeSection === "all"}
              initialDisplayCount={3}
              pagination={activeSection === "all" ? undefined : unlockedCandidatesData.pagination}
              onPageChange={(page) => setCandidatesPage(page)}
            />
          )}

          {/* HR Agents Section - Only show when activeSection is "all" */}
          {/* {activeSection === "all" && profile?._id && <HRAgentsTable companyId={profile._id} />} */}

          {/* Add Bid Dialog */}
          <UnlockCandidate
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            selectedCandidate={selectedCandidate}
            selectedJob={selectedJob}
            companyId={user?._id || ""}
          />

          {/* Company Profiles & Assessments Section - Only show when activeSection is "all" */}
          {activeSection === "all" && <CompanyProfilesAssessments />}
      </PageContainer>
    </RoleGuard>
  );
};

export default DashboardCompany;
