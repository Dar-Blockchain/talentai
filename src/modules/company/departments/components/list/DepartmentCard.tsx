import React, { useMemo } from "react";
import { motion }         from "framer-motion";
import { useTranslation } from "react-i18next";
import { Building2, Pencil, Trash2, Calendar, ChevronRight, MoreVertical } from "lucide-react";
import { Department }     from "../../types";
import { Button }         from "@/modules/shared/ui/shadcn/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import Link from "next/link";

const PALETTE = [
  { accent: "#6AD39C", bg: "#EDFAF3" },
  { accent: "#2563EB", bg: "#EFF6FF" },
  { accent: "#BD85FF", bg: "#F5F3FF" },
  { accent: "#EA580C", bg: "#FFF7ED" },
  { accent: "#DB2777", bg: "#FDF2F8" },
  { accent: "#16A34A", bg: "#F0FDF4" },
];

function formatCardDate(iso: string, locale: string) {
  const loc = locale.startsWith("fr") ? "fr-FR" : "en-US";
  return new Date(iso).toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

export interface DepartmentCardProps {
  department: Department;
  index:      number;
  onEdit:     (dept: Department) => void;
  onDelete:   (dept: Department) => void;
  canManage?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department, index, onEdit, onDelete, canManage = true,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const { accent, bg } = PALETTE[index % PALETTE.length];
  const createdLabel = useMemo(
    () => formatCardDate(department.createdAt, i18n.language),
    [department.createdAt, i18n.language],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="h-full"
    >
      <div
        className="relative bg-white border border-gray-200 rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group"
        style={{ ['--accent' as string]: accent }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />

        <div className="p-5 pl-6 flex-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="size-10 rounded-xl shrink-0 flex items-center justify-center border"
                style={{ backgroundColor: bg, borderColor: `${accent}30` }}
              >
                <Building2 className="size-5" style={{ color: accent }} />
              </div>
              <p className="text-[15px] font-bold text-gray-900 truncate leading-tight">
                {department.name}
              </p>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-xs" variant="ghost"
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={e => { e.stopPropagation(); onEdit(department); }}
                    className="gap-2.5 text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                  >
                    <div className="size-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Pencil className="size-3 text-blue-600" />
                    </div>
                    {t("pages.departments.card.menu_edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={e => { e.stopPropagation(); onDelete(department); }}
                    className="gap-2.5 text-destructive focus:text-destructive focus:bg-red-50"
                  >
                    <div className="size-6 rounded-md bg-red-50 border border-red-100 flex items-center justify-center">
                      <Trash2 className="size-3 text-destructive" />
                    </div>
                    {t("pages.departments.card.menu_delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-[12.5px] text-gray-500 leading-relaxed flex-1 line-clamp-2">
            {department.description || t("pages.departments.card.no_description")}
          </p>
        </div>

        <div className="px-5 pl-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 text-gray-400" />
            <span className="text-[11px] text-gray-400">{createdLabel}</span>
          </div>
          <Link href={`/company/departments/${department._id}`}>
            <Button size="xs" variant="outline">
              {t("pages.departments.card.view")}
              <ChevronRight className="size-3" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;
