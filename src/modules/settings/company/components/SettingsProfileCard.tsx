import React, { useRef, useState, useEffect } from "react";
import { MapPin, Users, UploadCloud } from "lucide-react";
import { UserProfile } from "@/types/profile";
import SectionCard from "@/components/ui/SectionCard";
import { Spinner } from "@/modules/settings/shared/components";
import { TEAL, TEAL_BORDER } from "@/modules/settings/shared/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";

interface SettingsProfileCardProps {
  profile: UserProfile;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

const SettingsProfileCard: React.FC<SettingsProfileCardProps> = ({ profile, uploadingImage, onImageUpload, readOnly = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    onImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <SectionCard>
      <div className="flex flex-col items-center text-center py-2 gap-3">
        <div
          onDragOver={readOnly ? undefined : (e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={readOnly ? undefined : () => setDragOver(false)}
          onDrop={readOnly ? undefined : handleDrop}
          onClick={readOnly ? undefined : () => fileInputRef.current?.click()}
          className={`group relative w-[72px] h-[72px] rounded-full border-2 transition-colors ${readOnly ? "cursor-default border-solid" : "cursor-pointer border-dashed"}`}
          style={{ borderColor: dragOver ? TEAL : TEAL_BORDER }}
        >
          {uploadingImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <Spinner size={24} />
            </div>
          ) : (
            <Avatar className="w-full h-full rounded-full ring-[3px] ring-teal-200">
              <AvatarImage src={profile.avatar || undefined} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-full bg-teal-600 text-white font-extrabold text-[26px]">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          {!readOnly && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "rgba(13,148,136,0.7)" }}
            >
              <UploadCloud size={22} className="text-white" />
            </div>
          )}
        </div>

        {!readOnly && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageUpload} />}

        <div>
          <p className="text-sm font-bold text-gray-900">{displayName}</p>
          <p className="text-[11px] text-gray-500">{profile.email}</p>
        </div>

        <div className="flex gap-1.5 flex-wrap justify-center">
          {profile.location && (
            <span className="inline-flex items-center gap-1 text-[10px] h-5 px-2 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
              <MapPin size={11} />
              {profile.location}
            </span>
          )}
          {(profile.size || profile.companySize) && (
            <span className="inline-flex items-center gap-1 text-[10px] h-5 px-2 rounded-full bg-gray-100 text-gray-500">
              <Users size={11} />
              {profile.size || profile.companySize}
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default SettingsProfileCard;
