import React, { useContext } from "react";
import { Button, Container, Header, Icon, Tab } from "semantic-ui-react";

import { ReplayContext } from "./../Pages/ReplayParserPage";
import { AppRuntimeSettingsContext } from "../../context";
import ReplayOverview from "./ReplayOverview";
import ReplayPlayers from "./ReplayPlayers";
import ReplayHcl from "./ReplayHcl";
import ReplayTechnical from "./ReplayTechnical";
import ReplayTimeline from "./ReplayTimeline";
import ReplayApm from "./ReplayApm";
import ReplayClickMap from "./ReplayClickMap";
import ActionLog from "./ActionLog";
import W3MMDStats from "./W3MMDStats";
import ReplayActionsGate from "./ReplayActionsGate";

import "./ReplayInfo.scss";
import "./ReplayColors.scss";

// Semantic отрисовывает панель вплотную к полосе вкладок, поэтому отступ задаём обёрткой.
const renderPane = (content: React.ReactNode) => <div className="replay-tab-content">{content}</div>;

function ReplayInfo() {
    const { name, resetReplay } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <Container className="replay-info">
            <div className="replay-info-header">
                <Header>{name}</Header>
                <Button size="tiny" basic onClick={resetReplay}>
                    <Icon name="folder open" />
                    {t("replayInfoOpenAnother")}
                </Button>
            </div>
            <Tab
                panes={[
                    { menuItem: t("replayTabOverview"), render: () => renderPane(<ReplayOverview />) },
                    { menuItem: t("replayTabPlayers"), render: () => renderPane(<ReplayPlayers />) },
                    { menuItem: t("replayTabHcl"), render: () => renderPane(<ReplayHcl />) },
                    { menuItem: t("replayTabTimeline"), render: () => renderPane(<ReplayTimeline />) },
                    {
                        menuItem: t("replayTabClickMap"),
                        render: () =>
                            renderPane(
                                <ReplayActionsGate>
                                    <ReplayClickMap />
                                </ReplayActionsGate>
                            ),
                    },
                    {
                        menuItem: t("replayTabApm"),
                        render: () =>
                            renderPane(
                                <ReplayActionsGate>
                                    <ReplayApm />
                                </ReplayActionsGate>
                            ),
                    },
                    { menuItem: t("replayTabTechnical"), render: () => renderPane(<ReplayTechnical />) },
                    {
                        menuItem: t("replayTabBlocks"),
                        render: () =>
                            renderPane(
                                <ReplayActionsGate>
                                    <ActionLog />
                                </ReplayActionsGate>
                            ),
                    },
                    {
                        menuItem: "W3MMD",
                        render: () =>
                            renderPane(
                                <ReplayActionsGate>
                                    <W3MMDStats />
                                </ReplayActionsGate>
                            ),
                    },
                ]}
            />
        </Container>
    );
}

export default ReplayInfo;
