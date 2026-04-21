import axiosInstance from "@/utils/axiosInstance";

export const payWithCard = async (planId: string) => {
  try {
    const res = await axiosInstance.post("stripe/create-checkout-session", { planId });
    const data = res.data;

    if (!data.url) {
      throw new Error("Stripe session URL missing");
    }

    if (data.paymentId) {
      localStorage.setItem("pending_payment_id", data.paymentId);
    }

    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error("Stripe payment error:", err);
    throw err;
  }
};
