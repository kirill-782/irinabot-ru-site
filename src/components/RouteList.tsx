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

const CreateGameConfirmPage = React.lazy(() => import("./Pages/CreateGameConfirmPage"));
const EditConfigPage = React.lazy(() => import("./Pages/EditConfigPage"));
const DebugPage = React.lazy(() => import("./Pages/DebugPage"));

const ReplayParserPage = React.lazy(() => import("./Pages/ReplayParserPage"));
const MapCatalog = React.lazy(() => import("./Pages/MapCatalog"));

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
    requireToken?: boolean;
    waitAuth?: boolean;
} & (CondirionalRouteIndex | CondirionalRoutePath);

interface CheckRouteResult {
    hasAccess: boolean;
    missingAuthorities?: string[];
    noAuth?: boolean;
    noToken?: boolean;
    waitAuth?: boolean;
}

const routes: CondirionalRoute[] = [
    {
        path: "/*",
        element: <Layout />,
        routes: [
            {
                index: true,
                element: <GameListPage />,
                //requiredAuthorities: ["BETA_ACCESS"],
            },
            {
                path: "debug",
                element: <DebugPage />,
            },
            {
                path: "gamelist",
                element: <GameListPage />,
                //requiredAuthorities: ["BETA_ACCESS"],
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
                        //requiredAuthorities: ["BETA_ACCESS"],
                    },
                    {
                        path: "confirm",
                        element: <CreateGameConfirmPage />,
                        requireAuth: true,
                        //requiredAuthorities: ["BETA_ACCESS"],
                    },
                ],
            },
            {
                path: "config/:id/edit",
                element: <EditConfigPage />,
                requireAuth: true,
                requireToken: true,
                requiredAuthorities: ["MAP_READ", "CONFIG_EDIT"],
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
                        waitAuth: true,
                    },
                    {
                        path: ":id/edit",
                        requireAuth: true,
                        requireToken: true,
                        element: <MapEditPage />,
                    },
                    {
                        path: "catalog/:page",
                        element: <MapCatalog />,
                    },
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
            requireToken,
            waitAuth,
        }: CondirionalRoute): CheckRouteResult => {
            let result: CheckRouteResult = {
                hasAccess: true,
                waitAuth: waitAuth,
            };

            if (requireToken && !auth.apiToken.hasToken()) {
                result = { ...result, hasAccess: false, noToken: true };
            }

            if (requiredAuthorities && requiredAuthorities.length > 0) {
                const missingAuthorities = requiredAuthorities.filter((i) => {
                    return !auth.apiToken.hasAuthority(i);
                });

                if (missingAuthorities.length > 0) {
                    result = { ...result, hasAccess: false, missingAuthorities };
                }
            }

            if (!auth.currentAuth && requireAuth) result = { ...result, hasAccess: false, noAuth: true };

            return result;
        };

        const authReady = auth.currentAuth && auth.apiToken.hasToken();

        const getRoutesNode = (i: CondirionalRoute, key: number) => {
            const checkResult = hasAccessToRoute(i);

            const canAccess = checkResult.hasAccess && (!checkResult.waitAuth || authReady || !auth.authCredentials);

            if (canAccess) {
                const chilldren = i.routes ? i.routes.map(getRoutesNode) : null;

                return (
                    <Route key={key} index={i.index} path={i.path} element={i.element}>
                        {chilldren}
                    </Route>
                );
            } else {
                return <Route key={key} index={i.index} path={i.path} element={<ForbiddenPage />} />;
            }
        };

        return routes.map(getRoutesNode);
    }, [auth.apiToken, auth.currentAuth, routes]);

    return <Routes>{resultRoutes}</Routes>;
}

export default RouteList;
