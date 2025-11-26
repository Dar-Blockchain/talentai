import { loadStripe, Stripe } from "@stripe/stripe-js";

export const payWithCard = async (planId: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}api/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create Stripe session");
    }

    if (!data.sessionId) {
      throw new Error("Stripe session ID missing");
    }

    // Get the checkout session URL from your backend
    // You'll need to modify your backend to return the URL
    const checkoutUrl = data.url || `/checkout/${data.sessionId}`;
    
    // Open in new tab
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    
  } catch (err) {
    console.error("Stripe payment error:", err);
    throw err;
  }
};