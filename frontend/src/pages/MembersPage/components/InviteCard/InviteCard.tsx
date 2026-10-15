import './InviteCard.scss'
import {useState} from "react";

type InviteCardProps = {
    tripName: string;
    inviteCode: string;
}

export const InviteCard = ({tripName, inviteCode}: InviteCardProps) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const link = `${window.location.origin}/join?code=${encodeURIComponent(inviteCode)}`;
    const displayLink = link.replace(/^https?:\/\//, '');

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            // буфер обміну недоступний — нічого не робимо
        }
    };

    const handleShare = async () => {
        if (!navigator.share) {
            await copyLink();
            return;
        }

        try {
            await navigator.share({
                title: tripName,
                text: `Приєднуйся до подорожі «${tripName}». Код: ${inviteCode}`,
                url: link,
            });
        } catch {
            // користувач закрив діалог «Поділитися» — нічого не робимо
        }
    };

    return (
        <section aria-label="Запрошення" className="invite-card">
            <h2 className="invite-card__title">Запросити друзів</h2>
            <div className="invite-card__label">Код запрошення</div>
            <div className="invite-card__code">{inviteCode}</div>
            <div className="invite-card__link">{displayLink}</div>
            <div className="invite-card__buttons">
                <button type="button" className="invite-card__button invite-card__button--primary" onClick={copyLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="11" height="11" rx="2"/>
                        <path d="M5 15V5a1 1 0 0 1 1-1h9"/>
                    </svg>
                    {isCopied ? 'Скопійовано' : 'Копіювати'}
                </button>
                <button type="button" className="invite-card__button invite-card__button--secondary" onClick={handleShare}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5"/>
                    </svg>
                    Поділитися
                </button>
            </div>
        </section>
    );
};
