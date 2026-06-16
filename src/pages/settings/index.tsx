import SettingsShell from "@/modules/settings/shared/components/SettingsShell";
import { getSettingsLayout } from "@/modules/settings/shared/components/SettingsLayout";
import type { NextPageWithLayout } from "@/pages/_app";

const SettingsPage: NextPageWithLayout = function SettingsPage() {
  return <SettingsShell />;
};
SettingsPage.getLayout = getSettingsLayout;

export default SettingsPage;
