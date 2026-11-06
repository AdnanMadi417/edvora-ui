"use client";

import { useMemo } from "react";
import { useBanks } from "features/partners/banks/hooks";
import type { PartnerBankAccount } from "../../types";

interface Props {
  account: PartnerBankAccount | null | undefined;
}

// "Paying to: <bank name> · <account number>", used anywhere a payout flow
// shows the partner's active account (Batch Payout, status-update payout
// details, void/correction). bank_id and intl_bank_name are XOR on the
// account -- resolving bank_id's name needs the curated Banks list, which
// none of those callers otherwise fetch. Pulled out once here instead of
// duplicating the lookup in each, after three of them were found reading
// intl_bank_name directly and showing a blank name for every curated-bank
// account.
export default function BankAccountPayoutSummary({ account }: Props) {
  const { banks } = useBanks({ include_inactive: true });
  const bankLookup = useMemo(() => new Map(banks.map((b) => [b.id, b])), [banks]);

  if (!account) {
    return <span className="text-red-600">This advisor has no active bank account on file.</span>;
  }

  const bankName = account.bank_id ? bankLookup.get(account.bank_id)?.name ?? "Curated bank" : account.intl_bank_name;

  return (
    <>
      <span className="font-medium text-slate-900">Paying to:</span> {bankName} · {account.account_number}
    </>
  );
}
