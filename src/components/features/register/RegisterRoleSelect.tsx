import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import RegisterSignInLink from "./RegisterSignInLink";
import { REGISTER_ACCENT, REGISTER_ACCENT2 } from "./registerConstants";

export type RegisterUserType = "candidate" | "company";

type Props = {
  returnUrl?: string;
  onSelectRole: (role: RegisterUserType) => void;
};

const RegisterRoleSelect = ({ returnUrl, onSelectRole }: Props) => {
  const { t } = useTranslation("auth");

  const ROLES = [
    {
      type: "company" as const,
      icon: BusinessOutlined,
      label: t("register.company_label"),
      description: t("register.company_desc"),
      accent: "#0D9488",
      iconGradient: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
      shadowColor: "rgba(13,148,136,0.22)",
      border: "rgba(13,148,136,0.14)",
    },
    {
      type: "candidate" as const,
      icon: PersonOutlined,
      label: t("register.candidate_label"),
      description: t("register.candidate_desc"),
      accent: "#7C3AED",
      iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
      shadowColor: "rgba(124,58,237,0.2)",
      border: "rgba(124,58,237,0.14)",
    },
  ];

  return (
    <>
      <Box sx={{ mb: { xs: 2.25, sm: 2.875 }, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: { xs: "clamp(1.18rem, 4.2vw, 1.75rem)", sm: "clamp(1.65rem, 3.5vw, 2.2rem)" },
            fontWeight: 800,
            fontFamily: "Poppins",
            color: "#0F172A",
            lineHeight: 1.1,
            mb: { xs: 0.65, sm: 0.625 },
            letterSpacing: "-0.03em",
          }}
        >
          {t("register.get_started")}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.78rem", sm: "1.05rem" },
            color: "#6B7280",
            fontFamily: "Poppins",
            lineHeight: { xs: 1.45, sm: 1.65 },
            px: { xs: 0.25, sm: 0 },
          }}
        >
          {t("register.how_use_prefix")}{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${REGISTER_ACCENT}, ${REGISTER_ACCENT2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TalentAI
          </Box>
          {t("register.how_use_suffix")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.15, sm: 1.625 }, mb: { xs: 2, sm: 2.875 } }}>
        {ROLES.map(({ type, icon: Icon, label, description, accent, iconGradient, shadowColor, border }) => (
          <Box
            key={type}
            role="button"
            tabIndex={0}
            onClick={() => onSelectRole(type)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectRole(type);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.25, sm: 2.125 },
              p: { xs: 1.35, sm: 2.125 },
              borderRadius: { xs: "13px", sm: "18px" },
              border: `1.5px solid ${border}`,
              bgcolor: "#fff",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              "&:hover": {
                boxShadow: `0 10px 36px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.04)`,
                transform: "translateY(-2px)",
                borderColor: accent,
              },
              "&:focus-visible": {
                outline: `2px solid ${accent}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 51 },
                height: { xs: 40, sm: 51 },
                borderRadius: "15px",
                background: iconGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 6px 18px ${shadowColor}`,
              }}
            >
              <Icon sx={{ fontSize: { xs: 19, sm: 23 }, color: "#fff" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.82rem", sm: "1rem" }, color: "#0F172A", mb: { xs: 0.15, sm: 0.3 }, fontFamily: "Poppins" }}>
                {label}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: { xs: "0.72rem", sm: "0.82rem" }, lineHeight: { xs: 1.35, sm: 1.5 }, fontFamily: "Poppins" }}>
                {description}
              </Typography>
            </Box>
            <Box
              sx={{
                width: { xs: 24, sm: 29 },
                height: { xs: 24, sm: 29 },
                borderRadius: "10px",
                bgcolor: `${accent}10`,
                border: `1px solid ${accent}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowForwardOutlined sx={{ fontSize: { xs: 13, sm: 15 }, color: accent }} />
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: { xs: 1.5, sm: 1.625 } }}>
        <RegisterSignInLink
          dense
          returnUrl={returnUrl}
          dividerLabel={t("register.already_account")}
          buttonLabel={t("register.already_account")}
        />
      </Box>
    </>
  );
};

export default RegisterRoleSelect;
