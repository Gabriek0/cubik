import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";
import Can from "./components/UserCanSee/Can";

function Dashboard() {
  const { user, signOut, broadCastAuth } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me").then((response) => console.log(response.data));
  }, []);

  function handleSignOut() {
    broadCastAuth.current!.postMessage("signOut");

    signOut();
  }

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={handleSignOut}>Sign out</button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  console.log(response);
  return {
    props: {},
  };
});

export default Dashboard;
