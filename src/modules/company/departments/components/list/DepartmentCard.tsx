import React, { useMemo } from "react";
import { motion }         from "framer-motion";
import { useTranslation } from "react-i18next";
import { Building2, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Department }     from "../../types";
import { Button }         from "@/modules/shared/ui/shadcn/button";
import { Card } from "@/modules/shared/ui/shadcn/card";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const createdLabel = useMemo(
    () => formatCardDate(department.createdAt, i18n.language),
    [department.createdAt, i18n.language],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="h-full"
    >
      <Link href={`/company/departments/${department._id}`} className="block h-full">
        <Card
          className={cn(
            "group py-0 gap-0 h-full rounded-lg border-border/70 bg-card",
            "transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5",
          )}
        >
          <div className="p-4 flex items-center gap-3">
            <Building2 className="size-4 text-muted-foreground shrink-0 transition-colors duration-200 group-hover:text-primary" />

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground truncate transition-colors duration-200 group-hover:text-primary">
                {department.name}
              </p>
              <p className="text-[11.5px] text-muted-foreground/80">{createdLabel}</p>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-xs" variant="ghost"
                    className="text-muted-foreground/60 hover:text-foreground shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44" onClick={e => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={e => { e.stopPropagation(); onEdit(department); }}
                    className="gap-2.5"
                  >
                    <Pencil className="size-3.5" />
                    {t("pages.departments.card.menu_edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={e => { e.stopPropagation(); onDelete(department); }}
                    className="gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    {t("pages.departments.card.menu_delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default DepartmentCard;
