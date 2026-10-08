import type {TripResponse} from "../../../api/trips.ts";

type ActiveBlockProps = {
    trip: TripResponse;
};

export const ActiveBlock = ({trip}: ActiveBlockProps) => {

    const formatDateRange = (startDate: string, endDate: string): string => {
        const startText = new Date(startDate).toLocaleDateString('uk-UA', {
            day: 'numeric',
            timeZone: 'UTC',
        });

        const endText = new Date(endDate).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
        });

        return `${startText}–${endText}`;
    };
    return (
        <div className='my-trip__active-block'>
            <div className='active-block__left'>
                <div className='active-block__top'>
                    <div className='active-block__name text-h7'>{trip.name}</div>
                    <div className='active-block__status'>триває</div>
                </div>
                <div className='active-block__center'>
                    <div className='active-block__date'>
                        {trip.startDate && trip.endDate
                            ? formatDateRange(trip.startDate, trip.endDate)
                            : 'Без дати'}
                    </div>
                    <div className='active-block__member'>
                        {trip.members.map((member) => member.name).join(', ')}
                    </div>
                </div>
                <div className='active-block__expenses'>
                    <div className='active-block__expenses-total'>
                        <div className='active-block__expenses-text'>витрачено</div>
                        <div className='active-block__expenses-total-amout'>X 000 ₴</div>
                    </div>
                    <div className='active-block__expenses-me'>
                        <div className='active-block__expenses-text'>твій баланс</div>
                        <div className='active-block__expenses-me-amout'>+X 000 ₴</div>
                    </div>
                </div>
            </div>

            <div className='active-block__right'></div>
        </div>
    )
}