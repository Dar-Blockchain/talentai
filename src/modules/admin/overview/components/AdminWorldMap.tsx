import type { ComponentProps } from 'react';
import WorldMap from './WorldMap';
import type { AdminMapUser } from '../types';

// Mirrors WorldMap's own (unexported) UserLocation shape, but with `users`
// typed against the actual data this dashboard fetches (AdminMapUser), which
// doesn't carry username/email — hence the boundary cast when forwarding to
// WorldMap below.
interface UserLocation {
  country: string;
  count: number;
  users: AdminMapUser[];
}

const AdminWorldMap = ({ userLocations, totalUsers }: { userLocations: UserLocation[]; totalUsers: number }) => (
  <div className="mb-4">
    <WorldMap
      userLocations={userLocations as unknown as ComponentProps<typeof WorldMap>['userLocations']}
      totalUsers={totalUsers}
    />
  </div>
);

export default AdminWorldMap;
