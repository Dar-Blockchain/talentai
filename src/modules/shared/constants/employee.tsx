import {
  Users,
  Code2,
  UserCog,
  ShieldCheck,
  Trophy,
  Settings,
  Landmark,
  Megaphone,
  Package,
  GitBranch,
  Laptop,
  Database,
  Blocks,
  Smartphone,
  Wrench,
  BarChart3,
  Bug,
  ShieldAlert,
  PenTool,
  Paintbrush,
  UserPlus,
  TrendingUp,
  LineChart,
  Headset,
  Gavel,
  BadgeCheck,
  ClipboardList,
  CircleUserRound,
  FlaskConical,
  Truck,
  GraduationCap,
} from 'lucide-react';

const PeopleOutlined = Users;
const CodeOutlined = Code2;
const SupervisorAccountOutlined = UserCog;
const ManageAccountsOutlined = UserCog;
const AdminPanelSettingsOutlined = ShieldCheck;
const EmojiEventsOutlined = Trophy;
const SettingsOutlined = Settings;
const AccountBalanceOutlined = Landmark;
const CampaignOutlined = Megaphone;
const InventoryOutlined = Package;
const AccountTreeOutlined = GitBranch;
const LaptopOutlined = Laptop;
const StorageOutlined = Database;
const IntegrationInstructionsOutlined = Blocks;
const PhoneAndroidOutlined = Smartphone;
const BuildOutlined = Wrench;
const BarChartOutlined = BarChart3;
const BugReportOutlined = Bug;
const SecurityOutlined = ShieldAlert;
const DesignServicesOutlined = PenTool;
const BrushOutlined = Paintbrush;
const GroupAddOutlined = UserPlus;
const TrendingUpOutlined = TrendingUp;
const LeaderboardOutlined = LineChart;
const SupportAgentOutlined = Headset;
const GavelOutlined = Gavel;
const VerifiedOutlined = BadgeCheck;
const AssessmentOutlined = ClipboardList;
const AccountCircleOutlined = CircleUserRound;
const ScienceOutlined = FlaskConical;
const LocalShippingOutlined = Truck;
const SchoolOutlined = GraduationCap;

export const ROLES = [
  // ── Executive ──────────────────────────────────────────────────────────────
  { value: 'owner',                  label: 'Owner',                   description: 'Full workspace ownership & control',  icon: AdminPanelSettingsOutlined,   color: '#DC2626' },
  { value: 'ceo',                    label: 'CEO',                     description: 'Chief Executive Officer',             icon: EmojiEventsOutlined,          color: '#DC2626' },
  { value: 'cto',                    label: 'CTO',                     description: 'Chief Technology Officer',            icon: CodeOutlined,                 color: '#7C3AED' },
  { value: 'cfo',                    label: 'CFO',                     description: 'Chief Financial Officer',             icon: AccountBalanceOutlined,       color: '#0891B2' },
  { value: 'coo',                    label: 'COO',                     description: 'Chief Operating Officer',             icon: SettingsOutlined,             color: '#D97706' },
  { value: 'cmo',                    label: 'CMO',                     description: 'Chief Marketing Officer',             icon: CampaignOutlined,             color: '#DB2777' },
  { value: 'cpo',                    label: 'CPO',                     description: 'Chief Product Officer',               icon: InventoryOutlined,            color: '#059669' },
  // ── Management ─────────────────────────────────────────────────────────────
  { value: 'manager',                label: 'Manager',                 description: 'Department strategy & leadership',    icon: ManageAccountsOutlined,       color: '#8310FF' },
  { value: 'supervisor',             label: 'Supervisor',              description: 'Team operations oversight',           icon: SupervisorAccountOutlined,    color: '#D97706' },
  { value: 'technical_leader',       label: 'Tech Lead',               description: 'Technical direction & assessments',  icon: AccountTreeOutlined,          color: '#0891B2' },
  { value: 'project_manager',        label: 'Project Manager',         description: 'Project planning & delivery',         icon: AccountTreeOutlined,          color: '#0284C7' },
  { value: 'product_manager',        label: 'Product Manager',         description: 'Product vision & roadmap',            icon: InventoryOutlined,            color: '#059669' },
  { value: 'scrum_master',           label: 'Scrum Master',            description: 'Agile ceremonies & team coaching',    icon: AssessmentOutlined,           color: '#0891B2' },
  // ── Engineering ────────────────────────────────────────────────────────────
  { value: 'software_engineer',      label: 'Software Engineer',       description: 'Application development',             icon: CodeOutlined,                 color: '#0891B2' },
  { value: 'frontend_developer',     label: 'Frontend Developer',      description: 'UI & client-side development',        icon: LaptopOutlined,               color: '#0284C7' },
  { value: 'backend_developer',      label: 'Backend Developer',       description: 'Server-side & API development',       icon: StorageOutlined,              color: '#7C3AED' },
  { value: 'fullstack_developer',    label: 'Full Stack Developer',    description: 'End-to-end development',              icon: IntegrationInstructionsOutlined, color: '#0891B2' },
  { value: 'mobile_developer',       label: 'Mobile Developer',        description: 'iOS & Android development',           icon: PhoneAndroidOutlined,         color: '#16A34A' },
  { value: 'devops_engineer',        label: 'DevOps Engineer',         description: 'CI/CD & cloud infrastructure',        icon: BuildOutlined,                color: '#D97706' },
  { value: 'data_engineer',          label: 'Data Engineer',           description: 'Data pipelines & architecture',       icon: StorageOutlined,              color: '#0891B2' },
  { value: 'data_scientist',         label: 'Data Scientist',          description: 'ML models & advanced analytics',      icon: ScienceOutlined,              color: '#7C3AED' },
  { value: 'data_analyst',           label: 'Data Analyst',            description: 'Business data & reporting',           icon: BarChartOutlined,             color: '#0891B2' },
  { value: 'qa_engineer',            label: 'QA Engineer',             description: 'Quality assurance & testing',         icon: BugReportOutlined,            color: '#DC2626' },
  { value: 'security_engineer',      label: 'Security Engineer',       description: 'Cybersecurity & threat mitigation',   icon: SecurityOutlined,             color: '#DC2626' },
  { value: 'solution_architect',     label: 'Solution Architect',      description: 'System design & architecture',        icon: AccountTreeOutlined,          color: '#7C3AED' },
  // ── Design ─────────────────────────────────────────────────────────────────
  { value: 'ux_designer',            label: 'UX Designer',             description: 'User experience & research',          icon: BrushOutlined,                color: '#DB2777' },
  { value: 'ui_designer',            label: 'UI Designer',             description: 'Visual & interface design',           icon: DesignServicesOutlined,       color: '#DB2777' },
  // ── Human Resources ────────────────────────────────────────────────────────
  { value: 'hr',                     label: 'HR',                      description: 'Human resources & team ops',          icon: PeopleOutlined,               color: '#16A34A' },
  { value: 'recruiter',              label: 'Recruiter',               description: 'Talent sourcing & hiring',            icon: GroupAddOutlined,             color: '#16A34A' },
  { value: 'hr_manager',             label: 'HR Manager',              description: 'HR strategy & compliance',            icon: ManageAccountsOutlined,       color: '#16A34A' },
  { value: 'training_specialist',    label: 'Training Specialist',     description: 'Learning & development programs',     icon: SchoolOutlined,               color: '#059669' },
  // ── Finance ────────────────────────────────────────────────────────────────
  { value: 'accountant',             label: 'Accountant',              description: 'Financial records & reporting',       icon: AccountBalanceOutlined,       color: '#0891B2' },
  { value: 'financial_analyst',      label: 'Financial Analyst',       description: 'Financial planning & analysis',       icon: TrendingUpOutlined,           color: '#059669' },
  { value: 'auditor',                label: 'Auditor',                 description: 'Internal audits & risk assessment',   icon: VerifiedOutlined,             color: '#D97706' },
  // ── Marketing & Sales ──────────────────────────────────────────────────────
  { value: 'marketing_manager',      label: 'Marketing Manager',       description: 'Campaigns & brand strategy',          icon: CampaignOutlined,             color: '#DB2777' },
  { value: 'content_writer',         label: 'Content Writer',          description: 'Content creation & copywriting',      icon: BrushOutlined,                color: '#DB2777' },
  { value: 'seo_specialist',         label: 'SEO Specialist',          description: 'Search engine optimisation',          icon: TrendingUpOutlined,           color: '#0891B2' },
  { value: 'sales_manager',          label: 'Sales Manager',           description: 'Sales team & revenue targets',        icon: LeaderboardOutlined,          color: '#059669' },
  { value: 'account_executive',      label: 'Account Executive',       description: 'Client acquisition & growth',         icon: TrendingUpOutlined,           color: '#D97706' },
  { value: 'business_development',   label: 'Biz Dev',                 description: 'Partnerships & market expansion',     icon: TrendingUpOutlined,           color: '#059669' },
  { value: 'customer_success',       label: 'Customer Success',        description: 'Client retention & satisfaction',     icon: SupportAgentOutlined,         color: '#0891B2' },
  // ── Legal & Compliance ─────────────────────────────────────────────────────
  { value: 'legal_counsel',          label: 'Legal Counsel',           description: 'Legal advice & contract review',      icon: GavelOutlined,                color: '#7C3AED' },
  { value: 'compliance_officer',     label: 'Compliance Officer',      description: 'Regulatory & policy compliance',      icon: VerifiedOutlined,             color: '#059669' },
  // ── Operations & Support ───────────────────────────────────────────────────
  { value: 'operations_manager',     label: 'Operations Manager',      description: 'Day-to-day operational efficiency',   icon: SettingsOutlined,             color: '#D97706' },
  { value: 'business_analyst',       label: 'Business Analyst',        description: 'Process analysis & improvement',      icon: AssessmentOutlined,           color: '#0891B2' },
  { value: 'supply_chain_manager',   label: 'Supply Chain Manager',    description: 'Procurement & logistics',             icon: LocalShippingOutlined,        color: '#D97706' },
  { value: 'customer_support',       label: 'Customer Support',        description: 'Client help & issue resolution',      icon: SupportAgentOutlined,         color: '#16A34A' },
  // ── General ────────────────────────────────────────────────────────────────
  { value: 'employee',               label: 'Employee',                description: 'General team member',                 icon: AccountCircleOutlined,        color: '#6B7280' },
] as const;