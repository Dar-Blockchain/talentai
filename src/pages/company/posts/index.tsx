import React, { useEffect, useRef } from "react";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { PostsPageContent } from "@/modules/company/posts";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const PostsPage: NextPageWithLayout = () => {

  const pageId = useRef(Math.random().toString(36).slice(2, 8));

useEffect(() => {
  console.log(`POSTS PAGE MOUNT ${pageId.current}`);

  return () => {
    console.log(`POSTS PAGE UNMOUNT ${pageId.current}`);
  };
}, []);
  useCompanyAccess("canViewJobPosts");
  return <PostsPageContent />;
};
PostsPage.getLayout = getDashboardLayout;

export default PostsPage;
