"use client";

import { PricingTable } from "@/modules/billings/ui/components/pricing-table";

export const BillingView = () => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 md:flex-row justify-between md:items-center w-full p-4 border-b">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-3xl font-mono font-medium">
            Plans and Billing
          </h1>
        </div>
      </div>
      <div className="m-8">
        <p className="mb-4 text-center">
          Choose the plan that&apos;s right for you.
        </p>
        <PricingTable />
      </div>
    </div>
  );
};
