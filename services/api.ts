import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue: any = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
});

api.defaults.headers.common[
  "Authorization"
] = `Bearer ${cookies["next.cubik.token"]}`;

// Intercept request

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        // renew token
        cookies = parseCookies();

        const { "next.cubik.refreshToken": refreshToken } = cookies;

        // all information to repeat request
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token } = response.data;

              setCookie(undefined, "next.cubik.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
              });

              setCookie(
                undefined,
                "next.cubik.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                }
              );

              api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

              failedRequestQueue.forEach((request: any) =>
                request.onSuccess(token)
              );
              failedRequestQueue = [];
            })
            .catch((err) => {
              failedRequestQueue.forEach((request: any) =>
                request.onFailure(err)
              );
              failedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        // user logout
      }
    }
  }
);
