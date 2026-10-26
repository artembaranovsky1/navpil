// усі ключі кешу в одному місці, щоб мутації інвалідовували саме те, що треба
export const queryKeys = {
    me: ['me'] as const,
    trips: ['trips'] as const,
    // вкладений у trips: інвалідація trips оновлює й підсумки
    tripsSummary: ['trips', 'summary'] as const,
    trip: (tripId: string) => ['trip', tripId] as const,
    expenses: (tripId: string) => ['expenses', tripId] as const,
    payments: (tripId: string) => ['payments', tripId] as const,
};
