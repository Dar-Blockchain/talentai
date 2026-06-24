"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/modules/shared/ui/shadcn/drawer";
import CandidateQuickNav from "./CandidateQuickNav";

interface CandidateNavDrawerProps {
  /** Render prop — receives the trigger element to place wherever needed */
  trigger?: (open: () => void) => React.ReactNode;
}

const CandidateNavDrawer: React.FC<CandidateNavDrawerProps> = ({ trigger }) => {
  const { t } = useTranslation("dashboard");
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-9 w-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {t("candidate.nav.navigation")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <CandidateQuickNav onNavigate={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CandidateNavDrawer;
