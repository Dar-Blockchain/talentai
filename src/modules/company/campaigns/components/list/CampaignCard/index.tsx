import React, { memo } from "react";
import Link from "next/link";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Campaign, CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { useCampaignCard } from "./useCampaignCard";
import CardTopRow from "./CardTopRow";
import CardInfo from "./CardInfo";
import CardProgress from "./CardProgress";
import CardChips from "./CardChips";
import CardFooterCompany from "./CardFooterCompany";
import CardFooterEmployee from "./CardFooterEmployee";

interface CampaignCardProps {
  campaign: Campaign;
  /** Card click destination. Defaults to `/company/campaigns/{id}`. */
  href?: string;
  /** Swaps the top badge and footer between the company-management look and the employee/participant look. */
  variant?: "company" | "employee";
  onDelete?: (id: string, title: string) => void;
  onStatusChange?: (id: string, title: string, currentStatus: Campaign["status"], targetStatus: CampaignStatus) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
  /** Employee variant: called when the participant clicks Start/Continue (stops the card-level navigation). */
  onStart?: (id: string) => void;
  /** Employee variant: called when the participant clicks "Show Results" (stops the card-level navigation). */
  onShowResults?: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = memo(({
  campaign, href, variant = "company",
  onDelete, onStatusChange, canDelete = true, canPublish = true, onStart, onShowResults,
}) => {
  const data = useCampaignCard(campaign, variant, canPublish, canDelete);

  return (
    <Link href={href ?? `/company/campaigns/${campaign._id}`} className="h-full block">
      <Card
        className="gap-0 py-0 rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 border-border/60"
        style={{ fontFamily: '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif' }}
      >

        <div className="flex-1 flex flex-col gap-3 pt-[18px] px-[18px] pb-4">
          <CardTopRow
            campaign={campaign}
            data={data}
            canDelete={canDelete}
            canPublish={canPublish}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
          <CardInfo campaign={campaign} />
          <CardProgress campaign={campaign} data={data} />
          <CardChips campaign={campaign} />
        </div>

        {data.isEmployee
          ? <CardFooterEmployee campaign={campaign} data={data} onStart={onStart} onShowResults={onShowResults} />
          : <CardFooterCompany campaign={campaign} data={data} />}
      </Card>
    </Link>
  );
});

CampaignCard.displayName = "CampaignCard";
export default CampaignCard;
