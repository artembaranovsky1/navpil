import "./ShareSummaryButton.scss";
import {useState} from "react";
import type {ExpenseResponse} from "../../api/expense.ts";
import type {PaymentResponse} from "../../api/payments.ts";
import type {TripResponse} from "../../api/trips.ts";
import {calculateSettlement, getMemberName} from "../../utils/settle.ts";
import {formatMoney} from "../../utils/format.ts";

type ShareSummaryButtonProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
}

export const ShareSummaryButton = ({trip, expenses, payments}: ShareSummaryButtonProps) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleShare = async () => {
        const {transfers} = calculateSettlement(trip.members, expenses, payments);
        const name = (userId: string) => getMemberName(trip.members, userId);

        const lines = transfers.length > 0
            ? transfers.map((t) => `${name(t.fromId)} → ${name(t.toId)}: ${formatMoney(t.amount)} ₴`)
            : ['Усі розрахувалися 🎉'];
        const text = `${trip.name} — розрахунок\n${lines.join('\n')}`;

        try {
            if (navigator.share) {
                await navigator.share({title: trip.name, text});
                return;
            }

            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            // користувач закрив діалог «Поділитися» — нічого не робимо
        }
    };

    return (
        <button type="button" className="share-summary-button" onClick={handleShare}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5"/>
            </svg>
            {isCopied ? 'Скопійовано' : 'Поділитися підсумком'}
        </button>
    );
};
