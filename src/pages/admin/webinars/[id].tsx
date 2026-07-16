import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Menu as MenuIcon } from "lucide-react";
import { AdminSidebar } from "@/modules/admin/shared";
import { useLogout } from "@/modules/auth/shared/hooks";

const WebinarDetailPage = dynamic(() => import("@/modules/admin/webinars").then((m) => m.WebinarDetailPage));

const AdminWebinarDetailPage = () => {
  const router = useRouter();
  const handleLogout = useLogout("/signin");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const id = router.query.id as string | undefined;

  const handleTabChange = (tab: string) => {
    router.push({ pathname: "/admin/dashboard", query: { tab } });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <AdminSidebar
        activeTab="webinars"
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />

      <main className="flex flex-col flex-1 min-h-screen p-2 sm:p-4 md:p-8">
        <div className="flex items-center mb-4 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MenuIcon />
          </button>
          <span className="text-[1.05rem] font-bold text-teal-600">TalentAI Admin</span>
        </div>

        <div className="w-full max-w-[1600px] mx-auto">
          {id && <WebinarDetailPage id={id} />}
        </div>
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(AdminWebinarDetailPage), { ssr: false });
