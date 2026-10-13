import './MembersPage.scss'
import {ShareSummaryButton} from "../../components/ShareSummaryButton/ShareSummaryButton.tsx";
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {useEffect, useState} from "react";
import {getTrip, type TripResponse} from "../../api/trips.ts";
import {type ExpenseResponse, getExpenses} from "../../api/expense.ts";
import {getPayments, type PaymentResponse} from "../../api/payments.ts";
import {getMe} from "../../api/user.ts";
import {useNavigate, useParams} from "react-router";

export const MembersPage = () => {
    // const [trip, setTrip] = useState<TripResponse | null>(null);
    // const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    // const [payments, setPayments] = useState<PaymentResponse[]>([]);
    // const [currentUserId, setCurrentUserId] = useState<string>();
    // const [isLoading, setIsLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string>('');
    // const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);
    //
    // const {tripId} = useParams();
    // const navigate = useNavigate();
    //
    // useEffect(() => {
    //     if (!tripId) return;
    //
    //     const loadExpenses = async () => {
    //         try {
    //             const [tripData, expensesData, paymentsData, user] = await Promise.all([
    //                 getTrip(tripId),
    //                 getExpenses(tripId),
    //                 getPayments(tripId),
    //                 getMe(),
    //             ]);
    //
    //             setExpenses(expensesData)
    //             setPayments(paymentsData)
    //             setTrip(tripData)
    //             setCurrentUserId(user.id)
    //         } catch {
    //             setError('Не вдалося завантажити витрати')
    //             navigate('/login', {replace: true});
    //         } finally {
    //             setIsLoading(false)
    //         }
    //     }
    //
    //     loadExpenses()
    // }, [tripId])

    return (
        <div className="members-page">
            {/*<TripHeader*/}
            {/*    trip={trip}*/}
            {/*    onAddExpense={() => setIsNewExpenseOpen(true)}*/}
            {/*    actions={<ShareSummaryButton trip={trip} expenses={expenses} payments={payments}/>}*/}
            {/*/>*/}

            <div className="members-page__columns">
                <div className="members-page__main">
                    <section aria-label="Учасники" className="members-page__card members-page__card--table">
                        <h2 className="members-page__title members-page__title--table">Учасники · 3</h2>
                        <div className="members-page__table-wrap">
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
                                <tr className="members-table__row">
                                    <td className="members-table__td">
                                        <span className="members-table__member">
                                            <span className="members-table__avatar members-table__avatar--me">А</span>
                                            <span>
                                                <span className="members-table__name">
                                                    Андрій <span className="members-table__you">· ти</span>
                                                </span>
                                                <span className="members-table__sub">andrii@example.com</span>
                                            </span>
                                        </span>
                                    </td>
                                    <td className="members-table__td">
                                        <span className="members-table__role-badge">організатор</span>
                                    </td>
                                    <td className="members-table__td members-table__td--right">6 000</td>
                                    <td className="members-table__td members-table__td--balance members-table__td--positive">+2 800</td>
                                    <td className="members-table__td"></td>
                                </tr>
                                <tr className="members-table__row">
                                    <td className="members-table__td">
                                        <span className="members-table__member">
                                            <span className="members-table__avatar">
                                                О
                                                <span className="members-table__online-dot"/>
                                            </span>
                                            <span>
                                                <span className="members-table__name">Оля</span>
                                                <span className="members-table__sub members-table__sub--online">зараз онлайн</span>
                                            </span>
                                        </span>
                                    </td>
                                    <td className="members-table__td members-table__td--role">учасниця</td>
                                    <td className="members-table__td members-table__td--right">1 260</td>
                                    <td className="members-table__td members-table__td--balance">−1 940</td>
                                    <td className="members-table__td members-table__td--right">
                                        <button type="button" className="members-table__more" aria-label="Дії з учасницею Оля">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <circle cx="5" cy="12" r="1.8"/>
                                                <circle cx="12" cy="12" r="1.8"/>
                                                <circle cx="19" cy="12" r="1.8"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section aria-label="Остання активність" className="members-page__card">
                        <h2 className="members-page__title">Остання активність</h2>
                        <ul className="activity">
                            <li className="activity__item">
                                <span className="activity__dot activity__dot--new"/>
                                <span className="activity__text">Марія додала «Вечеря в колибі» · 1 740 ₴</span>
                                <span className="activity__time">сьогодні, 21:14</span>
                            </li>
                            <li className="activity__item">
                                <span className="activity__dot"/>
                                <span className="activity__text">Марія приєдналась до подорожі</span>
                                <span className="activity__time">12 травня</span>
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="members-page__aside">
                    <section aria-label="Запрошення" className="invite">
                        <h2 className="invite__title">Запросити друзів</h2>
                        <div className="invite__label">Код запрошення</div>
                        <div className="invite__code">KRP-4821</div>
                        <div className="invite__link">navpil.app/join/KRP-4821</div>
                        <div className="invite__buttons">
                            <button type="button" className="invite__button invite__button--primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="9" y="9" width="11" height="11" rx="2"/>
                                    <path d="M5 15V5a1 1 0 0 1 1-1h9"/>
                                </svg>
                                Копіювати
                            </button>
                            <button type="button" className="invite__button invite__button--secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5"/>
                                </svg>
                                Поділитися
                            </button>
                        </div>
                    </section>

                    <section className="members-page__note">
                        Хто приєднається за кодом, одразу побачить усі витрати й зможе додавати свої.
                        Видаляти учасників може лише організатор.
                    </section>
                </div>
            </div>
        </div>
    );
};
