import hashConnectService, {
  ConnectionStatus,
  WalletInfo,
} from "@/services/hashConnectService";
import { payWithCard } from "@/services/stripeService";
import {
  closeModal,
  nextStep,
  previousStep,
  selectPaymentMethod,
  setWalletInfo,
} from "@/store/slices/tokenPurchaseSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Box, Radio, RadioGroup, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

const methods = [
  { label: "Pay with card", value: "card", icon: "/icons/card.svg" },
  { label: "Wallet", value: "wallet", icon: "/icons/wallet.svg" },
];

const PaymentMethodSelector = () => {

  const dispatch = useDispatch<AppDispatch>();
  const { paymentMethod, selectedPlan } = useSelector(
    (state: RootState) => state.tokenPurchase
  );
  const [walletStatus, setWalletStatus] =
    useState<ConnectionStatus>("disconnected");
  const [isHashConnectReady, setIsHashConnectReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onClose = () => dispatch(closeModal());
  const onBack = () => dispatch(previousStep());

  const handleMethodChange = (event: any) => {
    dispatch(selectPaymentMethod(event.target.value));
  };

  const onPaymentMethodSelected = (method: string, info?: any) => {
    dispatch(selectPaymentMethod(method));
    dispatch(setWalletInfo(info || null));
    dispatch(nextStep());
  };

  const connectWallet = async () => {
    try {
      await hashConnectService.connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setErrorMessage(`Failed to connect wallet: ${error}`);
    }
  };

  const handleContinue = async () => {
    if (paymentMethod === "wallet") {
      // For wallet payment, connect first
      await connectWallet();
    } else {
      // For card payment, proceed directly to confirmation
      dispatch(selectPaymentMethod(paymentMethod));
      await payWithCard(selectedPlan?.id!);
      onClose()
    }
  };

  // Initialize HashConnect event handlers
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleWalletConnected = (info: WalletInfo) => {
      setErrorMessage(null);
      // Once wallet is connected, proceed to confirmation
      onPaymentMethodSelected(paymentMethod, info);
    };

    hashConnectService.setEventHandlers({
      onConnectionStatusChange: (status: ConnectionStatus) => {
        setWalletStatus(status);
      },
      onWalletConnected: handleWalletConnected,
      onWalletDisconnected: () => {},
      onError: (error: string) => {
        setErrorMessage(error);
        setWalletStatus("error");
      },
      onInitialized: () => {
        setIsHashConnectReady(true);
      },
    });

    // Check if HashConnect is already ready
    const checkExistingConnection = async () => {
      if (hashConnectService.isReady()) {
        setIsHashConnectReady(true);
        const initialStatus = hashConnectService.getConnectionStatus();
        setWalletStatus(initialStatus);
      }
    };

    checkExistingConnection();
  }, [paymentMethod, onPaymentMethodSelected]);

  return (
    <>
      <Box
        sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}
      >
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

        <RadioGroup value={paymentMethod} onChange={handleMethodChange}>
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
                ...(paymentMethod === method.value && {
                  borderColor: "rgba(32, 45, 57, 0.7)",
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                }),
              }}
              onClick={() => dispatch(selectPaymentMethod(method.value))}
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

        {errorMessage && (
          <Typography
            variant="body2"
            sx={{
              color: "error.main",
              mb: 2,
              fontFamily: "Poppins",
              fontWeight: 400,
            }}
          >
            {errorMessage}
          </Typography>
        )}

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
              "&.Mui-disabled": {
                border: "none",
              },
            }}
            disabled={
              (!isHashConnectReady && paymentMethod === "wallet") ||
              !paymentMethod
            }
            onClick={handleContinue}
          >
            {paymentMethod === "wallet" ? "Connect Wallet" : "Continue"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default PaymentMethodSelector;