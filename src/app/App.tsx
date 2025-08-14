import { RouterProvider } from "react-router";
import "../shared/styles/global.scss";
import { router } from "./router/AppRouter";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
