
import { screenWidth } from '../metrices';
const AppCommonLeftRightMargin = screenWidth(6);
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_Max_LENGTH = 13;
const NAME_MIN_LENGTH = 2;
const MOBILE_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 40;
const GOAL_MIN_LENGTH = 40;
const PAGINATION_THERSHOLD = 9;
const CACHE_PARAMS = {
    accessToken: 'AccessToken',
    profile: 'profile',
    profileData: 'profileData',
    address: 'address',
    isLogin: 'isLogin',
    onboarding: 'onboarding',
    userData: 'userData',
    userType: 'Usertype',
    itemCount: 'ItemCount',
    itemcartData:'itemCartData'
}

const LAYOUT = {
    radius: 12,
    padding: 16,
};

export {
    AppCommonLeftRightMargin,
    PASSWORD_MIN_LENGTH,
    PASSWORD_Max_LENGTH,
    NAME_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    MOBILE_MIN_LENGTH,
    GOAL_MIN_LENGTH,
    PAGINATION_THERSHOLD,
    CACHE_PARAMS,
    LAYOUT
}