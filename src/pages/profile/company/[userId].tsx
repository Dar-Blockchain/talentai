'use client';
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { getProfileById, clearTargetUser } from '@/store/slices/userSlice';

const CompanyProfile: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, error } = useSelector((state: RootState) => state.user.targetUser);
  const currentUserProfile = useSelector((state: RootState) => state.user.connectedUser.profile);
  
  const isOwnProfile = currentUserProfile?._id && profile?._id && currentUserProfile._id === profile._id;

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      dispatch(getProfileById(userId));
    }

    return () => {
      dispatch(clearTargetUser());
    };
  }, [userId, dispatch]);

  return (
    <></>
  );
};

export default CompanyProfile;