import './TripSettingsCard.scss'
import {useState} from "react";
import {Button} from "../../../../components/Button/Button.tsx";
import {ApiError} from "../../../../api/ApiError.ts";

type TripSettingsCardProps = {
    tripName: string;
    // видаляти подорож може лише власник
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => Promise<void>;
}

export const TripSettingsCard = ({tripName, canDelete, onEdit, onDelete}: TripSettingsCardProps) => {
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleDelete = async () => {
        setError('');
        setIsDeleting(true);

        try {
            await onDelete();
        } catch (err) {
            if (err instanceof ApiError && err.status === 403) {
                setError('Видаляти подорож може лише власник');
            } else if (err instanceof ApiError) {
                setError('Не вдалося видалити, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
            setIsDeleting(false);
        }
    };

    return (
        <section className="trip-settings" aria-labelledby="trip-settings-title">
            <h2 id="trip-settings-title" className="trip-settings__title">Налаштування подорожі</h2>
            <p className="trip-settings__text">Змінити назву, опис чи дати поїздки.</p>

            <Button variant="secondary" size="lg" className="trip-settings__button" onClick={onEdit}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>
                </svg>
                Редагувати
            </Button>

            {canDelete && !isConfirming && (
                <Button variant="danger" size="lg" className="trip-settings__button"
                        onClick={() => setIsConfirming(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>
                    </svg>
                    Видалити подорож
                </Button>
            )}

            {canDelete && isConfirming && (
                <div className="trip-settings__confirm" role="alertdialog" aria-labelledby="trip-settings-confirm">
                    <p id="trip-settings-confirm" className="trip-settings__confirm-text">
                        Видалити «{tripName}» разом з усіма витратами? Це не можна скасувати.
                    </p>
                    <div className="trip-settings__confirm-actions">
                        <Button variant="white" size="sm" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
                            Скасувати
                        </Button>
                        <Button variant="danger" size="sm" className="trip-settings__confirm-delete"
                                onClick={handleDelete} loading={isDeleting}>
                            Видалити
                        </Button>
                    </div>
                </div>
            )}

            {error && <p className="trip-settings__error" role="alert">{error}</p>}
        </section>
    );
};
