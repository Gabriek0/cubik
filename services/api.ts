import axios from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();

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
          });
      } else {
        // user logout
      }
    }
  }
);
