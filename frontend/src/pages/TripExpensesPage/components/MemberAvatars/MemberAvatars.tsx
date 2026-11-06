import './MemberAvatars.scss'
import {Link} from "react-router";
import type {TripMember} from "../../../../api/trips.ts";
import {getAvatarColor} from "../../../../utils/colors.ts";

type MemberAvatarsProps = {
    tripId: string;
    members: TripMember[];
    currentUserId?: string;
    // мобільна шапка: дрібніші, поточний юзер чорним, решта сірі
    compact?: boolean;
}

export const MemberAvatars = ({tripId, members, currentUserId, compact = false}: MemberAvatarsProps) => {
    const maxVisible = compact ? 3 : 4;
    // поточний користувач — першим
    const sorted = [...members].sort((a, b) => Number(b.id === currentUserId) - Number(a.id === currentUserId));
    const visible = sorted.slice(0, maxVisible);
    const hiddenCount = sorted.length - visible.length;

    return (
        <Link
            to={`/trips/${tripId}/members`}
            className={compact ? 'member-avatars member-avatars--compact' : 'member-avatars'}
            aria-label={`Учасники: ${members.map((member) => member.name).join(', ')}`}
        >
            {visible.map((member) => (
                <span
                    key={member.id}
                    className={compact
                        ? member.id === currentUserId ? 'member-avatars__item member-avatars__item--me' : 'member-avatars__item'
                        : 'member-avatars__item member-avatars__item--colored'}
                    style={compact ? undefined : {background: getAvatarColor(member.id)}}
                    aria-hidden="true"
                >
                    {member.name.trim().charAt(0).toUpperCase()}
                </span>
            ))}
            {hiddenCount > 0 && (
                <span className="member-avatars__item" aria-hidden="true">+{hiddenCount}</span>
            )}
        </Link>
    );
};
