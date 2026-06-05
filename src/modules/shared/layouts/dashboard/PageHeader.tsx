import React, { ReactNode } from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title:         string;
  subtitle?:     string;
  breadcrumbs?:  BreadcrumbItem[];
  actions?:      ReactNode;
  icon?:         React.ElementType;
  accentColor?:  string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, breadcrumbs = [], actions, icon: Icon, accentColor = "#6AD39C",
}) => (
  <div
    className={[
      "relative overflow-hidden mb-6 border border-gray-200 rounded-2xl pl-9 pr-6 py-5 shadow-sm shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4",
      Icon ? "bg-gradient-to-r from-[#EDFAF3]/40 via-white to-white" : "bg-white",
    ].join(" ")}
  >
    {/* Left brand gradient accent bar */}
    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-brand-gradient" />

    <div className="flex items-center gap-4">
      {Icon && (
        <div
          className="size-[52px] rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
          style={{ backgroundColor: `${accentColor}12`, borderColor: `${accentColor}25` }}
        >
          <Icon style={{ fontSize: 24, color: accentColor }} />
        </div>
      )}
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1" aria-label="breadcrumb">
            <Home className="size-[11px] text-gray-400" />
            {breadcrumbs.map((item, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="size-[11px] text-gray-300" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-[11.5px] font-medium text-gray-400 transition-colors hover:text-[#6AD39C]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[11.5px] font-semibold text-gray-700">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {title    && <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{title}</h1>}
        {subtitle && <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>

    {actions && (
      <div className="flex items-center gap-3 shrink-0">{actions}</div>
    )}
  </div>
);

export default PageHeader;
