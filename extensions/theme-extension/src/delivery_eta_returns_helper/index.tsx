import React from "react";
import { createRoot } from "react-dom/client";

import DeliveryReturnHelper from "./DeliveryReturnHelper";

const container = document.getElementById("delivery-eta-returns-helper");
if (container) {
  let variants = [];
  try {
    variants = JSON.parse(container.dataset.variants || "[]");
  } catch {
    console.error("Failed to parse variants data");
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <DeliveryReturnHelper
        regionsUrl={container.dataset.regionsUrl}
        leadTime={Number(container.dataset.leadTime)}
        availability={container.dataset.availability === "true"}
        tags={container.dataset.tags?.split(",").filter(Boolean) || []}
        variants={variants}
        initialVariantId={container.dataset.selectedVariantId || null}
      />
    </React.StrictMode>
  );
}
