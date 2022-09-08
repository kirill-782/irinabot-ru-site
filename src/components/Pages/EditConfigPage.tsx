import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Loader, Message } from "semantic-ui-react";
import { RestContext } from "../../context";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { Config } from "../../models/rest/Config";
import { JsonEditor as Editor } from "jsoneditor-react";
import ConfigEdit from "../MapPage/ConfigEdit";
import "./EditConfigPage.scss";
import { toast } from "react-semantic-toasts";

function EditConfigPage() {
  const { id } = useParams();
  const [configData, setConfigData] = useState<ConfigInfo | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [jsonEditor, setJsonEditor] = useState<boolean>();
  const [configPayload, setConfigPayload] = useState<Config>();
  const [configName, setConfigName] = useState<string>("");

  const { mapsApi } = useContext(RestContext);

  useEffect(() => {
    if (!configData) {
      setConfigPayload(undefined);
      setConfigName("");
    } else {
      setConfigPayload(configData.config);
      setConfigName(configData.name || "");
    }
  }, [configData]);

  useEffect(() => {
    const abort = new AbortController();

    if (configData) return;

    setLoading(true);

    mapsApi
      .getConfigInfo(parseInt(id || "0"), { signal: abort.signal })
      .then((map) => {
        setConfigData(map);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        if (e.message === "canceled") return;
        setErrorMessage(convertErrorResponseToString(e));
      });

    return () => {
      setLoading(false);
      setErrorMessage("");
      abort.abort();
    };
  }, [id, mapsApi, configData]);

  const saveConfig = () => {
    if (configData?.id && configPayload)
      mapsApi
        .editConfig(configData?.id, configName, configPayload)
        .then((configData) => {
          setConfigData(configData);
          toast({
            title: "Конфиг сохранен",
            icon: "check",
          });
        })
        .catch((e) => {
          toast({
            title: "Ошибка сохранения",
            description: convertErrorResponseToString(e),
            color: "red",
          });
        });
  };

  return (
    <Container className="edit-config-page">
      {errorMessage && (
        <Message error>
          <p>{errorMessage}</p>
        </Message>
      )}
      {isLoading && (
        <Loader active size="big">
          Загрузка
        </Loader>
      )}
      {configPayload && (
        <>
          <Message>
            Большая часть параметров предоставлена только для ознакомления. При
            редактировании учитывайте особенности версии. Конфиг был создан для
            версии <strong>{configData?.version}</strong>
          </Message>
          <Form>
            <Form.Field>
              <label>Имя конфига</label>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  value={configName}
                  onChange={(_, data) => {
                    setConfigName(data.value);
                  }}
                />
                <Form.Button
                  fluid
                  onClick={() => {
                    saveConfig();
                  }}
                >
                  Сохранить конфиг
                </Form.Button>
              </Form.Group>
              <Form.Checkbox
                label="Редактор JSON"
                checked={jsonEditor}
                onChange={(_, data) => {
                  setJsonEditor(data.checked);
                }}
              />
            </Form.Field>
          </Form>
        </>
      )}
      {configPayload &&
        (jsonEditor ? (
          <div className="json-editor">
            <Editor value={configPayload} onChange={setConfigPayload} />
          </div>
        ) : (
          <ConfigEdit
            configPayload={configPayload}
            onConfigChange={setConfigPayload}
          />
        ))}
    </Container>
  );
}

export default EditConfigPage;
