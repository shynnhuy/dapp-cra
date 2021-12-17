import { useRoutes } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import MyNFT from "./pages/MyNFT";
import Create from "./pages/Create";

const Router = () => {
  return useRoutes([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "create",
          element: <Create />,
        },
        {
          path: "my-assets",
          element: <MyNFT />,
        },
      ],
    },
  ]);
};

export default Router;
