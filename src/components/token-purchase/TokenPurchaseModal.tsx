import React, { useState } from "react";
import { Box, Typography, Modal } from "@mui/material";
import Image from "next/image";
import TokenBalance from "./TokenBalance";
import TokenPlansSelector from "./TokenPlansSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import ConfirmTransaction from "./ConfirmTransaction";
import { PricingPlan } from "@/store/slices/tokenSlice";
import { WalletInfo } from "@/services/hashConnectService";

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

interface TokenPurchaseModalProps {
  open: boolean;
  handleClose: () => void;
}

export const STEPS = {
  TOKEN_BALANCE: 0,
  TOKEN_PLANS: 1,
  PAYMENT_METHOD: 2,
  CONFIRM_TRANSACTION: 3,
} as const;

function TokenPurchaseModal({ open, handleClose }: TokenPurchaseModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(STEPS.TOKEN_BALANCE);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onClose = () => {
    handleClose();
    setCurrentStep(STEPS.TOKEN_BALANCE);
    setSelectedPlan(null);
    setSelectedPaymentMethod("");
    setWalletInfo(null);
    setIsProcessing(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.CONFIRM_TRANSACTION) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.TOKEN_BALANCE) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePaymentMethodSelected = (method: string, info?: WalletInfo) => {
    setSelectedPaymentMethod(method);
    if (info) {
      setWalletInfo(info);
    }
    handleNext();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.TOKEN_BALANCE:
        return "Buy Tokens";
      case STEPS.TOKEN_PLANS:
        return "Purchase Token Packs";
      case STEPS.PAYMENT_METHOD:
        return "Payment";
      case STEPS.CONFIRM_TRANSACTION:
        return "Confirm Transaction";
      default:
        return "Buy Tokens";
    }
  };

  const calculateTaiTokens = () => {
    return selectedPlan ? Math.floor(selectedPlan.priceUsd * 1000) : 0;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.TOKEN_BALANCE:
        return <TokenBalance onNext={handleNext} onClose={onClose} />;
      case STEPS.TOKEN_PLANS:
        return (
          <TokenPlansSelector
            onNext={handleNext}
            onBack={handleBack}
            onClose={onClose}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
        );
      case STEPS.PAYMENT_METHOD:
        return (
          <PaymentMethodSelector
            onBack={handleBack}
            onClose={onClose}
            selectedPlan={selectedPlan}
            onPaymentMethodSelected={handlePaymentMethodSelected}
          />
        );
      case STEPS.CONFIRM_TRANSACTION:
        return (
          <ConfirmTransaction
            selectedPlan={selectedPlan}
            walletInfo={walletInfo}
            setWalletInfo={setWalletInfo}
            setCurrentStep={setCurrentStep}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            amount={selectedPlan?.totalHbar || 0}
            tokens={calculateTaiTokens()}
            priceUsd={selectedPlan?.priceUsd}
            onBack={handleBack}
          />
        );
      default:
        return <TokenBalance onNext={handleNext} onClose={onClose} />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="buy-tokens-modal-title"
      aria-describedby="buy-tokens-modal-description"
      sx={{ zIndex: 50 }}
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
            {getStepTitle()}
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
          />
        </Box>
        <Box sx={{ overflow: "auto", maxHeight: "80vh" }}>
          {renderStepContent()}
        </Box>
      </Box>
    </Modal>
  );
}

export default TokenPurchaseModal;
