import { ExpenseCategory } from '@/api/expense';

export const CATEGORY_ORDER: ExpenseCategory[] = ['transport', 'food', 'housing', 'shopping', 'entertainment', 'other'];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    transport: '#2A78D6',
    food: '#EB6834',
    housing: '#1BAF7A',
    shopping: '#EDA100',
    entertainment: '#E87BA4',
    other: '#008300',
};

// Яскраві фони для аватарок — на кожному білий текст читається
const AVATAR_COLORS = ['#2A78D6', '#E0561F', '#6250D6', '#D14D7F', '#0F8A5F', '#E34948', '#0E8A9A', '#C26A00'];

export const getAvatarColor = (userId: string): string => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};