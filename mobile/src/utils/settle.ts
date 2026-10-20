import {ExpenseResponse} from "@/api/expense";
import {TripMember, TripResponse} from "@/api/trips";
import { PaymentResponse } from '@/api/payments';

export type MemberBalance = {
    id: string;
    paid: number;
    share: number;
    // заплатив мінус частка, без урахування переказів
    balance: number;
};

export type Transfer = {
    fromId: string;
    toId: string;
    amount: number;
};

export type Settlement = {
    balances: MemberBalance[];
    // скільки ще має отримати (+) чи віддати (−) кожен з урахуванням переказів
    remaining: Record<string, number>;
    transfers: Transfer[];
    // скільки переказів було б, якби кожен віддавав платнику за кожну витрату
    naiveTransfersCount: number;
};

export const totalAmount = (expenses: ExpenseResponse[]): number =>
    fromCents(expenses.reduce((sum, expense) => sum + toCents(expense.amount), 0));

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-05-12" -> номер дня (без часових поясів)
const toDayNumber = (date: string): number => Math.floor(Date.parse(date.slice(0, 10)) / DAY_MS);

const todayDayNumber = (): number => {
    const now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS);
};

// Скільки днів враховувати для «в середньому на день»:
// подорож завершилась — уся її тривалість, інакше — від початку до сьогодні включно.
export const countTripDays = (trip: TripResponse): number => {
    if (!trip.startDate) return 1;

    const start = toDayNumber(trip.startDate);
    const end = trip.endDate ? toDayNumber(trip.endDate) : undefined;
    const today = todayDayNumber();

    const last = end !== undefined && end < today ? end : today;

    return Math.max(last - start + 1, 1);
};

export const getMemberName = (members: TripMember[], userId: string): string =>
    members.find((m) => m.id === userId)?.name ?? 'Невідомий';

// Рахуємо в копійках, щоб не накопичувати похибку float
const toCents = (amount: number): number => Math.round(amount * 100);
const fromCents = (cents: number): number => cents / 100;

const splitCents = (cents: number, count: number): number[] => {
    const base = Math.floor(cents / count);
    const remainder = cents - base * count;

    return Array.from({length: count}, (_, index) => base + (index < remainder ? 1 : 0));
};

const getPayerId = (expense: ExpenseResponse): string => expense.paidById ?? expense.addedById;

const getParticipants = (expense: ExpenseResponse, members: TripMember[]): string[] =>
    expense.splitBetween.length > 0 ? expense.splitBetween : members.map((member) => member.id);

const minimizeTransfers = (remaining: Record<string, number>): Transfer[] => {
    const creditors = Object.entries(remaining)
        .filter(([, cents]) => cents > 0)
        .map(([id, cents]) => ({id, cents}))
        .sort((a, b) => b.cents - a.cents);
    const debtors = Object.entries(remaining)
        .filter(([, cents]) => cents < 0)
        .map(([id, cents]) => ({id, cents: -cents}))
        .sort((a, b) => b.cents - a.cents);

    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const cents = Math.min(debtors[i].cents, creditors[j].cents);

        transfers.push({fromId: debtors[i].id, toId: creditors[j].id, amount: fromCents(cents)});

        debtors[i].cents -= cents;
        creditors[j].cents -= cents;

        if (debtors[i].cents === 0) i++;
        if (creditors[j].cents === 0) j++;
    }

    return transfers;
};

export type ExpenseShare = {
    id: string;
    amount: number;
};

// Частка кожного учасника в одній витраті
export const getExpenseShares = (expense: ExpenseResponse, members: TripMember[]): ExpenseShare[] => {
    const participants = getParticipants(expense, members);

    return splitCents(toCents(expense.amount), participants.length).map((cents, index) => ({
        id: participants[index],
        amount: fromCents(cents),
    }));
};

export const calculateSettlement = (
    members: TripMember[],
    expenses: ExpenseResponse[],
    payments: PaymentResponse[],
): Settlement => {
    const paid: Record<string, number> = {};
    const share: Record<string, number> = {};
    const naivePairs = new Set<string>();

    members.forEach((member) => {
        paid[member.id] = 0;
        share[member.id] = 0;
    });

    expenses.forEach((expense) => {
        const payerId = getPayerId(expense);
        const participants = getParticipants(expense, members);
        const cents = toCents(expense.amount);

        paid[payerId] = (paid[payerId] ?? 0) + cents;
        share[payerId] = share[payerId] ?? 0;

        splitCents(cents, participants.length).forEach((part, index) => {
            const participantId = participants[index];
            share[participantId] = (share[participantId] ?? 0) + part;

            if (participantId !== payerId) {
                naivePairs.add(`${participantId}->${payerId}`);
            }
        });
    });

    const balances: MemberBalance[] = Object.keys(paid).map((id) => ({
        id,
        paid: fromCents(paid[id]),
        share: fromCents(share[id]),
        balance: fromCents(paid[id] - share[id]),
    }));

    const remainingCents: Record<string, number> = {};
    Object.keys(paid).forEach((id) => {
        remainingCents[id] = paid[id] - share[id];
    });

    payments.forEach((payment: PaymentResponse) => {
        const cents = toCents(payment.amount);
        remainingCents[payment.fromId] = (remainingCents[payment.fromId] ?? 0) + cents;
        remainingCents[payment.toId] = (remainingCents[payment.toId] ?? 0) - cents;
    });

    const remaining: Record<string, number> = {};
    Object.entries(remainingCents).forEach(([id, cents]) => {
        remaining[id] = fromCents(cents);
    });

    return {
        balances,
        remaining,
        transfers: minimizeTransfers(remainingCents),
        naiveTransfersCount: naivePairs.size,
    };
};
