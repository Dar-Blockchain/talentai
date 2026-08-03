import React from "react";
import { Lock as LockOutlined } from "lucide-react";
import Link from "next/link";
import CreatePostPage from "@/modules/company/posts/create/components/CreatePostPage";
import { useCreatePostPage } from "@/modules/company/posts/create/hooks";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const CreatePage: NextPageWithLayout = () => {
  const { postsUsed, postsLimit, atLimit } = useCreatePostPage();

  return (
    <>
      {atLimit ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
            <LockOutlined size={30} color="#EF4444" />
          </div>
          <p className="text-[1.2rem] font-bold text-[#111827]">Post limit reached</p>
          <p className="max-w-[360px] text-[0.9rem] text-[#6B7280]">
            You have used {postsUsed} of {postsLimit} job posts on your current plan. Upgrade your plan to create more posts.
          </p>
          <Link href="/company/plans">
            <button className="mt-1 rounded-[10px] border-none bg-[#0D9488] px-6 py-2.5 text-[0.9rem] font-bold text-white cursor-pointer hover:opacity-90">
              Upgrade Plan
            </button>
          </Link>
        </div>
      ) : (
        <CreatePostPage />
      )}
    </>
  );
};
CreatePage.getLayout = getDashboardLayout;

export default CreatePage;
