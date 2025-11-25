import { fetchPricingPlans, PricingPlan, selectPricingPlans, selectPricingPlansLoading } from "@/store/slices/tokenSlice";
import { AppDispatch } from "@/store/store";
import { Box, Radio, RadioGroup, Typography, Skeleton, Button } from "@mui/material";
import Image from "next/image";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

interface TokenPlansSelectorProps {
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  setSelectedPlan: (plan: PricingPlan | null) => void;
  selectedPlan: PricingPlan | null;
}

interface PricingPlansResponse {
  plans: PricingPlan[];
}

const TokenPlansSelector = ({ onNext, onBack, onClose, setSelectedPlan, selectedPlan }: TokenPlansSelectorProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const pricingPlans = useSelector(selectPricingPlans) as PricingPlansResponse | null;
  const loading = useSelector(selectPricingPlansLoading);

  useEffect(() => {
    dispatch(fetchPricingPlans());
  }, [dispatch]);

  const handlePlanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const planId = event.target.value;
    const selectedPlanObject = pricingPlans?.plans?.find(plan => plan.id === planId);
    setSelectedPlan(selectedPlanObject || null);
  };

  const handleNextClick = () => {
    if (!selectedPlan) {
      return;
    }
    onNext();
  };

  const handlePlanClick = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const calculateTaiTokens = (usdAmount: number): number => {
    return Math.floor(usdAmount * 1000);
  };

  const PlanSkeleton = () => (
    <Box
      sx={{
        p: 2,
        borderRadius: "8px",
        border: "1px solid rgba(228, 229, 232, 1)",
        boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
      }}
    >
      <Skeleton variant="circular" width={43} height={43} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          flex: 1,
          gap: 0.5,
        }}
      >
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Skeleton variant="rounded" width={60} height={28} />
        <Skeleton variant="circular" width={20} height={20} />
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "34px",
            color: "rgba(0, 0, 0, 1)",
          }}
        >
          Token Packs
        </Typography>

        {loading ? (
          <Box>
            {[1, 2, 3].map((index) => (
              <PlanSkeleton key={index} />
            ))}
          </Box>
        ) : (
          <RadioGroup value={selectedPlan?.id || ""} onChange={handlePlanChange}>
            {pricingPlans?.plans?.map((plan: PricingPlan) => (
              <Box
                key={plan.id}
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  border: "1px solid rgba(228, 229, 232, 1)",
                  boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                  },
                  ...(selectedPlan?.id === plan.id && {
                    borderColor: "rgba(222, 147, 0, 0.5)",
                    backgroundColor: "rgba(222, 147, 0, 0.05)",
                  }),
                }}
                onClick={() => handlePlanClick(plan)}
              >
                <Image 
                  src="/icons/token.svg" 
                  alt="token" 
                  width={43} 
                  height={43} 
                  priority={false}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "20px",
                      lineHeight: "24px",
                      color: "rgba(222, 147, 0, 1)",
                    }}
                  >
                    {calculateTaiTokens(plan.priceUsd)} tokens
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "24px",
                      color: "rgba(132, 132, 132, 1)",
                    }}
                  >
                    ${plan.priceUsd} | {plan.hbarPrice?.toFixed(3)} HBAR
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {/* {plan?.bonus && (
                    <Box
                      sx={{
                        borderRadius: "8px",
                        px: 1,
                        border: "0.25px solid rgba(10, 167, 107, 1)",
                        background: "rgba(10, 167, 107, 0.1)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "28px",
                          textAlign: "center",
                          color: "rgba(10, 167, 107, 1)",
                        }}
                      >
                        {plan?.bonus}
                      </Typography>
                    </Box>
                  )} */}
                  <Radio
                    value={plan.id}
                    checked={selectedPlan?.id === plan.id}
                    sx={{
                      color: "rgba(228, 229, 232, 1)",
                      "&.Mui-checked": {
                        color: "rgba(12, 218, 139, 1)",
                      },
                    }}
                  />
                </Box>
              </Box>
            ))}
          </RadioGroup>
        )}

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "100%",
            color: "rgba(0, 0, 0, 1)",
          }}
        >
          Tokens never expire and are non-refundable.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "100%",
            color: "rgba(0, 0, 0, 1)",
          }}
        >
          Need a custom plan? Contact our sales team for enterprise solutions.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          p: 3,
          pt: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            border: "none",
            background: "none",
            color: "rgba(133, 169, 227, 1)",
            textDecoration: "none",
            "&:hover": {
              background: "none",
              textDecoration: "none",
              color: "rgba(133, 169, 227, 0.8)",
            },
          }}
        >
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(133, 169, 227, 1)",
              textDecoration: "none",
              "&:hover": {
                background: "none",
                textDecoration: "none",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              height: 42,
              backgroundColor: "white",
              color: "rgba(224, 154, 16, 1)",
              border: "1px solid rgba(224, 154, 16, 1)",
              borderRadius: "38px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textTransform: "none",
              "&:hover": {
                boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
                backgroundColor: "rgba(224, 154, 16, 0.1)",
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
                border: "none",
              },
            }}
            onClick={handleNextClick}
            disabled={!selectedPlan}
          >
            Continue to Payment
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default TokenPlansSelector;