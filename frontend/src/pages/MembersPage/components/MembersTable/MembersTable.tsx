import './MembersTable.scss'
import {useState} from "react";
import {removeMember, type TripMember} from "../../../../api/trips.ts";
import type {ExpenseResponse} from "../../../../api/expense.ts";
import type {PaymentResponse} from "../../../../api/payments.ts";
import {ApiError} from "../../../../api/ApiError.ts";
import {calculateSettlement} from "../../../../utils/settle.ts";
import {formatMoney, formatSignedMoney, pluralize} from "../../../../utils/format.ts";
import {getAvatarColor} from "../../../../utils/colors.ts";

type MembersTableProps = {
    tripId: string;
    members: TripMember[];
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
    currentUserEmail?: string;
    onRemoved: (userId: string) => void;
}

const ROLE_LABELS: Record<TripMember['role'], string> = {
    owner: 'організатор',
    member: 'учасник',
};

const getRemoveError = (err: unknown): string => {
    if (err instanceof ApiError && err.status === 409) return 'Не можна видалити: у учасника є витрати або перекази';
    if (err instanceof ApiError && err.status === 403) return 'Видаляти учасників може лише організатор';
    return 'Не вдалося видалити учасника';
};

export const MembersTable = ({tripId, members, expenses, payments, currentUserId, currentUserEmail, onRemoved}: MembersTableProps) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    const {balances, remaining} = calculateSettlement(members, expenses, payments);
    const paidById = Object.fromEntries(balances.map((balance) => [balance.id, balance.paid]));

    const isOwner = members.find((member) => member.id === currentUserId)?.role === 'owner';

    // поточний користувач — першим, далі організатор
    const sorted = [...members].sort((a, b) =>
        Number(b.id === currentUserId) - Number(a.id === currentUserId) ||
        Number(b.role === 'owner') - Number(a.role === 'owner'));

    const countPaid = (userId: string) =>
        expenses.filter((expense) => (expense.paidById ?? expense.addedById) === userId).length;

    const handleRemove = async (userId: string) => {
        setOpenMenuId(null);
        setError('');
        setRemovingId(userId);

        try {
            await removeMember(tripId, userId);
            onRemoved(userId);
        } catch (err) {
            setError(getRemoveError(err));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <section aria-label="Учасники" className="members-table-card">
            <h2 className="members-table-card__title">Учасники · {members.length}</h2>

            {error && <p role="alert" className="members-table-card__error">{error}</p>}

            <div className="members-table-card__wrap">
                <table className="members-table">
                    <thead>
                    <tr>
                        <th className="members-table__th">Учасник</th>
                        <th className="members-table__th">Роль</th>
                        <th className="members-table__th members-table__th--right">Заплатив</th>
                        <th className="members-table__th members-table__th--right">Баланс</th>
                        <th className="members-table__th members-table__th--actions">
                            <span className="members-table__hidden">Дії</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map((member) => {
                        const isMe = member.id === currentUserId;
                        const balance = remaining[member.id] ?? 0;
                        const paidCount = countPaid(member.id);
                        const canRemove = isOwner && !isMe;

                        return (
                            <tr key={member.id} className="members-table__row">
                                <td className="members-table__td">
                                    <span className="members-table__member">
                                        <span className='members-table__avatar' style={{background: getAvatarColor(member.id)}}>
                                            {member.name.trim().charAt(0).toUpperCase()}
                                        </span>
                                        <span>
                                            <span className="members-table__name">
                                                {member.name}
                                                {isMe && <span className="members-table__you"> · ти</span>}
                                            </span>
                                            <span className="members-table__sub">
                                                {isMe && currentUserEmail
                                                    ? currentUserEmail
                                                    : paidCount > 0
                                                        ? `${paidCount} ${pluralize(paidCount, ['витрата', 'витрати', 'витрат'])}`
                                                        : 'ще без витрат'}
                                            </span>
                                        </span>
                                    </span>
                                </td>
                                <td className={member.role === 'owner' ? 'members-table__td' : 'members-table__td members-table__td--role'}>
                                    {member.role === 'owner'
                                        ? <span className="members-table__role-badge">{ROLE_LABELS.owner}</span>
                                        : ROLE_LABELS.member}
                                </td>
                                <td className="members-table__td members-table__td--right">
                                    {formatMoney(paidById[member.id] ?? 0)}
                                </td>
                                <td className={balance > 0
                                    ? 'members-table__td members-table__td--balance members-table__td--positive'
                                    : 'members-table__td members-table__td--balance'}>
                                    {formatSignedMoney(balance)}
                                </td>
                                <td className="members-table__td members-table__td--right">
                                    {canRemove && (
                                        <span className="members-table__actions">
                                            <button
                                                type="button"
                                                className="members-table__more"
                                                aria-label={`Дії з учасником ${member.name}`}
                                                aria-expanded={openMenuId === member.id}
                                                disabled={removingId === member.id}
                                                onClick={() => setOpenMenuId((current) => current === member.id ? null : member.id)}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                    <circle cx="5" cy="12" r="1.8"/>
                                                    <circle cx="12" cy="12" r="1.8"/>
                                                    <circle cx="19" cy="12" r="1.8"/>
                                                </svg>
                                            </button>

                                            {openMenuId === member.id && (
                                                <span className="members-table__menu">
                                                    <button
                                                        type="button"
                                                        className="members-table__menu-item members-table__menu-item--danger"
                                                        onClick={() => handleRemove(member.id)}
                                                    >
                                                        Видалити з подорожі
                                                    </button>
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
