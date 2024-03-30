import {
  getAuthUsername,
  getAuthUserToken,
  getPermissionPage,
} from "../utils/helper";

export const initialAuthState = {
  authUserName: getAuthUsername(),
  token: getAuthUserToken(),
  permissionPages: getPermissionPage(),
};
export const AuthReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case "Login":
      return {
        ...state,
        authUserName: action.payload.login_id,
        token: action.payload.token,
        permissionPages: action.payload.permissionPages,
        loginErrors: null,
      };
    case "Signup":
      return {
        ...state,
        authUserName: action.payload.authUserName,
        loginErrors: null,
      };
    case "Logout":
      return {
        ...state,
        loginErrors: null,
      };

    default:
      return state;
  }
};
