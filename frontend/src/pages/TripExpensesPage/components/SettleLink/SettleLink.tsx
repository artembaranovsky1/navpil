import './SettleLink.scss'
import {Link} from "react-router";
import {pluralize} from "../../../../utils/format.ts";

type SettleLinkProps = {
    tripId: string;
    transfersCount: number;
}

export const SettleLink = ({tripId, transfersCount}: SettleLinkProps) => (
    <Link to={`/trips/${tripId}/settle`} className="settle-link">
        <span>
            <span className="settle-link__title">Розрахунок</span>
            <span className="settle-link__note">
                {transfersCount > 0
                    ? `${transfersCount} ${pluralize(transfersCount, ['переказ', 'перекази', 'переказів'])}, і всі в розрахунку`
                    : 'Усі в розрахунку'}
            </span>
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7"/>
        </svg>
    </Link>
);
