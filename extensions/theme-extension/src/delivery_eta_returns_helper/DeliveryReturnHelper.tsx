import React, { useEffect, useState } from "react";

// types
type DeliveryDays = {
  min: number;
  max: number;
};

type Region = {
  code: string;
  name: string;
  inStockDeliveryDays: DeliveryDays;
  preOrderDeliveryDays: DeliveryDays;
};

type Variant = {
  id: number;
  title: string;
  available: boolean;
  price: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
};

type DeliveryReturnHelperProps = {
  regionsUrl?: string;
  leadTime?: number;
  availability?: boolean;
  tags?: string[];
  variants?: Variant[];
  initialVariantId?: string | null;
};

export default function DeliveryReturnHelper({
  regionsUrl,
  leadTime = 0,
  availability = true,
  tags = [],
  variants = [],
  initialVariantId = null,
}: DeliveryReturnHelperProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    const currentVariant = variants.find((v) => String(v.id) === initialVariantId);
    return currentVariant || variants[0] || null;
  });

  useEffect(() => {
    // this useEffect detects variant changes
    const variantInput = document.querySelector<HTMLInputElement>(
      'form[action*="/cart/add"] input[ref="variantId"]'
    );
    if (!variantInput) {
      return;
    }

    const syncVariant = () => {
      const match = variants.find((v) => String(v.id) === variantInput.value);
      if (match) {
        setSelectedVariant(match)
      }
    };

    syncVariant();

    const observer = new MutationObserver(syncVariant);
    observer.observe(variantInput, {
      attributes: true,
      attributeFilter: ["value"],
    });
    variantInput.addEventListener("change", syncVariant);

    return () => {
      observer.disconnect();
      variantInput.removeEventListener("change", syncVariant);
    };
  }, [variants]);

  useEffect(() => {
    // this useEffect loads the regions from the regionsUrl
    if (!regionsUrl) {
      return;
    }

    fetch(regionsUrl)
      .then((res) => res.json())
      .then((data: Region[]) => {
        setRegions(data);
        if (data.length > 0) {
          const [defaultRegion] = data;
          setSelectedRegion(defaultRegion);
        }
      })
      .catch((err) => console.error("Failed to load regions:", err))
      .finally(() => setLoading(false));
  }, [regionsUrl]);

  if (loading) {
    return <p style={{ margin: 0, fontSize: "14px" }}>Loading delivery info…</p>;
  }

  if (!selectedRegion) {
    return <p style={{ margin: 0, fontSize: "14px" }}>No delivery info available.</p>;
  }

  const variantAvailable = selectedVariant?.available || availability;
  // if variant is available, use inStockDeliveryDays, otherwise use preOrderDeliveryDays
  const deliveryDays = variantAvailable
    ? selectedRegion.inStockDeliveryDays
    : selectedRegion.preOrderDeliveryDays;

  const today = new Date();

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + deliveryDays.min + leadTime);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + deliveryDays.max + leadTime);

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

    return startMonth === endMonth
      ? `${startDay} - ${endDay} ${startMonth}`
      : `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <div className="react-block">
      {selectedVariant && (
        <div
          className="variant-info"
          style={{
            padding: "12px 16px",
            marginBottom: "12px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600 }}>
            Selected Variant: {selectedVariant.title}
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Availability:{" "}
            <span
              style={{
                fontWeight: 600,
                color: selectedVariant.available ? "#2e7d32" : "#c62828",
              }}
            >
              {selectedVariant.available ? "In Stock" : "Out of Stock"}
            </span>
          </p>
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 600 }}>
            Tags
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  fontSize: "12px",
                  borderRadius: "16px",
                  backgroundColor: "#e8e8e8",
                  color: "#333",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          padding: "12px 16px",
          marginBottom: "12px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <label
          htmlFor="region-select"
          style={{ fontSize: "14px", fontWeight: 600, marginRight: "8px" }}
        >
          Ship to:
        </label>
        <select
          id="region-select"
          value={selectedRegion.code}
          onChange={(e) =>
            setSelectedRegion(regions.find((r) => r.code === e.target.value) || null)
          }
          style={{
            padding: "6px 10px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            width: "100%"
          }}
        >
          {regions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>

        <p style={{ margin: "10px 0 4px", fontSize: "14px" }}>
          Arrives between <strong>{formatDateRange(minDate, maxDate)}</strong>
        </p>

        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
          Arrival date may vary depending on the region. You are currently viewing
          the delivery date for <strong>{selectedRegion.name}</strong>.
        </p>
      </div>
    </div>
  );
}
