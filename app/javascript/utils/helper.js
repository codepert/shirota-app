import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import moment from "moment";
dayjs.extend(utc);
dayjs.extend(timezone);

export const isEmpty = (d) => d?.toString().trim().length === 0;

export const hasKey = (obj, key) => typeof obj === "object" && !falsy(obj[key]);
export const falsy = (d) => d === undefined || d === null;

export const getAuthUser = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const pemissionPages = localStorage.getItem("pemission_pages");

  return falsy(username) ||
    falsy(token) ||
    isEmpty(username) ||
    isEmpty(token) ||
    falsy(pemissionPages) ||
    isEmpty(pemissionPages)
    ? { username: null, token: null, pemissionPages: [] }
    : { username, token, pemissionPages };
};

export const getAuthUserToken = () => getAuthUser()?.token;

export const API = axios.create({
  baseURL: "/",
  headers: {
    "content-type": "application/json",
    // token: `Bearer ${token}`,
    // Authorization: getAuthUserToken(),
  },
});

// API.interceptors.request.use((config) => {
//   const token = getAuthUserToken();
//   if (token) {
//     config.headers["Authorization"] = ` ${token}`;
//   }

//   return config;
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error?.response?.status === 401) {
//       // clearStorage();
//     }
//     throw error;
//   }
// );

// export const makeHttpReq = async (options = {}) => {
//   const apiClient = axios.create({ baseURL: "/" });
//   try {
//     const res = await apiClient.request({});
//     return res;
//   } catch (error) {
//     if (!error.response) {
//       throw new Error("Network Error");
//     }

//     switch (error.response.status) {
//       case 400:
//         // throw new HTTPError("Bad Request", error.response.status);
//         throw new Error("Bad Request");
//       case 401:
//         throw new Error("Unauthorized");
//       case 404:
//         throw new Error("Not Found");
//       default:
//         throw new Error("Internal Server Error");
//     }
//   }
// };

export const hasError = (status) => status >= 400 && status <= 600;

export const arrayIsEmpty = (arr) => arr?.length === 0;

export const arrayIsNotEmpty = (arr) => !arrayIsEmpty(arr);

// export const makeHttpOptions = (
//   payload,
//   method = "GET",
//   url,
//   timeout = 1000
// ) => ({
//   method,
//   url: url,
//   headers: {
//     "content-type": "application/json",
//     Authorization: getAuthUserToken(),
//   },
//   data: payload,
//   timeout: timeout,
//   // ...(method !== "GET" &&
//   //   arrayIsNotEmpty(Object.keys(body)) && { body: JSON.stringify(body) }),
// });

// export const makeURLOptionsWtoken = (token, body = {}, method = "GET") => ({
//   ...makeURLOptions(body, method),
//   headers: {
//     ...makeURLOptions(body, method).headers,
//     // authorization: `Bearer ${token}`,
//     authorization: `${token}`,
//   },
// });

export const getAuthUsername = () => getAuthUser()?.username;
export const getPermissionPage = () => getAuthUser()?.pemissionPages;

export const saveAuthUser = (username, token, pemissionPage) => {
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);
  localStorage.setItem("pemission_pages", pemissionPage);
};

export const clearStorage = () => localStorage.clear();

export const currentDate = dayjs().tz("Asia/Tokyo");

export const getDateStr = (date, dateFormat) => {
  const utcDate = new Date(date);
  utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
  return moment(utcDate).format(dateFormat);
};

export function formatNumberManualInsertion(x) {
  if (typeof x == "undefined" || x == null || x == "" || isNaN(x)) return "";
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(",");
}
