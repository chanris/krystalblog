import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Videos from "./pages/Videos";
import Music from "./pages/Music";
import Drive from "./pages/Drive";
import Friends from "./pages/Friends";
import Stats from "./pages/Stats";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "blog", Component: Blog },
      { path: "blog/:id", Component: BlogDetail },
      { path: "videos", Component: Videos },
      { path: "music", Component: Music },
      { path: "drive", Component: Drive },
      { path: "friends", Component: Friends },
      { path: "stats", Component: Stats },
      { path: "*", Component: NotFound },
    ],
  },
]);
