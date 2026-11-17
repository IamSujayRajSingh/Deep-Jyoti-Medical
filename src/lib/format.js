export const formatINR = (n) => {
  if (n == null || n === "") return null;
  const num = Number(n);
  if (isNaN(num)) return null;
  return "₹" + num.toLocaleString("en-IN");
};

export const discountPercent = (mrp, selling) => {
  if (!mrp || !selling || mrp <= selling) return 0;
  return Math.round(((mrp - selling) / mrp) * 100);
};