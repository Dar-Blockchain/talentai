import { ADMIN_ACCENT } from '@/modules/admin/shared';

const AdminHeader = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex justify-between items-end flex-wrap gap-2 mb-8">
      <div>
        <p className="text-[13px] font-medium text-slate-500 mb-1">Welcome back</p>
        <h1 className="relative pb-3 text-[2rem] font-bold text-slate-900 tracking-tight">
          Admin Dashboard
          <span
            className="absolute bottom-0 left-0 h-1 w-[60px] rounded-full"
            style={{ background: ADMIN_ACCENT }}
          />
        </h1>
      </div>
      <p className="text-[13px] font-medium text-slate-500">{formattedDate}</p>
    </div>
  );
};

export default AdminHeader;
