import './PageSkeletons.scss'
import {Skeleton, SkeletonScreen} from "./Skeleton.tsx";

// Шапка подорожі: хлібні крихти, назва, кнопка й вкладки
const TripHeaderSkeleton = () => (
    <div className="page-skeleton__header">
        <div className="page-skeleton__header-top">
            <div className="page-skeleton__stack">
                <Skeleton width={180} height={13}/>
                <Skeleton width={240} height={38} radius={10}/>
            </div>
            <Skeleton width={170} height={44} radius={22}/>
        </div>
        <div className="page-skeleton__tabs">
            <Skeleton width={70} height={16}/>
            <Skeleton width={90} height={16}/>
            <Skeleton width={100} height={16}/>
        </div>
    </div>
);

const CardSkeleton = ({rows}: { rows: number }) => (
    <div className="page-skeleton__card">
        <Skeleton width={140} height={17}/>
        {Array.from({length: rows}, (_, index) => (
            <div key={index} className="page-skeleton__row">
                <Skeleton width={36} height={36} radius={18}/>
                <div className="page-skeleton__stack page-skeleton__stack--grow">
                    <Skeleton width={`${70 - index * 8}%`} height={14}/>
                    <Skeleton width="35%" height={12}/>
                </div>
                <Skeleton width={64} height={14}/>
            </div>
        ))}
    </div>
);

const StatsSkeleton = () => (
    <div className="page-skeleton__stats">
        {[0, 1, 2].map((index) => (
            <div key={index} className="page-skeleton__card page-skeleton__card--stat">
                <Skeleton width="55%" height={13}/>
                <Skeleton width="70%" height={32} radius={10}/>
            </div>
        ))}
    </div>
);

// Сторінки подорожі: витрати, розрахунок, учасники
export const TripPageSkeleton = () => (
    <SkeletonScreen className="page-skeleton">
        <TripHeaderSkeleton/>
        <StatsSkeleton/>
        <div className="page-skeleton__columns">
            <div className="page-skeleton__main">
                <CardSkeleton rows={5}/>
            </div>
            <div className="page-skeleton__aside">
                <div className="page-skeleton__card">
                    <Skeleton width={110} height={17}/>
                    <div className="page-skeleton__donut">
                        <Skeleton width={104} height={104} radius={52}/>
                        <div className="page-skeleton__stack page-skeleton__stack--grow">
                            <Skeleton width="80%"/>
                            <Skeleton width="65%"/>
                            <Skeleton width="72%"/>
                        </div>
                    </div>
                </div>
                <CardSkeleton rows={2}/>
            </div>
        </div>
    </SkeletonScreen>
);

// Список подорожей
export const TripsPageSkeleton = () => (
    <SkeletonScreen className="page-skeleton">
        <div className="page-skeleton__header-top">
            <div className="page-skeleton__stack">
                <Skeleton width={150} height={13}/>
                <Skeleton width={260} height={38} radius={10}/>
            </div>
            <div className="page-skeleton__buttons">
                <Skeleton width={200} height={48} radius={24}/>
                <Skeleton width={160} height={48} radius={24}/>
            </div>
        </div>

        <StatsSkeleton/>

        <div className="page-skeleton__section">
            <Skeleton width={70} height={17}/>
            <div className="page-skeleton__active">
                <div className="page-skeleton__stack">
                    <Skeleton dark width={220} height={28} radius={10}/>
                    <Skeleton dark width={280} height={14}/>
                    <div className="page-skeleton__buttons">
                        <Skeleton dark width={110} height={32} radius={10}/>
                        <Skeleton dark width={110} height={32} radius={10}/>
                    </div>
                </div>
                <Skeleton dark width={110} height={40} radius={20}/>
            </div>
        </div>

        <div className="page-skeleton__section">
            <Skeleton width={100} height={17}/>
            <div className="page-skeleton__grid">
                {[0, 1, 2].map((index) => (
                    <div key={index} className="page-skeleton__card">
                        <Skeleton width={44} height={44} radius={14}/>
                        <div className="page-skeleton__stack">
                            <Skeleton width="65%" height={17}/>
                            <Skeleton width="80%" height={13}/>
                        </div>
                        <div className="page-skeleton__row">
                            <Skeleton width={70} height={28} radius={14}/>
                            <Skeleton width={80} height={26} radius={13}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </SkeletonScreen>
);
