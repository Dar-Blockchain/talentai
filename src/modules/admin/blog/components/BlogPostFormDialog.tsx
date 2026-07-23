import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import { ImagePlus, X as RemoveIcon } from "lucide-react";
import { emitToast } from "@/utils/toastEmitter";
import { resolveUploadUrl } from "@/utils/resolveUploadUrl";
import { adminBlogApi } from "../api";
import { useCreateBlogPostMutation, useUpdateBlogPostMutation } from "../queries";
import { AdminBlogPost, BlogPostStatus } from "../types";
import BlogEditor from "./BlogEditor";

interface BlogPostFormDialogProps {
  open: boolean;
  post: AdminBlogPost | null;
  onClose: () => void;
}

const lbl = "block text-[12px] font-semibold text-slate-600 mb-1.5";
const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] text-slate-700 outline-none focus:border-teal-400 transition-colors bg-white";

const emptyForm = {
  title_en: "", title_fr: "",
  excerpt_en: "", excerpt_fr: "",
  content_en: "", content_fr: "",
  coverImage_en: "", coverImage_fr: "",
  status: "draft" as BlogPostStatus,
};

type FormState = typeof emptyForm;

interface CoverImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

const CoverImageField: React.FC<CoverImageFieldProps> = ({ label, value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminBlogApi.uploadImage(file);
      onChange(resolveUploadUrl(url));
    } catch (err) {
      emitToast({ message: err instanceof Error ? err.message : "Failed to upload image.", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={lbl}>{label}</label>
      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveUploadUrl(value)} alt="Cover" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-600 hover:bg-white"
          >
            <RemoveIcon size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-300 hover:text-teal-500 transition-colors"
        >
          <ImagePlus size={22} />
          <span className="text-[13px]">{uploading ? "Uploading…" : "Click to upload a cover image"}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleSelected} />
    </div>
  );
};

const BlogPostFormDialog: React.FC<BlogPostFormDialogProps> = ({ open, post, onClose }) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [lang, setLang] = useState<"en" | "fr">("en");

  const createMutation = useCreateBlogPostMutation();
  const updateMutation = useUpdateBlogPostMutation();
  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setLang("en");
      setForm(post
        ? {
          title_en: post.title_en || "", title_fr: post.title_fr || "",
          excerpt_en: post.excerpt_en || "", excerpt_fr: post.excerpt_fr || "",
          content_en: post.content_en || "", content_fr: post.content_fr || "",
          coverImage_en: post.coverImage_en || "", coverImage_fr: post.coverImage_fr || "",
          status: post.status,
        }
        : emptyForm);
    }
  }, [open, post]);

  const handleSubmit = (status: BlogPostStatus) => {
    if (!form.title_en.trim() && !form.title_fr.trim()) {
      emitToast({ message: "Add a title in at least one language.", severity: "error" });
      return;
    }
    const input = {
      title_en: form.title_en.trim(), title_fr: form.title_fr.trim(),
      excerpt_en: form.excerpt_en, excerpt_fr: form.excerpt_fr,
      content_en: form.content_en, content_fr: form.content_fr,
      coverImage_en: form.coverImage_en, coverImage_fr: form.coverImage_fr,
      status,
    };
    const onSuccess = () => {
      emitToast({ message: status === "published" ? "Post published." : "Post saved as draft.", severity: "success" });
      onClose();
    };
    const onError = (err: unknown) => emitToast({ message: err instanceof Error ? err.message : "Failed to save post.", severity: "error" });

    if (post) updateMutation.mutate({ id: post._id, input }, { onSuccess, onError });
    else createMutation.mutate(input, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-[18px] font-semibold text-slate-900">{post ? "Edit blog post" : "New blog post"}</h2>

        <div className="space-y-4 mt-2">
          <Tabs value={lang} onValueChange={(v) => setLang(v as "en" | "fr")}>
            <TabsList>
              <TabsTrigger value="en">
                English {form.title_en.trim() && <span className="ml-1 size-1.5 rounded-full bg-teal-500" />}
              </TabsTrigger>
              <TabsTrigger value="fr">
                Français {form.title_fr.trim() && <span className="ml-1 size-1.5 rounded-full bg-teal-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="space-y-4 mt-3">
              <CoverImageField
                label="Cover image (English)"
                value={form.coverImage_en}
                onChange={(url) => setForm((f) => ({ ...f, coverImage_en: url }))}
              />
              <div>
                <label className={lbl}>Title (English)</label>
                <input
                  className={inp}
                  placeholder="How AI is changing recruitment"
                  value={form.title_en}
                  onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                />
              </div>
              <div>
                <label className={lbl}>Excerpt <span className="text-slate-400 font-normal">(shown on the blog list card)</span></label>
                <textarea
                  className={`${inp} min-h-[64px] resize-none`}
                  placeholder="A short summary of the post…"
                  value={form.excerpt_en}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))}
                />
              </div>
              <div>
                <label className={lbl}>Content</label>
                <BlogEditor content={form.content_en} onChange={(html) => setForm((f) => ({ ...f, content_en: html }))} />
              </div>
            </TabsContent>

            <TabsContent value="fr" className="space-y-4 mt-3">
              <CoverImageField
                label="Image de couverture (Français)"
                value={form.coverImage_fr}
                onChange={(url) => setForm((f) => ({ ...f, coverImage_fr: url }))}
              />
              <div>
                <label className={lbl}>Titre (Français)</label>
                <input
                  className={inp}
                  placeholder="Comment l'IA transforme le recrutement"
                  value={form.title_fr}
                  onChange={(e) => setForm((f) => ({ ...f, title_fr: e.target.value }))}
                />
              </div>
              <div>
                <label className={lbl}>Extrait <span className="text-slate-400 font-normal">(affiché sur la carte de la liste)</span></label>
                <textarea
                  className={`${inp} min-h-[64px] resize-none`}
                  placeholder="Un court résumé de l'article…"
                  value={form.excerpt_fr}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt_fr: e.target.value }))}
                />
              </div>
              <div>
                <label className={lbl}>Contenu</label>
                <BlogEditor content={form.content_fr} onChange={(html) => setForm((f) => ({ ...f, content_fr: html }))} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="max-w-[220px]">
            <label className={lbl}>Status</label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as BlogPostStatus }))}>
              <SelectTrigger className="w-full text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={saving} variant="ghost">Cancel</Button>
          <Button onClick={() => handleSubmit("draft")} disabled={saving} variant="outline">Save as draft</Button>
          <Button onClick={() => handleSubmit("published")} disabled={saving} variant="default" className="shadow-none">
            {saving ? "Saving…" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostFormDialog;
