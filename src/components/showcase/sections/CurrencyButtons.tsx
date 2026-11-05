"use client";

import { useState } from "react";
import CurrencyButton from "components/ub/core/buttons/CurrencyButton";
import { Demo } from "../Showcase";

export default function CurrencyButtons() {
  const [currency, setCurrency] = useState<string | null>(null);
  return <Demo name="CurrencyButton" path="components/ub/core/buttons/CurrencyButton.tsx" description="Reusable display-currency picker with currency names, selected state and keyboard navigation. The caller converts amounts. Original preserves each amount’s stored currency."
    code={'<CurrencyButton value={currency} options={["MYR", "USD", "GBP"]} onChange={setCurrency} />'}
    props={[
      { name: "value", type: "string | null", description: "Selected currency code; null displays Original." },
      { name: "options", type: "string[]", description: "Available ISO currency codes, deduplicated automatically." },
      { name: "onChange", type: "(currency: string) => void", description: "Updates the controlled display currency." },
      { name: "size / disabled", type: '"sm" | "md" / boolean', description: "Button size and availability. One or zero currencies disables selection." },
    ]}>
    <div className="flex flex-wrap items-center gap-4">
      <CurrencyButton value={currency} options={["MYR", "USD", "GBP", "EUR", "SGD"]} onChange={setCurrency} />
      <CurrencyButton size="sm" value="MYR" options={["MYR"]} onChange={() => {}} />
    </div>
  </Demo>;
}
