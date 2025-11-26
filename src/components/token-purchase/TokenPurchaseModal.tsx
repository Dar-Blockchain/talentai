"use client";

import React from "react";
import { Box, Typography, Modal } from "@mui/material";
import Image from "next/image";
import TokenBalance from "./TokenBalance";
import TokenPlansSelector from "./TokenPlansSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import ConfirmTransaction from "./ConfirmTransaction";
import { closeModal, STEPS } from "@/store/slices/tokenPurchaseSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";

function TokenPurchaseModal() {
  const dispatch = useDispatch<AppDispatch>();
  const { open, currentStep } = useSelector(
    (state: RootState) => state.tokenPurchase
  );

  const onClose = () => dispatch(closeModal());

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.TOKEN_BALANCE:
        return "Buy Tokens";
      case STEPS.TOKEN_PLANS:
        return "Purchase Token Packs";
      case STEPS.PAYMENT_METHOD:
        return "Payment Method";
      case STEPS.CONFIRM_TRANSACTION:
        return "Confirm Transaction";
      default:
        return "Buy Tokens";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.TOKEN_BALANCE:
        return <TokenBalance />;

      case STEPS.TOKEN_PLANS:
        return <TokenPlansSelector />;

      case STEPS.PAYMENT_METHOD:
        return <PaymentMethodSelector />;

      case STEPS.CONFIRM_TRANSACTION:
        return <ConfirmTransaction />;

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{zIndex: 50}}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 3,
            borderBottom: "1px solid rgba(227,229,233,1)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
              color: "rgba(41,210,145,1)",
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
            style={{ cursor: "pointer" }}
          />
        </Box>

        <Box sx={{ maxHeight: "80vh", overflow: "auto" }}>
          {renderStepContent()}
        </Box>
      </Box>
    </Modal>
  );
}

export default TokenPurchaseModal;
