import './Menu.scss'
import {useEffect, useState} from "react";
import {Link, NavLink, useLocation} from "react-router";
import {getTrips, type TripResponse} from "../../api/trips.ts";
import {MenuUser} from "./component/MenuUser.tsx";

const navLinkClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-menu__link' : 'trip-menu__link-disable'

export const Menu = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const {pathname} = useLocation()

    useEffect(() => {
        getTrips().then(setTrips).catch(() => setTrips([]))
    }, [pathname]);



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
                {trips.map((item) => (
                    <Link key={item.id} to={`/trips/${item.id}`} className='trip-menu__travel text-h15'>
                        {item.name}
                    </Link>
                ))}
            </div>
            <MenuUser/>
        </div>
    )
}
