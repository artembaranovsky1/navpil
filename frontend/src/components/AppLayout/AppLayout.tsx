import './AppLayout.scss'
import {useEffect, useState} from "react";
import {Link, Outlet, useLocation, useMatch} from "react-router";
import {useMe} from "../../hooks/queries.ts";
import {Menu} from "../../pages/Menu/Menu.tsx";
import {TripTopbar} from "./TripTopbar.tsx";

// ширина, з якої меню ховається у висувну панель — як і в AppLayout.scss
const MOBILE_QUERY = '(max-width: 900px)';

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(MOBILE_QUERY).matches);

    useEffect(() => {
        const media = window.matchMedia(MOBILE_QUERY);
        const handleChange = () => setIsMobile(media.matches);

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
}

export const AppLayout = () => {
    const isMobile = useIsMobile();
    const {pathname} = useLocation();
    const {data: me} = useMe();
    const tripMatch = useMatch('/trips/:tripId/*');
    // /trips/new — це не подорож
    const tripId = tripMatch?.params.tripId !== 'new' ? tripMatch?.params.tripId : undefined;
    // сторінка, на якій відкрили меню: перейшли деінде або розширили вікно — меню закрите
    const [menuOpenedAt, setMenuOpenedAt] = useState<string | null>(null);
    const isMenuOpen = isMobile && menuOpenedAt === pathname;

    const closeMenu = () => setMenuOpenedAt(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpenedAt(null);
        };

        // поки меню відкрите, сторінка під ним не скролиться
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    return (
        <div className='app-layout'>
            <Menu
                id='app-menu'
                isOpen={isMenuOpen}
                // закрите висувне меню не має ловити фокус з клавіатури
                inert={isMobile && !isMenuOpen}
                onClose={closeMenu}
            />

            <div
                className={isMenuOpen ? 'app-layout__backdrop app-layout__backdrop--visible' : 'app-layout__backdrop'}
                onClick={closeMenu}
                aria-hidden='true'
            />

            <div className='app-layout__body'>
                {tripId ? <TripTopbar tripId={tripId}/> : (
                <header className='app-layout__header'>
                    <Link to='/trips' className='app-layout__wordmark' aria-label='Мої подорожі'>
                        nav<span className='app-layout__wordmark-slash'>/</span>pil
                    </Link>

                    {/* профіль відкриває меню: там навігація, подорожі й юзер */}
                    <button
                        type='button'
                        className='app-layout__profile'
                        aria-label='Профіль'
                        aria-expanded={isMenuOpen}
                        aria-controls='app-menu'
                        onClick={() => setMenuOpenedAt(pathname)}
                    >
                        {me?.name.trim().charAt(0).toUpperCase()}
                    </button>
                </header>
                )}

                <main className='app-layout__content'>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
