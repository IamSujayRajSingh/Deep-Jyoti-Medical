/** @type {any} */
const win = typeof window !== "undefined" ? window : {};
let scriptPromise = null;

export function loadRazorpay() {
  if (win.Razorpay) return Promise.resolve(win.Razorpay);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => {
      if (win.Razorpay) resolve(win.Razorpay);
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
 *  - { dismissed: true, error? } if the customer closes the modal. error is the
 *    last failed attempt, if any (Razorpay keeps the modal open after a failure
 *    so the customer can retry with another method).
 */
export async function openRazorpayCheckout({ key, amount, currency, orderId, name, image, prefill }) {
  const Razorpay = await loadRazorpay();
  return new Promise((resolve) => {
    let lastError = null;
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
      modal: { ondismiss: () => resolve({ dismissed: true, error: lastError }) },
    };
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", (resp) => { lastError = resp?.error || { description: "Payment failed." }; });
    rzp.open();
  });
}
