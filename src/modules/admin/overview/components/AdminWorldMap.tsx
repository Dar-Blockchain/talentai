import WorldMap from './WorldMap';

const AdminWorldMap = ({ userLocations, totalUsers }: { userLocations: any[]; totalUsers: number }) => (
  <div className="mb-4">
    <WorldMap userLocations={userLocations} totalUsers={totalUsers} />
  </div>
);

export default AdminWorldMap;
