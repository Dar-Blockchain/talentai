import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '@/store/slices/profileSlice';
import {
  logout
} from "@/store/slices/authSlice";
import { AppDispatch, RootState } from '@/store/store';
import { 
  Box,
  Container,
  Card,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { signOut } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchBids } from '@/store/slices/bidSlice';
import CompanyOnly from '@/components/CompanyOnly';
import CompanyProfilesAssessments from '@/components/dashboard-company/CompanyProfilesAssessments';
import BidHistory from '@/components/dashboard-company/BidHistory';
import CompanyInfoHeader from '@/components/dashboard-company/CompanyInfoHeader';
import JobDetailsModal from '@/components/dashboard-company/JobDetailsModal';
import AddBidDialog from '@/components/dashboard-company/AddBidDialog';
import DeleteJobPostDialog from '@/components/dashboard-company/DeleteJobPostDialog';
import FilterDialog from '@/components/dashboard-company/FilterDialog';
import MatchingProfiles from '@/components/dashboard-company/MatchingProfiles';
import Navbar from '@/components/dashboard-company/Navbar';
import MyJobPosts from '@/components/dashboard-company/MyJobPosts';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
  }
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
  const [matchingProfiles, setMatchingProfiles] = useState<MatchingCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const { data, status, error } = useSelector((state: RootState) => state.bid.bids);
  const [jobToDelete, setJobToDelete] = useState<string>('');
  // Add new state for company profiles
  const [companyProfiles, setCompanyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  // Add new state for selected assessment
  const [localRequiredSkills, setLocalRequiredSkills] = useState(profile?.requiredSkills || []);
  
  // Add state for job details modal
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);

  const handleFilterApply = async () => {
    if (!selectedJob) {
      setFilterDialog(false);
      return;
    }

    try {
      setIsLoadingMatches(true);
      setMatchError(null);
      const token = Cookies.get('api_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}matching/jobs/${selectedJob}/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matching candidates');
      }

      const data = await response.json();
      if (data.success && data.matches) {
        setMatchingProfiles(data.matches);
      } else {
        setMatchingProfiles([]);
      }
    } catch (error) {
      setMatchError(error instanceof Error ? error.message : 'Failed to fetch matches');
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoadingMatches(false);
      setFilterDialog(false);
    }
  };

  const handleLogout = async () => {
    try {
      // First clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Then clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(fetchBids())
  }, [dispatch]);


  // Add function to fetch job posts
  const fetchMyJobs = async () => {
    const token = Cookies.get('api_token');
    setIsLoadingJobs(true);
    setJobsError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setMyJobs(data.data || []);
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

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
    setIsDeleting(true);
    try {
      const token = Cookies.get('api_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/deletePost/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchMyJobs();
        setDeleteDialogOpen(false);
        setJobToDelete('');
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setJobToDelete('');
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



  // Add function to fetch company profiles
  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem('api_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getCompanyWithAssessments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company profiles');
      }

      const data = await response.json();
      setCompanyProfiles(data);
    } catch (error) {
      setProfilesError('Failed to fetch company profiles');
      console.error('Error fetching company profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Add useEffect to fetch profiles when component mounts
  useEffect(() => {
    // Only fetch company profiles if user is a company
    if (profile && (profile.userId.role === 'Company' || profile.userId.role === 'company')) {
      fetchCompanyProfiles();
    }
  }, [profile]);


  useEffect(() => {
    setLocalRequiredSkills(profile?.requiredSkills || []);
  }, [profile]);

  // Add handlers for job details modal
  const handleViewJobDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setJobDetailsModalOpen(true);
  };

  const handleCloseJobDetailsModal = () => {
    setJobDetailsModalOpen(false);
    setSelectedJobForDetails(null);
  };

  return (
    <CompanyOnly>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: 'white',

        py: 2,
      }}>
        {/* Navbar */}
        <Navbar profile={profile} onLogout={handleLogout} />

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
          <FilterDialog
            open={filterDialog}
            onClose={() => setFilterDialog(false)}
            selectedJob={selectedJob}
            onJobChange={handleJobChange}
            onApplyFilter={handleFilterApply}
            onCancel={() => {
              setSelectedJob('');
              setFilterDialog(false);
            }}
            jobs={myJobs}
            isLoadingJobs={isLoadingJobs}
            jobsError={jobsError}
          />
          <CompanyInfoHeader
            profile={profile}
            localRequiredSkills={localRequiredSkills}
          />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

            <Box sx={{ flex: 2 }}>
              {!selectedJob ? (
                <MyJobPosts
                  myJobs={myJobs}
                  isLoadingJobs={isLoadingJobs}
                  jobsError={jobsError}
                  displayCount={displayCount}
                  onViewJobDetails={handleViewJobDetails}
                  onViewMatches={(jobId) => {
                    setSelectedJob(jobId)
                    handleFilterDialogOpen()
                  }}
                  onDeleteJob={(jobId) => {
                    setJobToDelete(jobId)
                    setDeleteDialogOpen(true)
                  }}
                  onLoadMore={() => setDisplayCount((prev: number) => prev + 3)}
                  onCreateNewJob={() => router.push('/posts/create')}
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
                    onBackToJobs={() => setSelectedJob('')}
                    onCreateNewJob={() => router.push('/posts/create')}
                    onLoadMore={() => setDisplayCount(prev => prev + 3)}
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
            onPostNewJob={() => router.push('/posts/create')}
          />

          {/* Delete Job Post Dialog */}
          <DeleteJobPostDialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            onDelete={() => handleDeleteJob(jobToDelete)}
            isDeleting={isDeleting}
          />

          {/* Add Bid Dialog */}
          <AddBidDialog
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            selectedCandidate={selectedCandidate}
            selectedJob={selectedJob}
          />

          {/* Job Details Modal */}
          <JobDetailsModal
            open={jobDetailsModalOpen}
            onClose={handleCloseJobDetailsModal}
            selectedJobForDetails={selectedJobForDetails}
          />

          {/* Company Profiles & Assessments Section */}
          <CompanyProfilesAssessments
            companyProfiles={companyProfiles}
            isLoadingProfiles={isLoadingProfiles}
            profilesError={profilesError}
          />
        </Container>
      </Box>
    </CompanyOnly>
  );
}

export default DashboardCompany;