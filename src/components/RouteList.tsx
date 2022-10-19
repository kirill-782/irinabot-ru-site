import { Route, Routes } from "react-router-dom";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context";
import React from "react";
import ForbiddenPage from "./Pages/ForbiddenPage";
import Layout from "./Layout";
import MapEditPage from "./Pages/MapEditPage";

const AutopayPage = React.lazy(() => import("./Pages/AutopayPage"));
const CreateGamePage = React.lazy(() => import("./Pages/CreateGamePage"));
const GameListPage = React.lazy(() => import("./Pages/GameListPage"));
const MapListPage = React.lazy(() => import("./Pages/MapListPage"));
const MapPage = React.lazy(() => import("./Pages/MapPage"));
const NotFoundPage = React.lazy(() => import("./Pages/NotFoundPage"));
const OauthStubPage = React.lazy(() => import("./Pages/OauthStubPage"));

const CreateGameConfirmPage = React.lazy(
  () => import("./Pages/CreateGameConfirmPage")
);
const EditConfigPage = React.lazy(() => import("./Pages/EditConfigPage"));
const DebugPage = React.lazy(() => import("./Pages/DebugPage"));

const ReplayParserPage = React.lazy(() => import("./Pages/ReplayParserPage"));

interface CondirionalRouteIndex {
  path?: undefined;
  index?: true;
}

interface CondirionalRoutePath {
  path: string;
  index?: false;
}

type CondirionalRoute = {
  element: React.ReactNode | null;
  routes?: CondirionalRoute[];
  requiredAccessMask?: number;
  requiredAuthorities?: string[];
  requireWebsocketConnect?: boolean;
  requireAuth?: boolean;
} & (CondirionalRouteIndex | CondirionalRoutePath);

interface CheckRouteResult {
  hasAccess: boolean;
  missingAuthorities?: string[];
  noAuth?: boolean;
}

const routes: CondirionalRoute[] = [
  {
    path: "/*",
    element: <Layout />,
    routes: [
      {
        index: true,
        element: <GameListPage />,
      },
      {
        path: "debug",
        element: <DebugPage />,
      },
      {
        path: "gamelist",
        element: <GameListPage />,
      },
      {
        path: "autopay",
        element: <AutopayPage />,
      },
      {
        path: "create",
        element: undefined,
        routes: [
          {
            index: true,
            element: <CreateGamePage />,
            requireAuth: true,
          },
          {
            path: "confirm",
            element: <CreateGameConfirmPage />,
            requireAuth: true,
          },
        ],
      },
      {
        path: "config/:id/edit",
        element: <EditConfigPage />,
        requireAuth: true,
        requiredAuthorities: ["CONFIG_READ", "CONFIG_EDIT"],
      },
      {
        path: "maps",
        element: undefined,
        routes: [
          {
            index: true,
            element: <MapListPage />,
          },
          {
            path: ":id",
            element: <MapPage />,
          },
          {
            path: ":id/edit",
            element: <MapEditPage />
          }
        ],
      },
      {
        path: "replay",
        element: <ReplayParserPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/oauth",
    element: <OauthStubPage />,
  },
];

function RouteList() {
  const auth = useContext(AuthContext).auth;

  const resultRoutes = useMemo(() => {
    const hasAccessToRoute = ({
      requiredAuthorities,
      requireAuth,
    }: CondirionalRoute): CheckRouteResult => {
      let result: CheckRouteResult = {
        hasAccess: true,
      };

      if (requiredAuthorities && requiredAuthorities.length > 0) {
        const missingAuthorities = requiredAuthorities.filter((i) => {
          return !auth.apiToken.hasAuthority(i);
        });

        if (missingAuthorities.length > 0) {
          result = { ...result, hasAccess: false, missingAuthorities };
        }
      }

      if (!auth.currentAuth && requireAuth)
        result = { ...result, hasAccess: false, noAuth: true };

      return result;
    };

    const getRoutesNode = (i: CondirionalRoute, key: number) => {
      const checkResult = hasAccessToRoute(i);

      if (checkResult.hasAccess) {
        const chilldren = i.routes ? i.routes.map(getRoutesNode) : null;

        return (
          <Route key={key} index={i.index} path={i.path} element={i.element}>
            {chilldren}
          </Route>
        );
      } else {
        return (
          <Route
            key={key}
            index={i.index}
            path={i.path}
            element={<ForbiddenPage />}
          />
        );
      }
    };

    return routes.map(getRoutesNode);
  }, [auth.apiToken, auth.currentAuth, routes]);

  return <Routes>{resultRoutes}</Routes>;
}

export default RouteList;
