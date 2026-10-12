import './PaidByMembers.scss'
import type {MemberBalance} from "../../../../utils/settle.ts";
import type {TripMember} from "../../../../api/trips.ts";
import {getMemberName} from "../../../../utils/settle.ts";
import {formatMoney} from "../../../../utils/format.ts";

type PaidByMembersProps = {
    members: TripMember[];
    balances: MemberBalance[];
}

export const PaidByMembers = ({members, balances}: PaidByMembersProps) => {
    const total = balances.reduce((sum, balance) => sum + balance.paid, 0);
    const sorted = [...balances].sort((a, b) => b.paid - a.paid);

    return (
        <section aria-label="Хто скільки заплатив" className="paid-by-members">
            <h2 className="paid-by-members__title">Хто скільки заплатив</h2>
            <div className="paid-by-members__list">
                {sorted.map((balance) => (
                    <div key={balance.id}>
                        <div className="paid-by-members__row">
                            <span>{getMemberName(members, balance.id)}</span>
                            <span className="paid-by-members__amount">{formatMoney(balance.paid)}</span>
                        </div>
                        <div className="paid-by-members__track">
                            <div
                                className="paid-by-members__fill"
                                style={{width: total > 0 ? `${(balance.paid / total) * 100}%` : 0}}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
