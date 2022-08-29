import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
  broadCastAuth: MutableRefObject<BroadcastChannel | null>;
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, "next.auth.token");
  destroyCookie(undefined, "next.auth.refreshToken");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const broadCastAuth = useRef<BroadcastChannel | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "next.auth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  useEffect(() => {
    broadCastAuth.current = new BroadcastChannel("auth");

    broadCastAuth.current.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;

        default:
          break;
      }
    };
  }, [broadCastAuth]);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(null, "next.auth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 1 month
        path: "/",
      });

      setCookie(null, "next.auth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 1 month
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, isAuthenticated, broadCastAuth, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
