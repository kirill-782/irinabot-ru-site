import { Navigate, Route, Routes } from "react-router-dom";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context";
import React from "react";
import ForbiddenPage from "./Pages/ForbiddenPage";
import Layout from "./Layout";
import { getAccessibleAdminSections } from "./Pages/AdminSections";

const AutopayPage = React.lazy(() => import("./Pages/AutopayPage"));
const AdminAutoupdaterPage = React.lazy(() => import("./Pages/AdminAutoupdaterPage"));
const AdminPage = React.lazy(() => import("./Pages/AdminPage"));
const CreateGamePage = React.lazy(() => import("./Pages/CreateGamePage"));
const GameListPage = React.lazy(() => import("./Pages/GameListPage"));
const MapListPage = React.lazy(() => import("./Pages/MapListPage"));
const MapPage = React.lazy(() => import("./Pages/MapPage"));
const MapEditPage = React.lazy(() => import("./Pages/MapEditPage"));
const NotFoundPage = React.lazy(() => import("./Pages/NotFoundPage"));
const OauthStubPage = React.lazy(() => import("./Pages/OauthStubPage"));
const TelegramAuthStubPage = React.lazy(() => import("./Pages/TelegramAuthStubPage"));

const CreateGameConfirmPage = React.lazy(() => import("./Pages/CreateGameConfirmPage"));
const EditConfigPage = React.lazy(() => import("./Pages/EditConfigPage"));
const DebugPage = React.lazy(() => import("./Pages/DebugPage"));

const ReplayParserPage = React.lazy(() => import("./Pages/ReplayParserPage"));
const MapCatalog = React.lazy(() => import("./Pages/MapCatalog"));

const WikiPage = React.lazy(() => import("./Pages/WikiPage"));

const LanguageManagerPage = React.lazy(() => import("./Pages/LanguageManagerPage"));

const ConsentStubPage = React.lazy(() => import("./Pages/ConsentStubPage"));


interface CondirionalRouteIndex {
    path?: undefined;
    index?: true;
}

interface CondirionalRoutePath {
    path: string;
    index?: false;
}

type ConditionalRoute = {
    element?: React.ReactNode | null;
    routes?: ConditionalRoute[];
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

const routes: ConditionalRoute[] = [
    {
        path: "/*",
        element: <Layout />,
        routes: [
            {
                index: true,
                element: <GameListPage />,
            },
            {
                path: "wiki",
                routes: [
                    {
                        path: ":wiki",
                        element: <WikiPage />,
                    },
                    {
                        path: ":wiki/:article",
                        element: <WikiPage />,
                    },
                    {
                        index: true,
                        element: <ForbiddenPage />,
                    },
                ],
            },
            {
                path: "debug",
                element: <DebugPage />,
            },
            {
                path: "admin",
                element: <AdminPage />,
                requireAuth: true,
                requireToken: true,
                routes: [],
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
                path: "lang",
                element: <LanguageManagerPage />,
            },
            {
                path: "consent",
                element: <ConsentStubPage/>,
                requireAuth: true,
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
    {
        path: "/telegramAuth",
        element: <TelegramAuthStubPage />,
    },

    
];

function RouteList() {
    const auth = useContext(AuthContext).auth;

    const resultRoutes = useMemo(() => {
        const hasAccessToRoute = ({
                                      requiredAccessMask,
                                      requiredAuthorities,
                                      requireAuth,
                                      requireToken,
                                      waitAuth,
                                  }: ConditionalRoute): CheckRouteResult => {
            let result: CheckRouteResult = {
                hasAccess: true,
                waitAuth: waitAuth,
            };

            if (requireToken && !auth.apiToken.hasToken()) {
                result = { ...result, hasAccess: false, noToken: true };
            }

            if (requiredAccessMask && !auth.accessMask.hasAccess(requiredAccessMask)) {
                result = { ...result, hasAccess: false };
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
        const accessibleAdminSections = getAccessibleAdminSections(auth);

        const adminRouteChildren: ConditionalRoute[] = accessibleAdminSections.reduce<ConditionalRoute[]>((acc, section) => {
            switch (section.key) {
                case "autoupdater":
                    acc.push({
                        path: section.path,
                        element: <AdminAutoupdaterPage />,
                        requiredAccessMask: section.requiredAccessMask,
                        requiredAuthorities: section.requiredAuthorities,
                        requireAuth: section.requireAuth,
                        requireToken: section.requireToken,
                    });
                    break;
            }

            return acc;
        }, []);

        if (accessibleAdminSections.length > 0) {
            adminRouteChildren.unshift({
                index: true,
                element: <Navigate replace to={accessibleAdminSections[0].path} />,
            });
        }

        const preparedRoutes = routes.map((route) => {
            if (route.path !== "/*" || !route.routes) return route;

            return {
                ...route,
                routes: route.routes.map((childRoute) => {
                    if (childRoute.path !== "admin") return childRoute;

                    return {
                        ...childRoute,
                        routes: adminRouteChildren,
                    };
                }),
            };
        });

        const getRoutesNode = (i: ConditionalRoute, key: number) => {
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

        return preparedRoutes.map(getRoutesNode);
    }, [auth]);

    return <Routes>{resultRoutes}</Routes>;
}

export default RouteList;
