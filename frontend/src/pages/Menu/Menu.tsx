import './Menu.scss'
import {useEffect, useState} from "react";
import {Link, NavLink, useLocation} from "react-router";
import {flattenTrips, getTrips, type TripResponse} from "../../api/trips.ts";
import {MenuUser} from "./component/MenuUser.tsx";
import {Skeleton} from "../../components/Skeleton/Skeleton.tsx";

const navLinkClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-menu__link' : 'trip-menu__link-disable'

export const Menu = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {pathname} = useLocation()

    useEffect(() => {
        getTrips()
            .then((data) => setTrips(flattenTrips(data)))
            .catch(() => setTrips([]))
            .finally(() => setIsLoading(false))
    }, [pathname]);

    console.log(trips)

    return (
        <div className='trip-menu'>
            <div className='trip-menu__logo'></div>
            <div className='trip-menu__nav'>
                <NavLink to='/trips' end className={navLinkClass}>
                    <div className='trip-menu__link-logo-1'></div>
                    <div className='trip-menu__link-text'>Мої подорожі</div>
                </NavLink>
                <NavLink to='/join' className={navLinkClass}>
                    <div className='trip-menu__link-logo-2'></div>
                    <div className='trip-menu__link-text'>Приєднатися за кодом</div>
                </NavLink>
            </div>
            <div className='trip-menu__travels'>
                <div className='trip-menu__travel-name text-caption'>Подорожі</div>
                <div className='trip-menu__travel-list'></div>
                {/* заглушки лише при першому завантаженні — далі список оновлюється без блимання */}
                {isLoading && trips.length === 0 && [80, 60, 70].map((width) => (
                    <Skeleton key={width} className='trip-menu__travel-skeleton' width={`${width}%`} height={16}/>
                ))}
                {trips.map((item) => (
                    <Link key={item.id} to={`/trips/${item.id}`} className='trip-menu__travel text-h15'>
                        {item.name} {item.inviteCode}
                    </Link>
                ))}
            </div>
            <MenuUser/>
        </div>
    )
}
