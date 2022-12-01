import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Grid } from "semantic-ui-react";
import { ActionData, ReplayContext } from "../Pages/ReplayParserPage";

import ExternalBlockCard from "./ExternalBlockCard";
import { useVisibility } from "../../hooks/useVisibility";

const PAGE_SIZE = 500;
const PAGE_WINDOW = 0;

function ActionLog({}) {
  const [syncIntegerOnly, setSyncIntegerOnly] = useState(true);
  const [chatCommandOnly, setChatCommandOnly] = useState(false);
  const [nonEmpty, setNonEmpty] = useState(true);
  const [errorBlock, setErrorBlock] = useState(false);

  const [pageScroll, setPageScroll] = useState(true);

  const [page, setPage] = useState(0);

  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  const [filterResult, setFilterResult] = useState<ActionData[]>();

  useEffect(() => {
    let actions = replayActions;

    if (nonEmpty)
      actions = actions?.filter((i) => {
        return i.commandBlocks.length > 0;
      });

    if (syncIntegerOnly)
      actions = actions?.filter((i) => {
        return i.commandBlocks.some((i) => {
          return i.actions.some((i) => {
            return i.type === 107;
          });
        });
      });

    if (chatCommandOnly)
      actions = actions?.filter((i) => {
        return i.commandBlocks.some((i) => {
          return i.actions.some((i) => {
            return i.type === 0x60;
          });
        });
      });

    if (errorBlock)
      actions = actions?.filter((i) => {
        return (
          i.errorMessage ||
          i.commandBlocks.some((i) => {
            return i.remaingBuffer.length > 0;
          })
        );
      });

    setFilterResult(actions);
    setPage(0);
  }, [syncIntegerOnly, chatCommandOnly, nonEmpty, errorBlock]);

  const renderBlocks = filterResult?.slice(
    Math.max(0, (page - PAGE_WINDOW) * PAGE_SIZE),
    Math.min(filterResult.length, (page + PAGE_WINDOW + 1) * PAGE_SIZE)
  );

  return (
    <>
      <Form>
        <Form.Checkbox
          label="Прогручивать страницу к началу блоков"
          checked={pageScroll}
          onChange={(_, data) => {
            setPageScroll(!!data.checked);
          }}
        ></Form.Checkbox>
        <Form.Checkbox
          label="Не пустые блоки"
          checked={nonEmpty}
          onChange={(_, data) => {
            setNonEmpty(!!data.checked);
          }}
        ></Form.Checkbox>
        <Form.Group>
          <Form.Checkbox
            label="Только SyncStoredInteger"
            checked={syncIntegerOnly}
            onChange={(_, data) => {
              setSyncIntegerOnly(!!data.checked);
            }}
          ></Form.Checkbox>
          <Form.Checkbox
            label="Срабатывания TriggerRegisterPlayerChatEvent"
            checked={chatCommandOnly}
            onChange={(_, data) => {
              setChatCommandOnly(!!data.checked);
            }}
          ></Form.Checkbox>
          <Form.Checkbox
            label="Блоки с ошибками парсера"
            checked={errorBlock}
            onChange={(_, data) => {
              setErrorBlock(!!data.checked);
            }}
          ></Form.Checkbox>
        </Form.Group>
        <Grid>
          <Grid.Row centered>
            <button
              disabled={page === 0}
              className="ui floated button"
              onClick={() => {
                setPage((page) => --page);

                if (pageScroll)
                  window.scrollTo({
                    top: document.body.scrollHeight,
                  });
              }}
            >
              Загрузить блоки сверху
            </button>
          </Grid.Row>
          <Grid.Row>
            {renderBlocks?.map((i) => {
              return <ExternalBlockCard actionsBlock={i} />;
            })}
          </Grid.Row>
          <Grid.Row centered>
            <button
              disabled={(page + 1) * PAGE_SIZE > (filterResult?.length || 0)}
              className="ui floated button"
              onClick={() => {
                setPage((page) => ++page);
                if (pageScroll)
                  window.scrollTo({
                    top: 0,
                  });
              }}
            >
              Загрузить блоки снизу
            </button>
          </Grid.Row>
        </Grid>
      </Form>
    </>
  );
}

export default ActionLog;
