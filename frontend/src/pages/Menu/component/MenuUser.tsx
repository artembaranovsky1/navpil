import {useMe} from "../../../hooks/queries.ts";
import {Skeleton} from "../../../components/Skeleton/Skeleton.tsx";

export const MenuUser = () => {
    const {data: user, isPending} = useMe()

    if (isPending) {
        return (
            <div className='trip-menu__user'>
                <Skeleton className='trip-menu__user-photo-skeleton' width={36} height={36} radius={18}/>
                <div className='trip-menu__user-info trip-menu__user-info--skeleton'>
                    <Skeleton width={90} height={14}/>
                    <Skeleton width={130} height={12}/>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
    <div className='trip-menu__user'>
        <div className='trip-menu__user-photo'>{user.name[0].toUpperCase()}</div>
        <div className='trip-menu__user-info'>
            <div className='trip-menu__user-name'>{user.name}</div>
            <div className='trip-menu__user-email'>{user.email}</div>
        </div>
    </div>
    )
}