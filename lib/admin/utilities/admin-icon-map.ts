import type { ComponentType, SVGProps } from "react";
import {
    ArrowUUpLeftIcon,
    ArrowsLeftRightIcon,
    BellIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    FlagIcon,
    HandCoinsIcon,
    HourglassIcon,
    ShoppingCartIcon,
    StorefrontIcon,
    ThumbsUpIcon,
    TimerClockIcon,
    TruckIcon,
    UserCheckIcon,
    UserMinusIcon,
    UserPlusIcon,
    UsersGroupIcon,
    UserSwitchIcon,
    WarningIcon,
    XCircleIcon,
} from "@/components/vector";

const ADMIN_ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
    truck: TruckIcon,
    thumbsUp: ThumbsUpIcon,
    checkCircle: CheckCircleIcon,
    flag: FlagIcon,
    arrowUUpLeft: ArrowUUpLeftIcon,
    arrowsLeftRight: ArrowsLeftRightIcon,
    handCoins: HandCoinsIcon,
    usersGroup: UsersGroupIcon,
    userCheck: UserCheckIcon,
    userPlus: UserPlusIcon,
    warning: WarningIcon,
    storefront: StorefrontIcon,
    hourglass: HourglassIcon,
    xCircle: XCircleIcon,
    timerClock: TimerClockIcon,
    currencyDollar: CurrencyDollarIcon,
    shoppingCart: ShoppingCartIcon,
    clock: ClockIcon,
    userMinus: UserMinusIcon,
    userSwitch: UserSwitchIcon,
    bell: BellIcon,
};

/** Resolves a sample API icon key to a vector icon component. */
export function getAdminIconComponent(iconKey: string): ComponentType<SVGProps<SVGSVGElement>> {
    return ADMIN_ICON_MAP[iconKey] ?? UserCheckIcon;
}
