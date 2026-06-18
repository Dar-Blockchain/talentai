'use client';
import React from "react";
import { BillingPageContent } from "@/modules/company/billing";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const BillingPage: NextPageWithLayout = function BillingPage() {
  return <BillingPageContent />;
};
BillingPage.getLayout = getDashboardLayout;

export default BillingPage;
