import React from "react";
import { Box, Typography, Stack, useMediaQuery, useTheme } from "@mui/material";
import SkillBadgeIcon from "../icons/SkillBadgeIcon";
import SoulBoundIcon from "../icons/SoulBoundIcon";
import CareerCard from "./components/CareerCard";
import FeedBackIcon from "../icons/FeedBackIcon";
const featuresJobSeeker = [

    {
        icon: <SkillBadgeIcon />,
        title: "Skill Badges",
        description:
            "Issued after AI evaluations.",
    },
    {
        icon: <SoulBoundIcon />,
        title: (
            <>
                Soulbound NFT CV
            </>
        ), description:
            "Immutable, secure, and yours.",
    },
    {
        icon: <FeedBackIcon />,
        title: "Learning Feedback",
        description:
            "Know exactly where to improve",
    },
];


type CareerSectionProps = {
    type?: string;
    color?: string;
};

const CareerSection = ({ type, color }: CareerSectionProps) => {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

    const itemWidth = isMdUp ? "23%" : isSmUp ? "48%" : "100%";

    return (
        <Box
            id="features"
            sx={{
                py: { xs: 3, sm: 4, md: 5 },
                backgroundColor: "#ffffff",
                color: "#000000",
                maxWidth: '100%',
                mx: 'auto', // 👈 center horizontally
            }}
        >
            <Typography
                variant="h3"
                fontWeight={600}
                gutterBottom
                sx={{
                    fontSize: 'clamp(1rem, 7vw, 3.25rem)',
                    lineHeight: 1.3,
                    mb: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Your Career
                    <Typography
                        component="span"
                        sx={{
                            color: "#8310FF",
                            fontWeight: 700,
                            fontSize: "3rem", // 👈 Adjust size as needed
                            mx: "0.25rem",
                            lineHeight: 1,
                        }}
                    >
                        ,
                    </Typography>
                    On-Chain

                </Box>


            </Typography>

            <Typography
                variant="body1"
                color="#000000"
                sx={{
                    my: { xs: 2, md: 2 },
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
            >
                Three steps to unlock career-changing opportunities:
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="space-between"
                useFlexGap
                sx={{ pt: 2 }}
            >
                {featuresJobSeeker.map((feature, index) => (
                    <Stack key={index} sx={{ width: itemWidth }}>
                        <CareerCard
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
};

export default CareerSection;
