import React, { useState } from "react";
import { Box, Typography, Avatar, Card, CardContent, Stack, IconButton } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const testimonials = [

    {
        name: "Takwa",
        role: "Front-end developer at Dar Blockchain",
        quote: "It's like LinkedIn, but built for proof, not fluff.",
        avatar: "/takwa.jpg", // Replace with real image paths
    },
    {
        name: "Mouna",
        role: "Full Stack developer at Dar Blockchain",
        quote: "I got hired by a blockchain startup within 2 weeks.",
        avatar: "/mouna.jpg",
    },
    {
        name: "Jassem",
        role: "Back-end developer",
        quote: "I stopped getting ghosted. Companies take me seriously now.",
        avatar: "/jasser.jpg",
    },
];

const TestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex >= testimonials.length - 3 ? 0 : prevIndex + 1
        );
    };

    const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

    return (

        <Box
            sx={{
                // background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.15) 0%, #FFFFFF 100%)',
                backgroundImage: 'url("/backgroundPurple.png")', // 👉 remplace par ton chemin réel
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: '4rem 2rem',
                borderRadius: '1rem',
                margin: '2rem 0',
                // boxShadow: '-20px 0 30px -10px rgba(131, 16, 255, 0.2)', // Ombre portée à gauche
            }}
        >
            {/* Title */}
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
                    Real Stories,
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
                        Real Impact
                    </Typography>
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


            {/* Arrows */}
            <Stack direction="row" justifyContent="end" mb={4} mr={4} mt={4} spacing={2}>
                <IconButton
                    onClick={handlePrevious}
                    sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#8310FF",
                        borderRadius: "50%",
                        p: 1,
                        '&:hover': {
                            backgroundColor: "#6B0CD9",
                        },
                    }}
                >
                    <img
                        src="/VectorLeft.png"
                        alt="Previous"
                        // style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </IconButton>

                <IconButton
                    onClick={handleNext}
                    sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#8310FF",
                        borderRadius: "50%",
                        p: 1,
                        '&:hover': {
                            backgroundColor: "#6B0CD9",
                        },
                    }}
                >
                    <img
                        src="/VectorRight.png"
                        alt="Next"
                    />
                </IconButton>
            </Stack>
            {/* Cards */}
            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                {visibleTestimonials.map((t, index) => (
                    <Card
                        key={index}
                        variant="outlined"
                        sx={{
                            width: 400,
                            height: 170,
                            borderRadius: 3,
                            borderColor: "#D0B7FF",
                            backgroundColor: "#fff",
                            '&:hover': {
                                boxShadow: 4,
                            },
                        }}
                    >
                        <CardContent sx={{ textAlign: "left", p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                <Avatar src={t.avatar} alt={t.name} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {t.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t.role}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Typography variant="body2" sx={{ color: "#000" }}>
                                “{t.quote}”
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>


        </Box>
    );
};

export default TestimonialsSection;
