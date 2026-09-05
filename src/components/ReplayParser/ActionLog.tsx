import React, { useContext, useMemo, useState } from "react";
import { Form, Grid, Message } from "semantic-ui-react";

import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";
import ExternalBlockCard from "./ExternalBlockCard";
import { AppRuntimeSettingsContext } from "../../context";

const PAGE_SIZE = 500;

// Действия, по которым фильтруются блоки.
const ACTION_SYNC_STORED_INTEGER = 0x6b;
const ACTION_CHAT_COMMAND = 0x60;

function ActionLog() {
    const [syncIntegerOnly, setSyncIntegerOnly] = useState(true);
    const [chatCommandOnly, setChatCommandOnly] = useState(false);
    const [nonEmpty, setNonEmpty] = useState(true);
    const [errorBlock, setErrorBlock] = useState(false);
    const [pageScroll, setPageScroll] = useState(true);
    const [page, setPage] = useState(0);

    const { replayActions } = useContext(ReplayContext)!;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const hasAction = (action: ActionData, type: number) =>
        action.commandBlocks.some((commandBlock) => commandBlock.actions.some((i) => i.type === type));

    const filterResult = useMemo(() => {
        let actions = replayActions;

        if (nonEmpty) actions = actions.filter((action) => action.commandBlocks.length > 0);
        if (syncIntegerOnly) actions = actions.filter((action) => hasAction(action, ACTION_SYNC_STORED_INTEGER));
        if (chatCommandOnly) actions = actions.filter((action) => hasAction(action, ACTION_CHAT_COMMAND));

        // С версии 0.1.0 парсер не бросает исключение на битом блоке, а кладёт ошибку
        // в сам командный блок — иначе фильтр перестал бы что-либо находить.
        if (errorBlock)
            actions = actions.filter(
                (action) =>
                    action.errorMessage ||
                    action.commandBlocks.some(
                        (commandBlock) => commandBlock.error || commandBlock.remaingBuffer.length > 0
                    )
            );

        return actions;
    }, [replayActions, nonEmpty, syncIntegerOnly, chatCommandOnly, errorBlock]);

    // Фильтры сбрасывают страницу сами; здесь дополнительно подстраховываемся от выхода за границы.
    const pageCount = Math.max(1, Math.ceil(filterResult.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount - 1);

    const renderBlocks = filterResult.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const scrollTo = (top: number) => {
        if (pageScroll) window.scrollTo({ top });
    };

    return (
        <Form className="replay-action-log">
            <Form.Checkbox
                label={t("actionLog_1")}
                checked={pageScroll}
                onChange={(_, data) => setPageScroll(!!data.checked)}
            />
            <Form.Checkbox
                label={t("actionLog_2")}
                checked={nonEmpty}
                onChange={(_, data) => {
                    setNonEmpty(!!data.checked);
                    setPage(0);
                }}
            />
            <Form.Group>
                <Form.Checkbox
                    label={t("actionLog_3")}
                    checked={syncIntegerOnly}
                    onChange={(_, data) => {
                        setSyncIntegerOnly(!!data.checked);
                        setPage(0);
                    }}
                />
                <Form.Checkbox
                    label={t("actionLog_4")}
                    checked={chatCommandOnly}
                    onChange={(_, data) => {
                        setChatCommandOnly(!!data.checked);
                        setPage(0);
                    }}
                />
                <Form.Checkbox
                    label={t("actionLogErrorBlocksFilter")}
                    checked={errorBlock}
                    onChange={(_, data) => {
                        setErrorBlock(!!data.checked);
                        setPage(0);
                    }}
                />
            </Form.Group>
            <Message
                info
                content={t("actionLogFilterSummary", {
                    count: filterResult.length,
                    total: replayActions.length,
                    page: currentPage + 1,
                    pages: pageCount,
                })}
            />
            <Grid>
                <Grid.Row centered>
                    <button
                        type="button"
                        disabled={currentPage === 0}
                        className="ui floated button"
                        onClick={() => {
                            setPage(currentPage - 1);
                            scrollTo(document.body.scrollHeight);
                        }}
                    >
                        {t("actionLog_5")}
                    </button>
                </Grid.Row>
                <Grid.Row>
                    {renderBlocks.map((action) => (
                        <ExternalBlockCard key={action.seqenceNumber} actionsBlock={action} />
                    ))}
                </Grid.Row>
                <Grid.Row centered>
                    <button
                        type="button"
                        disabled={currentPage + 1 >= pageCount}
                        className="ui floated button"
                        onClick={() => {
                            setPage(currentPage + 1);
                            scrollTo(0);
                        }}
                    >
                        {t("actionLog_6")}
                    </button>
                </Grid.Row>
            </Grid>
        </Form>
    );
}

export default ActionLog;
