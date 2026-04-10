export interface Step {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

export const STEPS: Step[] = [
  { target: "center", position: "center", title: "Welcome to TalentAI 👋", description: "Let's walk you through the platform in about a minute. We'll cover every feature so you can start hiring smarter right away." },
  { target: "center", position: "center", title: "Dashboard 📊", description: "Your home base. At a glance you can see:\n\n• Active Job Posts & Campaigns\n• Total Applicants across all posts\n• Interview activity over the last 30 days\n• Applications Over Time & per Job Post charts\n• Top-performing job posts by candidate score" },
  { target: "[data-tour='nav-posts']", position: "right", title: "Job Posts", description: "Create and manage your open positions here.\n\n• Hit '+ New Job Post' to launch the creation wizard\n• Choose manual entry or let the AI generate the post for you\n• Draft posts can be resumed any time from where you left off\n• Once live, edit is disabled once candidates have passed interview" },
  { target: "[data-tour='nav-applications']", position: "right", title: "Applications", description: "Every candidate who applied across all your posts lands here.\n\n• Filter by name, skill, or specific job post\n• See CV score, current status, and applied date at a glance\n• Click any card to open the full candidate profile and take action" },
  { target: "[data-tour='nav-interviews']", position: "right", title: "Interviews", description: "Track all AI-powered candidate assessments.\n\n• View scores, AI report, and pipeline stage for each candidate\n• Filter by status: Pending, Completed, Passed, Failed\n• Click a card to see the full interview transcript and analysis" },
  { target: "[data-tour='nav-campaigns']", position: "right", title: "Campaigns", description: "Automate your hiring pipeline end-to-end.\n\n• Create a campaign to bundle a job post with an interview flow\n• Set automatic invite emails, reminders, and deadlines\n• Track completion rates and candidate progress in real time" },
  { target: "[data-tour='nav-departments']", position: "right", title: "Departments & Employees", description: "Organise your company structure.\n\n• Create departments and assign team members\n• Members can access their own interview dashboards\n• Useful for multi-team hiring across the organisation" },
  { target: "[data-tour='nav-settings']", position: "right", title: "Settings — Company Info", description: "Keep your company profile complete and up-to-date.\n\n• Company name, email, industry and size\n• Required experience level for posted roles\n• A complete profile builds trust with candidates browsing your listings" },
  { target: "[data-tour='settings-tab-contact']", position: "bottom", title: "Settings — Contact & Presence", description: "Tell candidates where you are and how to find you.\n\n• Country / location and employment type (Remote, On-site, Hybrid)\n• LinkedIn company page and website URL\n• These appear on your public company profile" },
  { target: "[data-tour='settings-tab-apikeys']", position: "bottom", title: "Settings — API Keys", description: "Integrate TalentAI with your own tools and services.\n\n• Create a key with a name, service identifier, and permission scopes\n• Set a rate limit (requests per second) and an expiry date\n• Toggle keys on/off or regenerate them at any time\n• The plain key is shown only once at creation — copy it immediately" },
  { target: "[data-tour='header-chat']", position: "bottom", title: "Messaging 💬", description: "Chat directly with candidates.\n\nNew message notifications appear here as candidates respond to interview invites or reach out directly." },
  { target: "[data-tour='header-notif']", position: "bottom", title: "Notifications 🔔", description: "All important events appear here:\n\n• Interview completions and scores\n• New applications on your posts\n• Pipeline status changes\n• System alerts and reminders\n\nClick 'View all notifications' to see the full history." },
  { target: "center", position: "center", title: "You're all set! 🎉", description: "That covers everything on TalentAI. You can replay this tour any time by clicking the Help button in Settings.\n\nGood luck with your hiring!" },
];

export const TOTAL = STEPS.length;
