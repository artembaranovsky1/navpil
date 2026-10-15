import "./Settlement.scss";
import {useState} from "react";
import type {ExpenseResponse} from "../../api/expense.ts";
import {createPayment, type PaymentResponse} from "../../api/payments.ts";
import type {TripResponse} from "../../api/trips.ts";
import {calculateSettlement, getMemberName, type Transfer} from "../../utils/settle.ts";
import {formatMoney, formatSignedMoney} from "../../utils/format.ts";

type SettlementProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
    onPaymentCreated: (payment: PaymentResponse) => void;
}

const transferKey = (transfer: Transfer): string => `${transfer.fromId}->${transfer.toId}`;

export const Settlement = ({trip, expenses, payments, currentUserId, onPaymentCreated}: SettlementProps) => {
    const [payingKey, setPayingKey] = useState<string>();
    const [actionError, setActionError] = useState<string>('');

    const {balances, remaining, transfers, naiveTransfersCount} = calculateSettlement(trip.members, expenses, payments);
    const name = (userId: string) => getMemberName(trip.members, userId);

    const myRemaining = currentUserId ? remaining[currentUserId] ?? 0 : 0;
    const maxBalance = Math.max(...balances.map((b) => Math.abs(b.balance)), 0);
    const totals = balances.reduce(
        (sum, b) => ({paid: sum.paid + b.paid, share: sum.share + b.share}),
        {paid: 0, share: 0},
    );
    const totalTransfers = payments.length + transfers.length;
    const showsSavings = naiveTransfersCount > transfers.length;

    const handlePaid = async (transfer: Transfer) => {
        setPayingKey(transferKey(transfer));
        setActionError('');

        try {
            const payment = await createPayment(trip.id, transfer);
            onPaymentCreated(payment);
        } catch {
            setActionError('Не вдалося позначити переказ, спробуйте ще раз');
        } finally {
            setPayingKey(undefined);
        }
    };

    return (
        <>
            <section aria-label="Підсумки" className="settlement__stats">
                <div className="settlement__card">
                    <div className="settlement__label">
                        {myRemaining > 0 ? 'Тобі винні' : myRemaining < 0 ? 'Тобі треба віддати' : 'Ти в розрахунку'}
                    </div>
                    <div className={myRemaining > 0 ? 'settlement__stat settlement__stat--positive' : 'settlement__stat'}>
                        {formatSignedMoney(myRemaining)} ₴
                    </div>
                </div>
                <div className="settlement__card">
                    <div className="settlement__label">Переказів, щоб розрахуватися</div>
                    <div className="settlement__stat settlement__stat--light">
                        {transfers.length}
                        {showsSavings && (
                            <span className="settlement__stat-note"> замість {naiveTransfersCount}</span>
                        )}
                    </div>
                </div>
                <div className="settlement__card">
                    <div className="settlement__label">Оплачено</div>
                    <div className="settlement__stat settlement__stat--light">{payments.length} з {totalTransfers}</div>
                    <div className="settlement__progress">
                        <div
                            className="settlement__progress-fill"
                            style={{width: totalTransfers > 0 ? `${(payments.length / totalTransfers) * 100}%` : 0}}
                        />
                    </div>
                </div>
            </section>

            <div className="settlement__columns">
                <div className="settlement__main">
                    <section aria-label="Баланси" className="settlement__panel">
                        <div className="settlement__panel-header">
                            <h2 className="settlement__panel-title">Баланси</h2>
                        </div>
                        <div className="settlement__axis">
                            <span>винні</span>
                            <span>отримують</span>
                        </div>
                        <div className="settlement__bars">
                            {balances.map((b) => {
                                const width = maxBalance > 0 ? `${(Math.abs(b.balance) / maxBalance) * 100}%` : 0;

                                return (
                                    <div key={b.id} className="settlement__bar-row">
                                        <span className="settlement__bar-name">{name(b.id)}</span>
                                        <div className="settlement__bar-track">
                                            <div className="settlement__bar-half settlement__bar-half--negative">
                                                {b.balance < 0 && (
                                                    <div className="settlement__bar settlement__bar--negative" style={{width}}/>
                                                )}
                                            </div>
                                            <div className="settlement__bar-half">
                                                {b.balance > 0 && (
                                                    <div className="settlement__bar settlement__bar--positive" style={{width}}/>
                                                )}
                                            </div>
                                        </div>
                                        <span className={b.balance > 0 ? 'settlement__bar-value settlement__positive' : 'settlement__bar-value'}>
                                            {formatSignedMoney(b.balance)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section aria-label="Детально" className="settlement__panel settlement__panel--table">
                        <h2 className="settlement__panel-title settlement__table-title">Детально</h2>
                        <div className="settlement__table-scroll">
                            <table className="settlement__table">
                                <thead>
                                <tr>
                                    <th>Учасник</th>
                                    <th>Заплатив</th>
                                    <th>Частка</th>
                                    <th>Баланс</th>
                                </tr>
                                </thead>
                                <tbody>
                                {balances.map((b) => (
                                    <tr key={b.id}>
                                        <td>
                                            {name(b.id)}
                                            {b.id === currentUserId && <span className="settlement__muted"> · ти</span>}
                                        </td>
                                        <td>{formatMoney(b.paid)}</td>
                                        <td className="settlement__muted">{formatMoney(b.share)}</td>
                                        <td className={b.balance > 0 ? 'settlement__strong settlement__positive' : 'settlement__strong'}>
                                            {formatSignedMoney(b.balance)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="settlement__total">
                                    <td>Разом</td>
                                    <td>{formatMoney(totals.paid)}</td>
                                    <td>{formatMoney(totals.share)}</td>
                                    <td>0</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="settlement__aside">
                    <section aria-label="Перекази" className="settlement__transfers">
                        <div className="settlement__panel-header">
                            <h2 className="settlement__panel-title">Перекази</h2>
                            <span className="settlement__transfers-note">
                                {transfers.length > 0 ? `${transfers.length} з ${totalTransfers} очікують` : 'усі розрахувалися'}
                            </span>
                        </div>
                        {transfers.length > 0 ? (
                            <ul className="settlement__transfer-list">
                                {transfers.map((transfer) => (
                                    <li key={transferKey(transfer)} className="settlement__transfer">
                                        <span className="settlement__transfer-info">
                                            <span className="settlement__transfer-who">
                                                {name(transfer.fromId)} → {name(transfer.toId)}
                                            </span>
                                            <span className="settlement__transfer-amount">{formatMoney(transfer.amount)} ₴</span>
                                        </span>
                                        <button
                                            type="button"
                                            className="settlement__paid"
                                            onClick={() => handlePaid(transfer)}
                                            disabled={payingKey !== undefined}
                                        >
                                            {payingKey === transferKey(transfer) ? 'Зберігаю…' : 'Оплачено'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="settlement__transfers-empty">Ніхто нікому нічого не винен.</p>
                        )}
                        {actionError && <p className="settlement__error" role="alert">{actionError}</p>}
                    </section>
                </div>
            </div>
        </>
    );
};
