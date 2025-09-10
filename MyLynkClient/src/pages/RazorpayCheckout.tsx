import React from "react";
import axios from "axios";

const RazorpayCheckout: React.FC = () => {
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    // 1. Create order from backend
    const { data: order } = await axios.post("http://localhost:9000/payment/create-order", {
      amount: 500, // INR 500
    });

    // 2. Setup Razorpay payment options
    const options: RazorpayOptions = {
      key: "rzp_test_dqQYIxRWLocT0D", // Replace with your Razorpay key_id
      amount: order.amount,
      currency: order.currency,
      name: "Vivlit",
      description: "Vivlit Payment",
      image: "/logo.png", // optional
      order_id: order.id,
      handler: async (response) => {
        const verifyRes = await axios.post("http://localhost:9000/payment/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.data.success) {
          alert("✅ Payment successful!");
        } else {
          alert("❌ Payment verification failed!");
        }
      },
      prefill: {
        name: "Spoorthy",
        email: "spoorthy@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">Razorpay Checkout</h1>
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Pay ₹500
      </button>
    </div>
  );
};


interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}


export default RazorpayCheckout;
