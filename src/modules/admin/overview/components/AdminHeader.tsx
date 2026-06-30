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
        <p className="text-[13px] font-medium mb-1" style={{ color: '#0D9488' }}>Welcome back</p>
        <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
      </div>
      <p className="text-[13px] font-medium text-slate-500">{formattedDate}</p>
    </div>
  );
};

export default AdminHeader;
