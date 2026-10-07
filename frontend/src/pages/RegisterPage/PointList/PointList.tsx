export const PointList: React.FC = () => {
    return (
        <div>

            <div className='register-page__point'>
                <div className='register-page__point-number text-body'>1</div>
                <div className='register-page__point-text-field'>
                    <div className='register-page__point-text-main text-default'>Створіть подорож</div>
                    <div className='register-page__point-text-second text-small'>Назва, дати й валюта — і можна
                        запрошувати друзів.
                    </div>
                </div>
            </div>

            <div className='register-page__point'>
                <div className='register-page__point-number text-body'>2</div>
                <div className='register-page__point-text-field'>
                    <div className='register-page__point-text-main text-default'>Записуйте витрати разом</div>
                    <div className='register-page__point-text-second text-small'>Кожен додає, що купив, і бачить зміни інших одразу.
                    </div>
                </div>
            </div>

            <div className='register-page__point'>
                <div className='register-page__point-number text-body'>3</div>
                <div className='register-page__point-text-field'>
                    <div className='register-page__point-text-main text-default'>Розрахуйтеся мінімумом переказів
                    </div>
                    <div className='register-page__point-text-second text-small'>navpil сам порахує, хто кому скільки винен.
                    </div>
                </div>
            </div>

        </div>
    )
}