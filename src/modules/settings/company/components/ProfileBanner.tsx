import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Save, X, UploadCloud, MapPin, Globe, Users, Check } from "lucide-react";
import { Spinner } from "@/modules/settings/shared/components";
import { TEAL } from "@/modules/settings/shared/constants";

interface Props {
  profile: any;
  loading: boolean;
  uploadingImage: boolean;
  isEditing: boolean;
  showEditActions?: boolean;
  onStartEdit: (value: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BannerInfoItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-1">
    {icon}
    <span className="text-[0.75rem] text-gray-500">{text}</span>
  </div>
);

const ProfileBanner: React.FC<Props> = ({ profile, loading, uploadingImage, isEditing, showEditActions = true, onStartEdit, onCancelEdit, onSaveEdit, onImageUpload }) => {
  const { t } = useTranslation("dashboard");
  const [dragOver,    setDragOver]    = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, []);

  const displayName = profile.name || profile.companyName || "Company";
  const initials    = displayName.charAt(0).toUpperCase();

  const stageFile = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) stageFile(file);
  };

  const handleConfirmUpload = () => {
    if (!pendingFile) return;
    const dt = new DataTransfer(); dt.items.add(pendingFile);
    onImageUpload({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
    setPreviewUrl(null); setPendingFile(null);
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setPendingFile(null);
  };

  const isPreviewing = !!previewUrl;

  return (
    <div className="bg-[#FAFAFA] border-b border-gray-200 px-6 md:px-10 py-6">
      <div className="flex items-center gap-5 flex-wrap">

        <div
          onDragOver={(e) => { e.preventDefault(); if (!isPreviewing) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!isPreviewing && !uploadingImage) fileInputRef.current?.click(); }}
          className="group relative flex-shrink-0 w-[72px] h-[72px] rounded-2xl border-[3px] transition-shadow"
          style={{
            borderColor: isPreviewing ? TEAL : "#fff",
            boxShadow: dragOver ? `0 0 0 3px ${TEAL}` : "0 2px 8px rgba(0,0,0,0.1)",
            cursor: isPreviewing || uploadingImage ? "default" : "pointer",
          }}
        >
          {uploadingImage ? (
            <div className="w-full h-full rounded-[13px] flex items-center justify-center bg-teal-50">
              <Spinner size={22} />
            </div>
          ) : (previewUrl || profile.avatar) ? (
            <img
              src={previewUrl || profile.avatar}
              alt={displayName}
              className="w-full h-full rounded-[13px] object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-[13px] flex items-center justify-center text-white font-extrabold text-[28px] bg-teal-600">
              {initials}
            </div>
          )}

          {/* hover-to-upload overlay (hidden when previewing or uploading) */}
          {!isPreviewing && !uploadingImage && (
            <div
              className="absolute inset-0 rounded-[13px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: "rgba(13,148,136,0.6)" }}
            >
              <UploadCloud size={20} className="text-white" />
            </div>
          )}

          {/* confirm / cancel overlay when a file is staged */}
          {isPreviewing && (
            <div className="absolute inset-0 rounded-[13px] bg-black/45 flex items-center justify-center gap-1.5">
              <button
                type="button"
                title={t("pages.settings.banner.confirm_upload") || "Confirm"}
                onClick={handleConfirmUpload}
                className="rounded p-1 text-white hover:opacity-90 bg-teal-600"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                title={t("pages.settings.banner.cancel") || "Cancel"}
                onClick={handleCancelPreview}
                className="rounded p-1 bg-white text-gray-700 hover:bg-gray-100"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

        <div className="flex-1 min-w-0">
          <p className="text-[1.15rem] font-bold text-gray-900 leading-tight">{displayName}</p>
          <div className="flex flex-wrap gap-3 mt-1">
            {profile.email && (
              <BannerInfoItem icon={<Globe size={13} className="text-gray-400" />} text={profile.email} />
            )}
            {profile.location && (
              <BannerInfoItem icon={<MapPin size={13} className="text-gray-400" />} text={profile.location} />
            )}
            {profile.industry && (
              <span className="inline-flex items-center h-5 px-2 rounded-full text-[0.67rem] font-semibold bg-teal-600/[0.08] text-teal-600">
                {profile.industry}
              </span>
            )}
            {(profile.size || profile.companySize) && (
              <BannerInfoItem icon={<Users size={13} className="text-gray-400" />} text={`${profile.size || profile.companySize} ${t("pages.settings.employees_suffix")}`} />
            )}
          </div>
        </div>

        {showEditActions && (
          <div className="flex gap-2 flex-shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold rounded-[9px] px-4 py-1.5 transition-colors text-teal-600 border border-teal-200 bg-teal-50"
              >
                <Pencil size={14} />
                {t("pages.settings.banner.edit_profile")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold rounded-[9px] px-3 py-1.5 text-gray-500 border border-gray-200"
                >
                  <X size={14} />
                  {t("pages.settings.banner.cancel")}
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold rounded-[9px] px-4 py-1.5 text-white transition-colors bg-teal-600"
                >
                  {loading ? (
                    <Spinner size={14} className="border-white/40 border-t-white" />
                  ) : (
                    <>
                      <Save size={14} />
                      {t("pages.settings.banner.save")}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileBanner;
