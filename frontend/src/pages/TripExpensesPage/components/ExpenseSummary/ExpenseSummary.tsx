import './ExpenseSummary.scss'
import type {ExpenseResponse} from "../../../../api/expense.ts";
import type {PaymentResponse} from "../../../../api/payments.ts";
import type {TripResponse} from "../../../../api/trips.ts";
import {formatMoney, formatSignedMoney} from "../../../../utils/format.ts";
import {calculateSettlement, countTripDays, totalAmount} from "../../../../utils/settle.ts";

type ExpenseSummaryProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
}

export const ExpenseSummary = ({trip, expenses, payments, currentUserId}: ExpenseSummaryProps) => {
    const {balances, remaining} = calculateSettlement(trip.members, expenses, payments);

    const total = totalAmount(expenses);
    const myRemaining = currentUserId ? remaining[currentUserId] ?? 0 : 0;
    const myShare = balances.find((balance) => balance.id === currentUserId)?.share ?? 0;
    const perDay = total / countTripDays(trip);

    return (
        <div className="expense-summary__stats">
            <div className="expense-summary__card">
                <div className="expense-summary__label">
                    Витрачено разом
                </div>
                <div className='expense-summary__stat'>
                    {formatMoney(total)} ₴
                </div>
            </div>

            <div className="expense-summary__card">
                <div className="expense-summary__label">
                    Твій баланс
                </div>
                <div className={myRemaining > 0 ? 'expense-summary__stat expense-summary__stat--positive' : 'expense-summary__stat'}>
                    {formatSignedMoney(myRemaining)} ₴
                </div>
            </div>

            <div className="expense-summary__card">
                <div className="expense-summary__label">
                    Твоя частка
                </div>
                <div className='expense-summary__stat'>
                    {formatMoney(myShare)} ₴
                </div>
            </div>

            <div className="expense-summary__card">
                <div className="expense-summary__label">
                    У середньому на день
                </div>
                <div className='expense-summary__stat'>
                    {formatMoney(Math.round(perDay))} ₴
                </div>
            </div>
        </div>
    )
}
