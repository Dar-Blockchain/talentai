import React from 'react';
import dynamic from 'next/dynamic';
import type { WorldMapComponentProps } from './WorldMapComponent';

// Dynamically import the entire map component with SSR disabled (leaflet
// needs a real DOM/window, so it can't render on the server).
const WorldMapComponent = dynamic<WorldMapComponentProps>(
  () => import('./WorldMapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <span className="text-[1.1rem] font-semibold text-slate-500">Loading map...</span>
      </div>
    )
  }
);

interface UserLocation {
  country: string;
  count: number;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    Localisation?: string;
  }>;
}

interface WorldMapProps {
  userLocations: UserLocation[];
  totalUsers: number;
}

const getMarkerColor = (count: number) => {
  if (count >= 20) return '#4F46E5';
  if (count >= 10) return '#6366F1';
  if (count >= 5) return '#A5B4FC';
  if (count >= 1) return '#E0E7FF';
  return '#F1F5F9';
};

const getMarkerRadius = (count: number) => {
  if (count >= 20) return 12;
  if (count >= 10) return 10;
  if (count >= 5) return 8;
  if (count >= 1) return 6;
  return 4;
};

const WorldMap: React.FC<WorldMapProps> = ({ userLocations, totalUsers }) => (
  <WorldMapComponent
    userLocations={userLocations}
    totalUsers={totalUsers}
    getMarkerColor={getMarkerColor}
    getMarkerRadius={getMarkerRadius}
  />
);

export default WorldMap;
