import './Menu.scss'
import {Link, NavLink} from "react-router";
import {flattenTrips} from "../../api/trips.ts";
import {useTrips} from "../../hooks/queries.ts";
import {MenuUser} from "./component/MenuUser.tsx";
import {Skeleton} from "../../components/Skeleton/Skeleton.tsx";

const navLinkClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-menu__link trip-menu__link--active' : 'trip-menu__link'

const travelLinkClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-menu__travel trip-menu__travel--active text-h15' : 'trip-menu__travel text-h15'

export const Menu = () => {
    // список оновлюється сам: мутації інвалідовують кеш подорожей
    const {data, isPending} = useTrips()
    const trips = data ? flattenTrips(data) : []

    return (
        <div className='trip-menu'>
            <Link to='/trips' className='trip-menu__logo' aria-label='Мої подорожі'/>
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
                <div className='trip-menu__travel-list'>
                    {/* заглушки лише при першому завантаженні — далі список оновлюється без блимання */}
                    {isPending && [80, 60, 70].map((width) => (
                        <Skeleton key={width} className='trip-menu__travel-skeleton' width={`${width}%`} height={16}/>
                    ))}
                    {trips.map((item) => (
                        <NavLink key={item.id} to={`/trips/${item.id}`} className={travelLinkClass}>
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </div>
            <MenuUser/>
        </div>
    )
}
