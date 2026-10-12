export const now = new Date();

export const formattedDate: string = now.toLocaleDateString('uk-UA', {
    weekday: 'long',   // день тижня (наприклад, "середа")
    month: 'long',     // місяц ("жовтня")
    day: 'numeric'     // день ("7")
});