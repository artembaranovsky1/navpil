import './AppLayout.scss'
import {Outlet} from "react-router";
import {Menu} from "../../pages/Menu/Menu.tsx";

export const AppLayout = () => {
    return (
        <div className='app-layout'>
            <Menu/>
            <main className='app-layout__content'>
                <Outlet/>
            </main>
        </div>
    )
}
