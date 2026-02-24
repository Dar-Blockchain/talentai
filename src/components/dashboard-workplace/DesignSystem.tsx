import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Avatar,
  Switch,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Autocomplete,
  Slider,
} from "@mui/material";

// Icons
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import FavoriteOutlined from "@mui/icons-material/Favorite";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";

// Reusable UI sub-components
import StatCard from "./ui/StatCard";
import SectionCard from "./ui/SectionCard";
import SectionHeader from "./ui/SectionHeader";
import PageBanner from "./ui/PageBanner";
import TabBar from "./ui/TabBar";
import ProgressRing from "./ui/ProgressRing";
import StatusBadge from "./ui/StatusBadge";
import DataRow from "./ui/DataRow";
import InfoBanner from "./ui/InfoBanner";
import EmptyState from "./ui/EmptyState";
import LoadingOverlay from "./ui/LoadingOverlay";
import ActionMenu from "./ui/ActionMenu";
import FilterBar from "./ui/FilterBar";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const TOKENS = {
  colors: {
    primary:   { name: "Teal",     hex: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
    purple:    { name: "Purple",   hex: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    blue:      { name: "Blue",     hex: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    orange:    { name: "Orange",   hex: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
    green:     { name: "Green",    hex: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
    red:       { name: "Red",      hex: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    amber:     { name: "Amber",    hex: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    gray:      { name: "Gray",     hex: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
  },
  neutrals: [
    { name: "Gray 900", hex: "#111827" },
    { name: "Gray 700", hex: "#374151" },
    { name: "Gray 500", hex: "#6B7280" },
    { name: "Gray 400", hex: "#9CA3AF" },
    { name: "Gray 200", hex: "#E5E7EB" },
    { name: "Gray 100", hex: "#F3F4F6" },
    { name: "Gray 50",  hex: "#F9FAFB" },
    { name: "White",    hex: "#FFFFFF" },
  ],
};

// ─── Shared section shell ─────────────────────────────────────────────────────
const Section: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({
  title, desc, children,
}) => (
  <Box sx={{ mb: 6 }}>
    <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
      {title}
    </Typography>
    {desc && (
      <Typography sx={{ fontSize: "13px", color: "#6B7280", mb: 3 }}>{desc}</Typography>
    )}
    {!desc && <Box sx={{ mb: 3 }} />}
    {children}
  </Box>
);

// Token swatch card
const Swatch: React.FC<{ name: string; hex: string; bg?: string }> = ({ name, hex, bg }) => (
  <Box
    sx={{
      borderRadius: 2.5,
      overflow: "hidden",
      border: "1px solid #E5E7EB",
      bgcolor: "#fff",
      minWidth: 100,
      flex: "1 1 100px",
      maxWidth: 140,
    }}
  >
    <Box sx={{ height: 60, bgcolor: hex }} />
    <Box sx={{ p: 1.5 }}>
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#111827", mb: 0.25 }}>{name}</Typography>
      <Typography sx={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>{hex}</Typography>
      {bg && (
        <Typography sx={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{bg}</Typography>
      )}
    </Box>
  </Box>
);

// Row helper
const Row: React.FC<{ children: React.ReactNode; gap?: number; wrap?: boolean; sx?: any }> = ({
  children, gap = 2, wrap = true, sx = {},
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap, flexWrap: wrap ? "wrap" : "nowrap", ...sx }}>
    {children}
  </Box>
);

// Label tag above demos
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase",
      letterSpacing: "0.08em", mb: 1 }}
  >
    {children}
  </Typography>
);

// Demo card wrapper
const DemoCard: React.FC<{ label: string; children: React.ReactNode; minH?: number }> = ({
  label, children, minH = 0,
}) => (
  <Box
    sx={{
      bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2.5, p: 2.5,
      flex: 1, minWidth: 200, minHeight: minH,
    }}
  >
    <Label>{label}</Label>
    {children}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DesignSystem: React.FC = () => {
  const [showPass, setShowPass] = useState(false);
  const [switchVal, setSwitchVal] = useState(true);
  const [sliderVal, setSliderVal] = useState(65);
  const [inputVal, setInputVal] = useState("");
  const [activeNav, setActiveNav] = useState("Colors");

  const [demoTab, setDemoTab] = useState("overview");
  const [demoSearch, setDemoSearch] = useState("");
  const [demoDept, setDemoDept] = useState("all");

  const navItems = ["Colors", "Typography", "Inputs", "Buttons", "Chips & Badges", "Feedback", "Data", "Components"];

  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 4,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label="v1.0"
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "11px", mb: 2, height: 22 }}
          />
          <Typography sx={{ fontSize: { xs: "26px", md: "34px" }, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", mb: 1 }}>
            TalentAI Design System
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", maxWidth: 560 }}>
            Colors, typography, inputs, buttons, and components — the single source of truth for building consistent UIs across the platform.
          </Typography>

          {/* Stats row */}
          <Box sx={{ display: "flex", gap: 4, mt: 3, flexWrap: "wrap" }}>
            {[
              { label: "Colors",     val: "8" },
              { label: "Components", val: "36+" },
              { label: "Font",       val: "Poppins" },
              { label: "Theme",      val: "Teal" },
            ].map(({ label, val }) => (
              <Box key={label}>
                <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>{val}</Typography>
                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Sticky nav */}
      <Box
        sx={{
          display: "flex", gap: 0.5, mb: 5, p: 0.75,
          bgcolor: "#F3F4F6", borderRadius: 2.5, flexWrap: "wrap",
          position: "sticky", top: 0, zIndex: 10,
        }}
      >
        {navItems.map((n) => (
          <Box
            key={n}
            onClick={() => setActiveNav(n)}
            sx={{
              px: 2, py: 0.8, borderRadius: 2, cursor: "pointer", fontSize: "13px", fontWeight: 600,
              bgcolor: activeNav === n ? "#fff" : "transparent",
              color: activeNav === n ? "#0D9488" : "#6B7280",
              boxShadow: activeNav === n ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              "&:hover": { color: "#0D9488" },
            }}
          >
            {n}
          </Box>
        ))}
      </Box>

      {/* ── COLORS ── */}
      {activeNav === "Colors" && (
        <>
          <Section title="Brand Colors" desc="Core palette used across the platform. Each color ships with a base hex, a light background tint, and a border tone.">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {Object.values(TOKENS.colors).map((c) => (
                <Swatch key={c.hex} name={c.name} hex={c.hex} bg={c.bg} />
              ))}
            </Box>
          </Section>

          <Section title="Neutrals" desc="Gray scale for text, borders, backgrounds, and subtle UI elements.">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {TOKENS.neutrals.map((c) => (
                <Swatch key={c.hex} name={c.name} hex={c.hex} />
              ))}
            </Box>
          </Section>

          <Section title="Module Colors" desc="Each campaign/assessment module has a dedicated color identity.">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[
                { label: "AI Interview",   gradient: "linear-gradient(135deg, #0D9488, #0891B2)", fg: "#0D9488", bg: "#F0FDFA" },
                { label: "Skill Test",     gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)", fg: "#7C3AED", bg: "#F5F3FF" },
                { label: "Questionnaire",  gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)", fg: "#2563EB", bg: "#EFF6FF" },
                { label: "Training Path",  gradient: "linear-gradient(135deg, #C2410C, #92400E)", fg: "#C2410C", bg: "#FFF7ED" },
              ].map(({ label, gradient, fg, bg }) => (
                <Box
                  key={label}
                  sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #E5E7EB", minWidth: 160, flex: "1 1 160px" }}
                >
                  <Box sx={{ height: 80, background: gradient }} />
                  <Box sx={{ p: 2, bgcolor: bg }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: fg }}>{label}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>Module accent</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="Semantic Colors" desc="Contextual colors for alerts, statuses, and feedback.">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[
                { label: "Success", hex: "#16A34A", bg: "#F0FDF4" },
                { label: "Warning", hex: "#D97706", bg: "#FFFBEB" },
                { label: "Error",   hex: "#DC2626", bg: "#FEF2F2" },
                { label: "Info",    hex: "#2563EB", bg: "#EFF6FF" },
              ].map(({ label, hex, bg }) => (
                <Box
                  key={label}
                  sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, py: 2,
                    bgcolor: bg, border: `1px solid ${hex}30`, borderRadius: 2.5, flex: "1 1 140px" }}
                >
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: hex }} />
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: hex }}>{label}</Typography>
                    <Typography sx={{ fontSize: "11px", fontFamily: "monospace", color: "#6B7280" }}>{hex}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Section>
        </>
      )}

      {/* ── TYPOGRAPHY ── */}
      {activeNav === "Typography" && (
        <Section title="Typography Scale" desc="Poppins font family. All sizes use px units; weights 400–800.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Display",    size: "36px", weight: 800, sample: "Hero headline" },
              { label: "H1",         size: "28px", weight: 700, sample: "Page title" },
              { label: "H2",         size: "22px", weight: 700, sample: "Section heading" },
              { label: "H3",         size: "18px", weight: 700, sample: "Card heading" },
              { label: "H4",         size: "15px", weight: 700, sample: "Sub-section" },
              { label: "Body Large", size: "16px", weight: 400, sample: "Primary body copy — clear and legible." },
              { label: "Body",       size: "14px", weight: 400, sample: "Default body text used across components." },
              { label: "Body Small", size: "13px", weight: 400, sample: "Secondary body and sidebar text." },
              { label: "Caption",    size: "12px", weight: 500, sample: "Helper text, labels, meta information." },
              { label: "Overline",   size: "11px", weight: 700, sample: "UPPERCASE SECTION LABEL" },
            ].map(({ label, size, weight, sample }) => (
              <Box
                key={label}
                sx={{ display: "flex", alignItems: "baseline", gap: 3, py: 2.5, borderBottom: "1px solid #F3F4F6" }}
              >
                <Box sx={{ width: 120, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#D1D5DB", fontFamily: "monospace" }}>
                    {size} / {weight}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: size, fontWeight: weight, color: "#111827", lineHeight: 1.3 }}>
                  {sample}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", mb: 2 }}>Font Weights</Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {[400, 500, 600, 700, 800].map((w) => (
                <Box key={w} sx={{ p: 2.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2.5, minWidth: 100 }}>
                  <Typography sx={{ fontSize: "26px", fontWeight: w, color: "#111827" }}>Ag</Typography>
                  <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>Weight {w}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Section>
      )}

      {/* ── INPUTS ── */}
      {activeNav === "Inputs" && (
        <>
          <Section title="Text Inputs" desc="Standard MUI TextField variants used across forms. Focus ring uses teal #0D9488.">
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <DemoCard label="Default" minH={80}>
                <TextField
                  fullWidth size="small" label="Company Name" placeholder="Acme Corp"
                  value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                />
              </DemoCard>

              <DemoCard label="With icon" minH={80}>
                <TextField
                  fullWidth size="small" label="Search" placeholder="Search anything..."
                  slotProps={{ input: { startAdornment: <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} /> } }}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                />
              </DemoCard>

              <DemoCard label="Password" minH={80}>
                <TextField
                  fullWidth size="small" label="Password" type={showPass ? "text" : "password"}
                  defaultValue="secret"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                          {showPass
                            ? <VisibilityOffOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
                            : <VisibilityOutlined   sx={{ fontSize: 18, color: "#9CA3AF" }} />
                          }
                        </IconButton>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                />
              </DemoCard>

              <DemoCard label="Error state" minH={80}>
                <TextField
                  fullWidth size="small" label="Email" defaultValue="bad-email"
                  error helperText="Enter a valid email address."
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#DC2626" } }}
                />
              </DemoCard>

              <DemoCard label="Disabled" minH={80}>
                <TextField fullWidth size="small" label="Company Email" value="team@acme.com" disabled />
              </DemoCard>

              <DemoCard label="Multiline" minH={80}>
                <TextField
                  fullWidth size="small" label="Description" multiline rows={3}
                  placeholder="Describe your company..."
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                />
              </DemoCard>
            </Box>
          </Section>

          <Section title="Select & Autocomplete" desc="Dropdown and smart-search inputs.">
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <DemoCard label="Select / Dropdown" minH={80}>
                <TextField
                  select fullWidth size="small" label="Employment Type" defaultValue="Remote"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                >
                  {["Remote", "On-site", "Hybrid"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </TextField>
              </DemoCard>

              <DemoCard label="Autocomplete" minH={80}>
                <Autocomplete
                  options={["Tunisia", "France", "Germany", "United States", "United Kingdom", "Canada"]}
                  renderInput={(params) => (
                    <TextField {...params} size="small" label="Country"
                      sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#0D9488" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#0D9488" } }}
                    />
                  )}
                />
              </DemoCard>
            </Box>
          </Section>

          <Section title="Toggle & Slider" desc="Boolean switches and range inputs.">
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <DemoCard label="Switch / Toggle" minH={80}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Enabled (on)",  checked: true  },
                    { label: "Enabled (off)", checked: false },
                  ].map(({ label, checked }) => (
                    <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "13px", color: "#374151" }}>{label}</Typography>
                      <Switch
                        checked={label === "Enabled (on)" ? switchVal : !switchVal}
                        onChange={() => setSwitchVal(!switchVal)}
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0D9488" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#0D9488" } }}
                      />
                    </Box>
                  ))}
                </Box>
              </DemoCard>

              <DemoCard label="Slider" minH={80}>
                <Typography sx={{ fontSize: "13px", color: "#374151", mb: 2 }}>
                  Score threshold: <strong>{sliderVal}%</strong>
                </Typography>
                <Slider
                  value={sliderVal}
                  onChange={(_, v) => setSliderVal(v as number)}
                  sx={{ color: "#0D9488" }}
                />
              </DemoCard>
            </Box>
          </Section>
        </>
      )}

      {/* ── BUTTONS ── */}
      {activeNav === "Buttons" && (
        <>
          <Section title="Button Variants" desc="Contained, outlined, text, and icon variants. All use borderRadius: 2 (8px) with fontWeight 600.">
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {/* Contained */}
              <DemoCard label="Contained" minH={120}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Teal (primary)", bg: "#0D9488", hover: "#0F766E" },
                    { label: "Purple",         bg: "#7C3AED", hover: "#6D28D9" },
                    { label: "Blue",           bg: "#2563EB", hover: "#1D4ED8" },
                    { label: "Red",            bg: "#DC2626", hover: "#B91C1C" },
                  ].map(({ label, bg, hover }) => (
                    <Button
                      key={label} variant="contained" size="small" fullWidth
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2,
                        bgcolor: bg, "&:hover": { bgcolor: hover } }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </DemoCard>

              {/* Outlined */}
              <DemoCard label="Outlined" minH={120}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Teal",   color: "#0D9488", border: "#99F6E4", bg: "#F0FDFA" },
                    { label: "Purple", color: "#7C3AED", border: "#DDD6FE", bg: "#F5F3FF" },
                    { label: "Red",    color: "#DC2626", border: "#FECACA", bg: "#FEF2F2" },
                    { label: "Gray",   color: "#6B7280", border: "#E5E7EB", bg: "#F9FAFB" },
                  ].map(({ label, color, border, bg }) => (
                    <Button
                      key={label} variant="outlined" size="small" fullWidth
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2,
                        color, borderColor: border, "&:hover": { bgcolor: bg, borderColor: border } }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </DemoCard>

              {/* Sizes */}
              <DemoCard label="Sizes" minH={120}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
                  {(["small", "medium", "large"] as const).map((size) => (
                    <Button
                      key={size} variant="contained" size={size}
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, bgcolor: "#0D9488", "&:hover": { bgcolor: "#0F766E" } }}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                  <Button
                    variant="contained" size="small" disabled
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                  >
                    Disabled
                  </Button>
                </Box>
              </DemoCard>

              {/* With icons */}
              <DemoCard label="With Icons" minH={120}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Add Member",   Icon: AddOutlined,      bg: "#0D9488" },
                    { label: "Edit",         Icon: EditOutlined,     bg: "#2563EB" },
                    { label: "Download",     Icon: DownloadOutlined, bg: "#7C3AED" },
                    { label: "Send",         Icon: SendOutlined,     bg: "#C2410C" },
                  ].map(({ label, Icon, bg }) => (
                    <Button
                      key={label} variant="contained" size="small" startIcon={<Icon sx={{ fontSize: 15 }} />}
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, bgcolor: bg,
                        "&:hover": { filter: "brightness(0.9)" } }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </DemoCard>

              {/* Icon buttons */}
              <DemoCard label="Icon Buttons" minH={120}>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {[
                    { Icon: EditOutlined,    color: "#0D9488", bg: "#F0FDFA" },
                    { Icon: DeleteOutlined,  color: "#DC2626", bg: "#FEF2F2" },
                    { Icon: DownloadOutlined,color: "#7C3AED", bg: "#F5F3FF" },
                    { Icon: StarOutlined,    color: "#D97706", bg: "#FFFBEB" },
                    { Icon: FavoriteOutlined,color: "#DC2626", bg: "#FEF2F2" },
                  ].map(({ Icon, color, bg }, i) => (
                    <Tooltip key={i} title="Action">
                      <IconButton size="small" sx={{ color, bgcolor: bg, borderRadius: 1.5, "&:hover": { opacity: 0.8 } }}>
                        <Icon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                  {[
                    { Icon: AddOutlined,     bg: "#0D9488" },
                    { Icon: EditOutlined,    bg: "#7C3AED" },
                    { Icon: DeleteOutlined,  bg: "#DC2626" },
                  ].map(({ Icon, bg }, i) => (
                    <IconButton key={i} size="small"
                      sx={{ color: "#fff", bgcolor: bg, borderRadius: 1.5, "&:hover": { opacity: 0.85 } }}>
                      <Icon sx={{ fontSize: 18 }} />
                    </IconButton>
                  ))}
                </Box>
              </DemoCard>
            </Box>

            {/* Loading state */}
            <Box sx={{ mt: 3 }}>
              <Label>Loading State</Label>
              <Row>
                <Button
                  variant="contained" size="small" disabled
                  startIcon={<CircularProgress size={14} sx={{ color: "#fff" }} />}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, bgcolor: "#0D9488",
                    "&.Mui-disabled": { bgcolor: "#0D9488", opacity: 0.7, color: "#fff" } }}
                >
                  Saving…
                </Button>
                <Button
                  variant="outlined" size="small" disabled
                  startIcon={<CircularProgress size={14} sx={{ color: "#0D9488" }} />}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2,
                    borderColor: "#99F6E4", color: "#0D9488",
                    "&.Mui-disabled": { borderColor: "#99F6E4", color: "#0D9488", opacity: 0.7 } }}
                >
                  Loading…
                </Button>
              </Row>
            </Box>
          </Section>
        </>
      )}

      {/* ── CHIPS & BADGES ── */}
      {activeNav === "Chips & Badges" && (
        <>
          <Section title="Chips" desc="Status badges, tags, and interactive labels.">
            {/* Status chips */}
            <Label>Campaign Status</Label>
            <Row wrap>
              {[
                { label: "ACTIVE",    bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
                { label: "DRAFT",     bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
                { label: "PAUSED",    bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
                { label: "COMPLETED", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
                { label: "ARCHIVED",  bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
              ].map(({ label, bg, color, border }) => (
                <Chip key={label} label={label} size="small"
                  sx={{ bgcolor: bg, color, border: `1px solid ${border}`, fontWeight: 700,
                    fontSize: "10px", height: 22, letterSpacing: "0.04em" }} />
              ))}
            </Row>

            <Box sx={{ mt: 3 }} />
            <Label>Module Types</Label>
            <Row wrap>
              {[
                { label: "AI Interview",  color: "#0D9488", bg: "#F0FDFA" },
                { label: "Skill Test",    color: "#7C3AED", bg: "#F5F3FF" },
                { label: "Questionnaire", color: "#2563EB", bg: "#EFF6FF" },
                { label: "Training Path", color: "#C2410C", bg: "#FFF7ED" },
              ].map(({ label, color, bg }) => (
                <Chip key={label} label={label} size="small"
                  sx={{ bgcolor: bg, color, fontWeight: 700, fontSize: "11px" }} />
              ))}
            </Row>

            <Box sx={{ mt: 3 }} />
            <Label>Team Roles</Label>
            <Row wrap>
              {[
                { label: "Owner",   color: "#7C3AED" },
                { label: "Manager", color: "#0D9488" },
                { label: "Tech Lead",color: "#2563EB" },
                { label: "HR",      color: "#DC2626" },
                { label: "Supervisor",color: "#D97706" },
              ].map(({ label, color }) => (
                <Chip key={label} label={label} size="small"
                  sx={{ bgcolor: `${color}15`, color, border: `1px solid ${color}30`,
                    fontWeight: 700, fontSize: "11px", height: 22 }} />
              ))}
            </Row>
          </Section>

          <Section title="Avatars" desc="User and company avatar variants with fallback initials.">
            <Row>
              {[
                { initials: "TL", bg: "#0D9488" },
                { initials: "AB", bg: "#7C3AED" },
                { initials: "CD", bg: "#2563EB" },
                { initials: "EF", bg: "#C2410C" },
                { initials: "GH", bg: "#16A34A" },
              ].map(({ initials, bg }) => (
                <Avatar key={initials} sx={{ bgcolor: bg, width: 40, height: 40, fontSize: "14px", fontWeight: 700 }}>
                  {initials}
                </Avatar>
              ))}
              <Avatar src="/images/home/logocompany.png" sx={{ width: 40, height: 40 }} />
            </Row>
            <Row sx={{ mt: 2 }}>
              {[48, 40, 36, 32, 24].map((size) => (
                <Avatar key={size} sx={{ bgcolor: "#0D9488", width: size, height: size, fontSize: size * 0.35 }}>
                  T
                </Avatar>
              ))}
            </Row>
          </Section>

          <Section title="Badges" desc="Notification count and status indicator badges.">
            <Row>
              <Badge badgeContent={4} sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff" } }}>
                <NotificationsOutlined sx={{ fontSize: 28, color: "#6B7280" }} />
              </Badge>
              <Badge badgeContent={12} max={9} sx={{ "& .MuiBadge-badge": { bgcolor: "#0D9488", color: "#fff" } }}>
                <NotificationsOutlined sx={{ fontSize: 28, color: "#6B7280" }} />
              </Badge>
              <Badge variant="dot" sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444" } }}>
                <Avatar sx={{ bgcolor: "#0D9488", width: 36, height: 36, fontSize: 14 }}>T</Avatar>
              </Badge>
            </Row>
          </Section>
        </>
      )}

      {/* ── FEEDBACK ── */}
      {activeNav === "Feedback" && (
        <>
          <Section title="Alerts" desc="Contextual feedback messages. Use severity to convey meaning.">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="success" icon={<CheckCircleOutlined />} sx={{ borderRadius: 2 }}>
                Campaign created successfully! Your team has been notified.
              </Alert>
              <Alert severity="error" icon={<ErrorOutlined />} sx={{ borderRadius: 2 }}>
                Failed to save changes. Please check your inputs and try again.
              </Alert>
              <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ borderRadius: 2 }}>
                Your plan will expire in 3 days. Upgrade to continue using all features.
              </Alert>
              <Alert severity="info" icon={<InfoOutlined />} sx={{ borderRadius: 2 }}>
                New assessment results are ready to review.
              </Alert>
            </Box>
          </Section>

          <Section title="Progress & Loading" desc="Linear and circular progress indicators.">
            <Label>Linear Progress</Label>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
              {[
                { value: 25, color: "#0D9488", label: "25% — In progress" },
                { value: 60, color: "#7C3AED", label: "60% — Midway" },
                { value: 85, color: "#16A34A", label: "85% — Almost done" },
                { value: 100, color: "#2563EB", label: "100% — Complete" },
              ].map(({ value, color, label }) => (
                <Box key={label}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#374151" }}>{label}</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color }}>{value}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate" value={value}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6",
                      "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }}
                  />
                </Box>
              ))}
            </Box>

            <Label>Circular Progress</Label>
            <Row>
              {[
                { size: 32, color: "#0D9488" },
                { size: 48, color: "#7C3AED" },
                { size: 64, color: "#2563EB" },
              ].map(({ size, color }) => (
                <CircularProgress key={size} size={size} sx={{ color }} />
              ))}
            </Row>
          </Section>

          <Section title="Dividers" desc="Visual separators for sections and lists.">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Label>Default</Label>
                <Divider />
              </Box>
              <Box>
                <Label>With label</Label>
                <Divider>
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", px: 1, fontWeight: 600 }}>
                    OR CONTINUE WITH
                  </Typography>
                </Divider>
              </Box>
            </Box>
          </Section>
        </>
      )}

      {/* ── COMPONENTS ── */}
      {activeNav === "Components" && (
        <>
          {/* ── Inline helper for code snippets ── */}
          {(() => {
            const Code: React.FC<{ children: string }> = ({ children }) => (
              <Box
                component="pre"
                sx={{
                  mt: 1.5, mb: 0, p: 1.5,
                  bgcolor: "#0f172a", color: "#7dd3fc",
                  borderRadius: 2, fontSize: "11px", fontFamily: "monospace",
                  overflowX: "auto", lineHeight: 1.7,
                  whiteSpace: "pre",
                }}
              >
                {children}
              </Box>
            );

            const ComponentSection: React.FC<{
              name: string;
              desc: string;
              importPath: string;
              demo: React.ReactNode;
              props?: { name: string; type: string; desc: string; required?: boolean }[];
            }> = ({ name, desc, importPath, demo, props }) => (
              <Box
                sx={{
                  mb: 5, border: "1px solid #e5e7eb", borderRadius: 3,
                  overflow: "hidden", bgcolor: "#fff",
                }}
              >
                {/* Header stripe */}
                <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{name}</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.25 }}>{desc}</Typography>
                  </Box>
                  <Chip
                    label="UI Primitive"
                    size="small"
                    sx={{ ml: "auto", bgcolor: "#f0fdfa", color: "#0D9488", fontWeight: 700, fontSize: "10px", height: 20 }}
                  />
                </Box>

                {/* Live demo area */}
                <Box sx={{ p: 3, bgcolor: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                    Live Demo
                  </Typography>
                  {demo}
                </Box>

                {/* Import code */}
                <Box sx={{ px: 3, pt: 2, pb: props ? 0 : 3 }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Import
                  </Typography>
                  <Code>{`import { ${name} } from "@/components/dashboard-workplace/ui";\n// or directly:\nimport ${name} from "${importPath}";`}</Code>
                </Box>

                {/* Props table */}
                {props && (
                  <Box sx={{ px: 3, pt: 2, pb: 3 }}>
                    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                      Props
                    </Typography>
                    <Box sx={{ border: "1px solid #f3f4f6", borderRadius: 2, overflow: "hidden" }}>
                      {/* header */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", bgcolor: "#f9fafb", px: 2, py: 1, gap: 2 }}>
                        {["Prop", "Type", "Description"].map((h) => (
                          <Typography key={h} sx={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>{h}</Typography>
                        ))}
                      </Box>
                      {props.map((p, i) => (
                        <Box
                          key={p.name}
                          sx={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
                            px: 2, py: 1, gap: 2,
                            bgcolor: i % 2 === 0 ? "#fff" : "#fafafa",
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          <Typography sx={{ fontSize: "12px", fontFamily: "monospace", color: "#0D9488", fontWeight: 600 }}>
                            {p.name}{p.required ? " *" : ""}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", fontFamily: "monospace", color: "#7c3aed" }}>{p.type}</Typography>
                          <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{p.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: "11px", color: "#9ca3af", mt: 1 }}>* required</Typography>
                  </Box>
                )}
              </Box>
            );

            return (
              <>
                {/* ─── StatCard ─── */}
                <ComponentSection
                  name="StatCard"
                  desc="Metric card with icon, value, label, and optional trend indicator."
                  importPath="@/components/dashboard-workplace/ui/StatCard"
                  demo={
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                      <StatCard icon={<PeopleOutlined />} label="Total Employees" value={142} trend={5} color="#0D9488" />
                      <StatCard icon={<CampaignOutlined />} label="Active Campaigns" value={8} trend={-2} trendLabel="this week" color="#7C3AED" />
                      <StatCard icon={<TrendingUpIcon />} label="Avg Skill Score" value="78%" color="#2563EB" />
                      <StatCard icon={<BarChartOutlined />} label="Completion Rate" value="91%" trend={12} color="#C2410C" />
                    </Box>
                  }
                  props={[
                    { name: "icon",       type: "ReactNode",       desc: "MUI icon element rendered in the coloured box", required: true },
                    { name: "label",      type: "string",          desc: "Short descriptive label below the value", required: true },
                    { name: "value",      type: "string | number", desc: "Main metric value", required: true },
                    { name: "trend",      type: "number",          desc: "Signed number — positive shows up arrow (green), negative shows down arrow (red)" },
                    { name: "trendLabel", type: "string",          desc: 'Text next to trend. Default: "vs last month"' },
                    { name: "color",      type: "string",          desc: "Accent colour for icon background. Default: #0D9488 (teal)" },
                    { name: "onClick",    type: "() => void",      desc: "Optional click handler — enables hover lift effect" },
                  ]}
                />

                {/* ─── SectionCard ─── */}
                <ComponentSection
                  name="SectionCard"
                  desc="White card wrapper providing consistent padding, border and shadow for any content block."
                  importPath="@/components/dashboard-workplace/ui/SectionCard"
                  demo={
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <SectionCard sx={{ flex: 1, minWidth: 200 }}>
                        <Typography sx={{ fontWeight: 600, color: "#111827" }}>Default (padded)</Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}>Cards have p: 3, borderRadius: 3, and a soft box-shadow.</Typography>
                      </SectionCard>
                      <SectionCard noPadding sx={{ flex: 1, minWidth: 200 }}>
                        <Box sx={{ p: 2, borderBottom: "1px solid #f3f4f6" }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "#111827" }}>noPadding — full-bleed</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>Used for tables that need edge-to-edge rows.</Typography>
                        </Box>
                      </SectionCard>
                    </Box>
                  }
                  props={[
                    { name: "children",  type: "ReactNode", desc: "Content to render inside the card", required: true },
                    { name: "noPadding", type: "boolean",   desc: "Remove internal padding (e.g. for full-bleed tables). Default: false" },
                    { name: "sx",        type: "object",    desc: "MUI sx overrides applied to the outer Box" },
                  ]}
                />

                {/* ─── SectionHeader ─── */}
                <ComponentSection
                  name="SectionHeader"
                  desc="Title + subtitle block with an optional right-side action element."
                  importPath="@/components/dashboard-workplace/ui/SectionHeader"
                  demo={
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <SectionHeader title="Skills Matrix" subtitle="View and manage skill levels across your team" action={<Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: "none", borderColor: "#0D9488", color: "#0D9488" }}>Export</Button>} />
                      <Divider />
                      <SectionHeader title="Team Members" compact />
                    </Box>
                  }
                  props={[
                    { name: "title",    type: "string",    desc: "Main heading text", required: true },
                    { name: "subtitle", type: "string",    desc: "Optional secondary line below the title" },
                    { name: "action",   type: "ReactNode", desc: "Element rendered on the right (button, chips, etc.)" },
                    { name: "compact",  type: "boolean",   desc: "Reduces font size and bottom margin. Default: false" },
                  ]}
                />

                {/* ─── PageBanner ─── */}
                <ComponentSection
                  name="PageBanner"
                  desc="Gradient hero banner with icon, stats row, and optional action. Used at the top of major dashboard pages."
                  importPath="@/components/dashboard-workplace/ui/PageBanner"
                  demo={
                    <PageBanner
                      title="Assessment Campaigns"
                      subtitle="Create and manage skill assessments across your team"
                      icon={<CampaignOutlined />}
                      gradient="135deg, #0D9488 0%, #0891B2 100%"
                      stats={[{ label: "Active", value: 4 }, { label: "Completed", value: 12 }, { label: "Participants", value: 86 }]}
                      action={<Button size="small" variant="contained" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", textTransform: "none", fontWeight: 600, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>+ New Campaign</Button>}
                    />
                  }
                  props={[
                    { name: "title",    type: "string",      desc: "Banner headline", required: true },
                    { name: "subtitle", type: "string",      desc: "Secondary text below title" },
                    { name: "icon",     type: "ReactNode",   desc: "Icon in semi-transparent circle" },
                    { name: "gradient", type: "string",      desc: 'CSS gradient angle + stops. Default: "135deg, #0D9488 0%, #0f766e 100%"' },
                    { name: "stats",    type: "BannerStat[]",desc: "Array of { label, value } shown as stat pills" },
                    { name: "action",   type: "ReactNode",   desc: "Button(s) placed top-right" },
                  ]}
                />

                {/* ─── TabBar ─── */}
                <ComponentSection
                  name="TabBar"
                  desc="Horizontal tab switcher with teal active underline and optional count badges."
                  importPath="@/components/dashboard-workplace/ui/TabBar"
                  demo={
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <TabBar
                        tabs={[
                          { id: "overview",  label: "Overview" },
                          { id: "active",    label: "Active",   count: 8 },
                          { id: "archived",  label: "Archived", count: 24 },
                          { id: "settings",  label: "Settings" },
                        ]}
                        activeTab={demoTab}
                        onChange={setDemoTab}
                      />
                      <TabBar
                        tabs={[
                          { id: "all",    label: "All members",   count: 142 },
                          { id: "active", label: "Active",        count: 108 },
                          { id: "invite", label: "Invites sent",  count: 7,  countColor: "#7C3AED" },
                        ]}
                        activeTab={demoTab}
                        onChange={setDemoTab}
                        color="#7C3AED"
                      />
                    </Box>
                  }
                  props={[
                    { name: "tabs",      type: "TabItem[]", desc: "Array of { id, label, count?, countColor? }", required: true },
                    { name: "activeTab", type: "string",    desc: "Currently active tab id", required: true },
                    { name: "onChange",  type: "(id) => void", desc: "Called when user clicks a tab", required: true },
                    { name: "color",     type: "string",    desc: "Active underline + badge colour. Default: #0D9488" },
                  ]}
                />

                {/* ─── ProgressRing ─── */}
                <ComponentSection
                  name="ProgressRing"
                  desc="SVG circular progress indicator with a centred label and optional sublabel."
                  importPath="@/components/dashboard-workplace/ui/ProgressRing"
                  demo={
                    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                      <ProgressRing value={92} size={88} color="#16A34A" label="92%" sublabel="Excellent" />
                      <ProgressRing value={75} size={88} color="#2563EB" label="75%"  sublabel="Good" />
                      <ProgressRing value={58} size={88} color="#D97706" label="58%"  sublabel="Average" />
                      <ProgressRing value={33} size={88} color="#DC2626" label="33%"  sublabel="Poor" />
                      <ProgressRing value={65} size={56} strokeWidth={5} color="#0D9488" label="65" />
                      <ProgressRing value={80} size={40} strokeWidth={4} color="#7C3AED" label="80" />
                    </Box>
                  }
                  props={[
                    { name: "value",       type: "number", desc: "Progress value 0–100", required: true },
                    { name: "size",        type: "number", desc: "Diameter in px. Default: 80" },
                    { name: "strokeWidth", type: "number", desc: "Arc thickness in px. Default: 7" },
                    { name: "color",       type: "string", desc: "Arc colour. Default: #0D9488" },
                    { name: "trackColor",  type: "string", desc: "Background track colour. Default: #e5e7eb" },
                    { name: "label",       type: "ReactNode", desc: "Text rendered in the centre" },
                    { name: "sublabel",    type: "string", desc: "Smaller text below the label" },
                  ]}
                />

                {/* ─── StatusBadge ─── */}
                <ComponentSection
                  name="StatusBadge"
                  desc="Coloured dot + label pill for status display. Ships with built-in presets for common statuses."
                  importPath="@/components/dashboard-workplace/ui/StatusBadge"
                  demo={
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", mb: 1 }}>Built-in presets</Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {(["active", "completed", "pending", "in_progress", "paused", "cancelled", "error", "success", "warning", "info"] as const).map((s) => (
                            <StatusBadge key={s} status={s} />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", mb: 1 }}>Small size & custom</Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <StatusBadge status="active"    size="sm" />
                          <StatusBadge status="pending"   size="sm" />
                          <StatusBadge status="custom" label="Beta" bg="#f0fdfa" color="#0D9488" dot="#0D9488" />
                          <StatusBadge status="custom" label="Live" bg="#fef2f2" color="#dc2626" dot="#dc2626" noDot />
                        </Box>
                      </Box>
                    </Box>
                  }
                  props={[
                    { name: "status",  type: "string",  desc: "Preset key (active, completed, pending…) or any custom string when using custom colours", required: true },
                    { name: "label",   type: "string",  desc: "Override the displayed text" },
                    { name: "bg",      type: "string",  desc: "Background colour override" },
                    { name: "color",   type: "string",  desc: "Text colour override" },
                    { name: "dot",     type: "string",  desc: "Dot colour override" },
                    { name: "noDot",   type: "boolean", desc: "Hide the leading dot. Default: false" },
                    { name: "size",    type: '"sm" | "md"', desc: 'Size variant. Default: "md"' },
                  ]}
                />

                {/* ─── DataRow ─── */}
                <ComponentSection
                  name="DataRow"
                  desc="Standard member / result list row with avatar, name, subtitle, badge and actions."
                  importPath="@/components/dashboard-workplace/ui/DataRow"
                  demo={
                    <SectionCard noPadding>
                      <Box sx={{ px: 2 }}>
                        <DataRow avatar="AD" avatarColor="#0D9488" primary="Alice Dupont" secondary="Product Designer · Paris" badge={<StatusBadge status="active" size="sm" />} actions={<ActionMenu items={[{ label: "Edit", icon: <EditOutlined sx={{ fontSize: 16 }} />, onClick: () => {} }, { label: "Remove", icon: <DeleteOutlined sx={{ fontSize: 16 }} />, onClick: () => {}, danger: true }]} />} />
                        <DataRow avatar="BM" avatarColor="#7C3AED" primary="Bob Martin" secondary="Backend Engineer · Remote" badge={<StatusBadge status="pending" size="sm" />} actions={<ActionMenu items={[{ label: "Edit", icon: <EditOutlined sx={{ fontSize: 16 }} />, onClick: () => {} }]} />} />
                        <DataRow avatar="CR" avatarColor="#2563EB" primary="Carla Rossi" secondary="Tech Lead · Milan" badge={<StatusBadge status="in_progress" size="sm" />} actions={<ActionMenu items={[{ label: "Edit", icon: <EditOutlined sx={{ fontSize: 16 }} />, onClick: () => {} }]} />} divider={false} />
                      </Box>
                    </SectionCard>
                  }
                  props={[
                    { name: "primary",     type: "string",    desc: "Main label — name, title, etc.", required: true },
                    { name: "avatar",      type: "string",    desc: "Initials (e.g. ) or full image URL" },
                    { name: "avatarColor", type: "string",    desc: "Avatar background colour. Default: #0D9488" },
                    { name: "secondary",   type: "string",    desc: "Secondary text below the primary label" },
                    { name: "badge",       type: "ReactNode", desc: "Element rendered next to the primary text (e.g. StatusBadge)" },
                    { name: "actions",     type: "ReactNode", desc: "Element at the far right (e.g. ActionMenu or IconButton)" },
                    { name: "divider",     type: "boolean",   desc: "Show bottom divider. Default: true" },
                    { name: "onClick",     type: "() => void",desc: "Optional row click handler" },
                  ]}
                />

                {/* ─── InfoBanner ─── */}
                <ComponentSection
                  name="InfoBanner"
                  desc="Inline alert / hint box with four severity types."
                  importPath="@/components/dashboard-workplace/ui/InfoBanner"
                  demo={
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <InfoBanner type="info"    message="3 employees are pending their first assessment. Send a reminder to get started." />
                      <InfoBanner type="success" message="All active campaigns are on track. Great work!" />
                      <InfoBanner type="warning" message="Your plan expires in 3 days. Upgrade to keep all features." action={<Button size="small" sx={{ textTransform: "none", color: "#92400e", fontWeight: 700, whiteSpace: "nowrap" }}>Upgrade now</Button>} />
                      <InfoBanner type="error"   message="Failed to sync with the skills database. Please retry." />
                      <InfoBanner type="info" icon={<LightbulbOutlined sx={{ fontSize: 20 }} />} message="Tip: use bulk import to add multiple participants at once." />
                    </Box>
                  }
                  props={[
                    { name: "message", type: "ReactNode",                     desc: "Main text content", required: true },
                    { name: "type",    type: '"info"|"warning"|"success"|"error"', desc: 'Colour theme. Default: "info"' },
                    { name: "icon",    type: "ReactNode",                     desc: "Override the default icon for this type" },
                    { name: "action",  type: "ReactNode",                     desc: "Element placed at the right end (e.g. a button)" },
                  ]}
                />

                {/* ─── EmptyState ─── */}
                <ComponentSection
                  name="EmptyState"
                  desc="Placeholder shown when a list or section has no data yet."
                  importPath="@/components/dashboard-workplace/ui/EmptyState"
                  demo={
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <SectionCard sx={{ flex: 1, minWidth: 260 }}>
                        <EmptyState
                          icon={<CampaignOutlined />}
                          title="No campaigns yet"
                          description="Create your first assessment campaign to start measuring your team's skills."
                          action={<Button size="small" variant="contained" sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, bgcolor: "#0D9488", "&:hover": { bgcolor: "#0f766e" } }}>Create Campaign</Button>}
                        />
                      </SectionCard>
                      <SectionCard sx={{ flex: 1, minWidth: 260 }}>
                        <EmptyState icon={<SearchOutlined />} title="No results found" description='Try adjusting your search or filter.' minHeight={180} />
                      </SectionCard>
                    </Box>
                  }
                  props={[
                    { name: "icon",       type: "ReactNode",       desc: "Icon shown in the grey circle", required: true },
                    { name: "title",      type: "string",          desc: "Main empty-state headline", required: true },
                    { name: "description",type: "string",          desc: "Supporting text" },
                    { name: "action",     type: "ReactNode",       desc: "Optional CTA button" },
                    { name: "minHeight",  type: "string | number", desc: "Container height. Default: 260" },
                  ]}
                />

                {/* ─── LoadingOverlay ─── */}
                <ComponentSection
                  name="LoadingOverlay"
                  desc="Centred teal spinner for async loading states."
                  importPath="@/components/dashboard-workplace/ui/LoadingOverlay"
                  demo={
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <SectionCard sx={{ flex: 1, minWidth: 200, minHeight: 140 }}>
                        <LoadingOverlay />
                      </SectionCard>
                      <SectionCard sx={{ flex: 1, minWidth: 200, minHeight: 140 }}>
                        <LoadingOverlay message="Loading campaigns…" color="#7C3AED" />
                      </SectionCard>
                    </Box>
                  }
                  props={[
                    { name: "height",  type: "string | number", desc: 'Container height. Default: "100%"' },
                    { name: "message", type: "string",          desc: "Optional text below the spinner" },
                    { name: "color",   type: "string",          desc: "Spinner colour. Default: #0D9488" },
                  ]}
                />

                {/* ─── ActionMenu ─── */}
                <ComponentSection
                  name="ActionMenu"
                  desc="Three-dot ⋮ icon button that opens a dropdown menu with optional danger items."
                  importPath="@/components/dashboard-workplace/ui/ActionMenu"
                  demo={
                    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                      <Box>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1 }}>Default</Typography>
                        <ActionMenu
                          items={[
                            { label: "Edit",     icon: <EditOutlined sx={{ fontSize: 16 }} />,    onClick: () => {} },
                            { label: "Download", icon: <DownloadOutlined sx={{ fontSize: 16 }} />,onClick: () => {} },
                            { label: "Delete",   icon: <DeleteOutlined sx={{ fontSize: 16 }} />,  onClick: () => {}, danger: true },
                          ]}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1 }}>With disabled</Typography>
                        <ActionMenu
                          items={[
                            { label: "View",     icon: <InfoOutlined sx={{ fontSize: 16 }} />,     onClick: () => {} },
                            { label: "Export",   icon: <DownloadOutlined sx={{ fontSize: 16 }} />, onClick: () => {}, disabled: true },
                            { label: "Archive",  icon: <StarOutlined sx={{ fontSize: 16 }} />,     onClick: () => {} },
                          ]}
                        />
                      </Box>
                    </Box>
                  }
                  props={[
                    { name: "items",     type: "ActionMenuItem[]", desc: "Array of { label, icon?, onClick, danger?, disabled? }", required: true },
                    { name: "ariaLabel", type: "string",           desc: 'Accessible label for the trigger. Default: "More options"' },
                    { name: "size",      type: '"small"|"medium"', desc: 'Trigger button size. Default: "small"' },
                  ]}
                />

                {/* ─── FilterBar ─── */}
                <ComponentSection
                  name="FilterBar"
                  desc="Combined search field + filter selects + optional right-side action, all in one responsive row."
                  importPath="@/components/dashboard-workplace/ui/FilterBar"
                  demo={
                    <FilterBar
                      searchValue={demoSearch}
                      onSearchChange={setDemoSearch}
                      searchPlaceholder="Search employees…"
                      filters={[
                        {
                          value: demoDept,
                          onChange: setDemoDept,
                          options: [
                            { value: "all",  label: "All Departments" },
                            { value: "eng",  label: "Engineering" },
                            { value: "hr",   label: "HR" },
                            { value: "prod", label: "Product" },
                          ],
                        },
                      ]}
                      action={
                        <Button size="small" variant="outlined" startIcon={<DownloadOutlined sx={{ fontSize: 15 }} />}
                          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, borderColor: "#0D9488", color: "#0D9488" }}>
                          Export
                        </Button>
                      }
                    />
                  }
                  props={[
                    { name: "searchValue",    type: "string",         desc: "Controlled search input value" },
                    { name: "onSearchChange", type: "(v) => void",    desc: "Called on each keystroke — enables the search field" },
                    { name: "searchPlaceholder", type: "string",      desc: 'Placeholder text. Default: "Search…"' },
                    { name: "filters",        type: "FilterSelect[]", desc: "Array of { value, onChange, options[], minWidth? } select controls" },
                    { name: "action",         type: "ReactNode",      desc: "Element placed at the far right (e.g. Export button)" },
                  ]}
                />
              </>
            );
          })()}
        </>
      )}

      {/* ── DATA ── */}
      {activeNav === "Data" && (
        <>
          <Section title="Score Indicators" desc="Color-coded score displays used in assessment results and coverage dashboards.">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[
                { score: 92, label: "Excellent", color: "#16A34A", bg: "#F0FDF4" },
                { score: 75, label: "Good",      color: "#2563EB", bg: "#EFF6FF" },
                { score: 61, label: "Average",   color: "#D97706", bg: "#FFFBEB" },
                { score: 38, label: "Poor",      color: "#DC2626", bg: "#FEF2F2" },
              ].map(({ score, label, color, bg }) => (
                <Box
                  key={label}
                  sx={{ p: 3, bgcolor: bg, border: `1px solid ${color}25`, borderRadius: 3, textAlign: "center", flex: "1 1 120px" }}
                >
                  <Typography sx={{ fontSize: "36px", fontWeight: 800, color, lineHeight: 1 }}>{score}</Typography>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color, mt: 0.5, textTransform: "uppercase" }}>
                    {label}
                  </Typography>
                  <LinearProgress
                    variant="determinate" value={score}
                    sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: `${color}20`,
                      "& .MuiLinearProgress-bar": { bgcolor: color } }}
                  />
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="List Rows" desc="Standard member / result row pattern used in tables and drawers.">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { name: "Alice Dupont",  email: "alice@acme.com",  role: "Manager", roleColor: "#0D9488", score: 88 },
                { name: "Bob Martin",    email: "bob@acme.com",    role: "HR",      roleColor: "#DC2626", score: 72 },
                { name: "Carla Rossi",   email: "carla@acme.com",  role: "Tech Lead",roleColor:"#2563EB", score: 94 },
              ].map(({ name, email, role, roleColor, score }) => (
                <Box
                  key={name}
                  sx={{ display: "flex", alignItems: "center", gap: 2, p: 2,
                    bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E5E7EB",
                    "&:hover": { borderColor: "#99F6E4", bgcolor: "#F0FDFA" }, transition: "all 0.15s" }}
                >
                  <Avatar sx={{ bgcolor: roleColor, width: 40, height: 40, fontSize: "14px", fontWeight: 700 }}>
                    {name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{name}</Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{email}</Typography>
                  </Box>
                  <Chip label={role} size="small"
                    sx={{ bgcolor: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30`,
                      fontWeight: 700, fontSize: "10px", height: 22 }} />
                  <Box sx={{ textAlign: "right", minWidth: 48 }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 800, color: score >= 80 ? "#16A34A" : score >= 65 ? "#2563EB" : "#D97706" }}>
                      {score}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>score</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="Spacing & Radius" desc="Border-radius and spacing tokens used consistently across the UI.">
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {[
                { label: "4px",  radius: "4px",  bg: "#0D9488" },
                { label: "8px",  radius: "8px",  bg: "#7C3AED" },
                { label: "12px", radius: "12px", bg: "#2563EB" },
                { label: "16px", radius: "16px", bg: "#C2410C" },
                { label: "24px", radius: "24px", bg: "#16A34A" },
                { label: "50%",  radius: "50%",  bg: "#D97706" },
              ].map(({ label, radius, bg }) => (
                <Box key={label} sx={{ textAlign: "center" }}>
                  <Box sx={{ width: 56, height: 56, bgcolor: bg, borderRadius: radius, mx: "auto" }} />
                  <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 1 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Section>
        </>
      )}
    </Box>
  );
};

export default DesignSystem;
