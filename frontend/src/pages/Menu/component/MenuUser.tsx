import {useEffect, useState} from "react";
import {getMe, type User} from "../../../api/user.ts";

export const MenuUser = () => {
    const [user, setUser] = useState<User>()

    useEffect(() => {
        getMe().then(setUser).catch(() => setUser(undefined))
    }, []);

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