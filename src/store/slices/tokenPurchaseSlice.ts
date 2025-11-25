import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PricingPlan } from "./tokenSlice";
import { WalletInfo } from "@/services/hashConnectService";

export const STEPS = {
  TOKEN_BALANCE: 0,
  TOKEN_PLANS: 1,
  PAYMENT_METHOD: 2,
  CONFIRM_TRANSACTION: 3,
} as const;

interface TokenPurchaseState {
  open: boolean;
  currentStep: number;
  selectedPlan: PricingPlan | null;
  paymentMethod: string;
  walletInfo: WalletInfo | null;
  isProcessing: boolean;
}

const initialState: TokenPurchaseState = {
  open: false,
  currentStep: STEPS.TOKEN_BALANCE,
  selectedPlan: null,
  paymentMethod: "",
  walletInfo: null,
  isProcessing: false,
};

const tokenPurchaseSlice = createSlice({
  name: "tokenPurchase",
  initialState,
  reducers: {
    openModal(state) {
      state.open = true;
    },
    closeModal(state) {
      state.open = false;
      state.currentStep = STEPS.TOKEN_BALANCE;
      state.selectedPlan = null;
      state.paymentMethod = "";
      state.walletInfo = null;
      state.isProcessing = false;
    },
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    nextStep(state) {
      if (state.currentStep < STEPS.CONFIRM_TRANSACTION)
        state.currentStep += 1;
    },
    previousStep(state) {
      if (state.currentStep > STEPS.TOKEN_BALANCE)
        state.currentStep -= 1;
    },
    selectPlan(state, action: PayloadAction<PricingPlan>) {
      state.selectedPlan = action.payload;
    },
    selectPaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    setWalletInfo(state, action: PayloadAction<WalletInfo | null>) {
      state.walletInfo = action.payload;
    },
    setProcessing(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  setStep,
  nextStep,
  previousStep,
  selectPlan,
  selectPaymentMethod,
  setWalletInfo,
  setProcessing,
} = tokenPurchaseSlice.actions;

export default tokenPurchaseSlice.reducer;
