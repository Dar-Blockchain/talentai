import { selectTokenBalance } from "@/store/slices/tokenSlice";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { closeModal, nextStep } from "@/store/slices/tokenPurchaseSlice";
import { AppDispatch } from "@/store/store";

const TokenBalance = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tokenBalance = useSelector(selectTokenBalance);

  const onClose = () => dispatch(closeModal());
  const onNext = () => dispatch(nextStep());

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
            variant="body2"
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
            {tokenBalance} tokens
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          p: 3,
          pt: 2,
          borderTop: "1px solid rgba(227, 229, 233, 1)",
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
          }}
          onClick={onNext}
        >
          Buy More Tokens
        </Button>
      </Box>
    </>
  );
};

export default TokenBalance;
