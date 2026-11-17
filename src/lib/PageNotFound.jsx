// Restored for local development: this file was missing from the export.
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">404</p>
      <h1 className="font-heading text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page <span className="font-medium text-foreground">{location.pathname}</span> could not be found.
        It may have been moved or is no longer available.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button className="bg-primary text-primary-foreground">Back to Home</Button>
        </Link>
        <Link to="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}
