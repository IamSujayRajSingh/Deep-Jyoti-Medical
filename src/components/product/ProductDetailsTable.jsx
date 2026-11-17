import React from "react";

export default function ProductDetailsTable({ product }) {
  const rows = [
    { label: "Brand", value: product.brand },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Product Type", value: product.product_type },
    { label: "Category", value: product.category },
    { label: "Subcategory", value: product.subcategory },
    { label: "Form", value: product.form },
    { label: "Pack Size", value: product.pack_size },
    { label: "Net Quantity", value: product.net_quantity },
    { label: "Ingredients", value: product.ingredients },
    { label: "Country of Origin", value: product.country_of_origin },
    { label: "SKU", value: product.sku },
    { label: "Availability", value: product.stock_status === "out_of_stock" ? "Out of Stock" : "In Stock" },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <section className="py-8 border-t border-border/60">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Product Details</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                <td className="py-3 px-4 font-medium text-foreground w-1/3 align-top">{r.label}</td>
                <td className="py-3 px-4 text-foreground/80">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}