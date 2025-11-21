import React, { useState } from "react";
import { Box, Typography, Modal, Button } from "@mui/material";
import Image from "next/image";
import { RadioGroup, Radio } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
};

interface BuyTokensModalProps {
  open: boolean;
  handleClose: () => void;
}

function BuyTokensModal({ open, handleClose }: BuyTokensModalProps) {
  const [showBuyPlans, setShowBuyPlans] = React.useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = React.useState(false);

  const onClose = () => {
    handleClose();
    setShowBuyPlans(false);
    setShowPaymentMethods(false);
  };
  const handleBuyTokens = () => {
    if (!showBuyPlans) {
      setShowBuyPlans(true);
    } else if (showBuyPlans && !showPaymentMethods) {
      setShowPaymentMethods(true);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="buy-tokens-modal-title"
      aria-describedby="buy-tokens-modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            borderBottom: "1px solid rgba(227, 229, 233, 1)",
          }}
        >
          <Typography
            id="buy-tokens-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "25px",
              letterSpacing: "0px",
              color: "rgba(41, 210, 145, 1)",
            }}
          >
            {!showBuyPlans
              ? "Buy Tokens"
              : !showPaymentMethods
              ? "Purchase Token Packs"
              : "Payment"}
          </Typography>
          <Image
            src="/icons/close.svg"
            alt="Close"
            width={12}
            height={12}
            onClick={onClose}
            style={{
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />{" "}
        </Box>
        {!showBuyPlans ? (
          <TokenBalanceSection />
        ) : !showPaymentMethods ? (
          <BuyPlansSection />
        ) : (
          <PaymentMethodsSection />
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            p: 3,
            pt: 2,
          }}
        >
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
          </Button>{" "}
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
            }}
            onClick={handleBuyTokens}
          >
            Buy More Tokens
          </Button>{" "}
        </Box>
      </Box>
    </Modal>
  );
}

export default BuyTokensModal;

const TokenBalanceSection = () => (
  <Box sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
    <Typography
      id="buy-tokens-modal-description"
      variant="body2"
      sx={{
        mb: 1,
        fontFamily: "Poppins",
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "16px",
        lineHeight: "34px",
        letterSpacing: "0px",
        verticalAlign: "middle",
        color: "rgba(0, 0, 0, 1)",
      }}
    >
      Your Current Token Balance
    </Typography>
    <Box
      sx={{
        p: 2,
        borderRadius: "8px",
        border: "1px solid rgba(228, 229, 232, 1)",
        boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Image src="/icons/token.svg" alt="token" width={32} height={32} />
      <Typography
        id="buy-tokens-modal-description"
        variant="body2"
        color="text.secondary"
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "20px",
          lineHeight: "24px",
          letterSpacing: "0%",
          verticalAlign: "middle",
          color: "rgba(222, 147, 0, 1)",
        }}
      >
        1500 tokens
      </Typography>
    </Box>
  </Box>
);

const BuyPlansSection = () => {
  const [selectedPlan, setSelectedPlan] = useState("1500");

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
  };

  const plans = [
    { tokens: "1,500", price: "$10.00", value: "1500", bonus: null },
    { tokens: "3,500", price: "$15.00", value: "3500", bonus: "+30% Tokens" },
    { tokens: "9,500", price: "$25.00", value: "9500", bonus: "+50% Tokens" },
  ];

  return (
    <Box sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontFamily: "Poppins",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "16px",
          lineHeight: "34px",
          letterSpacing: "0px",
          verticalAlign: "middle",
          color: "rgba(0, 0, 0, 1)",
        }}
      >
        Token Packs
      </Typography>

      <RadioGroup value={selectedPlan} onChange={handlePlanChange}>
        {plans.map((plan) => (
          <Box
            key={plan.value}
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
              ...(selectedPlan === plan.value && {
                borderColor: "rgba(222, 147, 0, 0.5)",
                backgroundColor: "rgba(222, 147, 0, 0.05)",
              }),
            }}
            onClick={() => setSelectedPlan(plan.value)}
          >
            <Image src="/icons/token.svg" alt="token" width={43} height={43} />
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
                  fontStyle: "normal",
                  fontSize: "20px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "rgba(222, 147, 0, 1)",
                }}
              >
                {plan.tokens} tokens
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontStyle: "normal",
                  fontSize: "12px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "rgba(132, 132, 132, 1)",
                }}
              >
                {plan.price}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {plan.bonus && (
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
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "28px",
                      letterSpacing: "0px",
                      textAlign: "center",
                      verticalAlign: "middle",
                      color: "rgba(10, 167, 107, 1)",
                    }}
                  >
                    {plan.bonus}
                  </Typography>
                </Box>
              )}
              <Radio
                value={plan.value}
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
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          fontFamily: "Poppins",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
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
          fontStyle: "normal",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "rgba(0, 0, 0, 1)",
        }}
      >
        Need a custom plan? Contact our sales team for enterprise solutions.
      </Typography>
    </Box>
  );
};

const PaymentMethodsSection = () => {
  const [selectedMethod, setSelectedMethod] = useState("1500");

  const handleMethodChange = (event) => {
    setSelectedMethod(event.target.value);
  };

  const methods = [
    { label: "Pay with card", value: "card", icon: "/icons/card.svg" },
    { label: "Wallet", value: "wallet", icon: "/icons/wallet.svg" },
  ];

  return (
    <Box sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontFamily: "Poppins",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "16px",
          lineHeight: "34px",
          letterSpacing: "0px",
          verticalAlign: "middle",
          color: "rgba(0, 0, 0, 1)",
        }}
      >
        Choose payment method
      </Typography>

      <RadioGroup value={selectedMethod} onChange={handleMethodChange}>
        {methods.map((method) => (
          <Box
            key={method.value}
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
              ...(selectedMethod === method.value && {
                borderColor: "rgba(32, 45, 57, 1)",
                backgroundColor: "rgba(32, 45, 57, 0.08)",
              }),
            }}
            onClick={() => setSelectedMethod(method.value)}
          >
            <Image src={method.icon} alt="token" width={34} height={34} />
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
                  fontStyle: "normal",
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "rgba(32, 45, 57, 1)",
                }}
              >
                {method.label}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Radio
                value={method.value}
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
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          fontFamily: "Poppins",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
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
          fontStyle: "normal",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "rgba(0, 0, 0, 1)",
        }}
      >
        Need a custom plan? Contact our sales team for enterprise solutions.
      </Typography>
    </Box>
  );
};
