"use client";

import React, { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/modules/shared/ui/shadcn/breadcrumb";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItemType[];
  actions?: ReactNode;
  icon?: React.ElementType;
  accentColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  icon: Icon,
  accentColor = "#0D9488",
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
      {/* Left: breadcrumbs + title + subtitle */}
      <div className="flex items-center gap-4">
        {/* Optional icon box */}
        {Icon && (
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}12`, border: `1.5px solid ${accentColor}25` }}
          >
            <Icon size={24} color={accentColor} />
          </div>
        )}

        <div>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-1">
              <BreadcrumbList className="flex-nowrap gap-1 text-[11.5px] sm:gap-1">
                <BreadcrumbItem>
                  <Home size={11} color="#9CA3AF" />
                </BreadcrumbItem>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator>
                      <ChevronRight size={12} color="#D1D5DB" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink asChild className="text-[11.5px] font-medium text-gray-400 transition-colors">
                          <Link
                            href={item.href}
                            style={{ ["--hover-color" as string]: accentColor } as React.CSSProperties}
                            className="hover:[color:var(--hover-color)]"
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-[11.5px] font-semibold text-gray-700">{item.label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {/* Title */}
          {title && (
            <p className="text-[20px] font-extrabold leading-[1.2] text-gray-900">{title}</p>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-1 text-[13px] leading-[1.5] text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
