let scriptPromise = null;

export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(window.Razorpay);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else { scriptPromise = null; reject(new Error("Razorpay Checkout failed to initialize.")); }
    };
    s.onerror = () => { scriptPromise = null; reject(new Error("Could not load Razorpay Checkout. Check your internet connection.")); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Opens Razorpay Standard Checkout. Resolves with:
 *  - { razorpay_payment_id, razorpay_order_id, razorpay_signature } on success
 *  - { dismissed: true } if the customer closes the modal
 *  - { failed: true, error } if Razorpay reports a payment failure
 */
export async function openRazorpayCheckout({ key, amount, currency, orderId, name, image, prefill }) {
  const Razorpay = await loadRazorpay();
  return new Promise((resolve) => {
    const options = {
      key,
      amount,
      currency: currency || "INR",
      order_id: orderId,
      name: name || "Deep Jyoti Medical",
      ...(image ? { image } : {}),
      prefill: prefill || {},
      theme: { color: "#1f3a2e" },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => resolve({ dismissed: true }) },
    };
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", (resp) => resolve({ failed: true, error: resp?.error || { description: "Payment failed." } }));
    rzp.open();
  });
}