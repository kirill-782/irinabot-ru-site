import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Loader, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { Config } from "../../models/rest/Config";
import { JsonEditor as Editor } from "jsoneditor-react";
import ConfigEdit from "../MapPage/ConfigEdit";
import "./EditConfigPage.scss";
import { toast } from "@kokomi/react-semantic-toasts";
import LanguageKey from "../LanguageKey";

function EditConfigPage() {
  const { id } = useParams();
  const [configData, setConfigData] = useState<ConfigInfo | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [jsonEditor, setJsonEditor] = useState<boolean>();
  const [configPayload, setConfigPayload] = useState<Config>();
  const [configName, setConfigName] = useState<string>("");

  const { mapsApi } = useContext(RestContext);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

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
            title: lang.editConfigPageConfigSaved,
            icon: "check",
          });
        })
        .catch((e) => {
          toast({
            title: lang.editConfigPageSaveError,
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
          {lang.loading}
        </Loader>
      )}
      {configPayload && (
        <>
          <Message>
            <LanguageKey stringId="editConfigPageNotificationDescription" version={configData?.version}/>
          </Message>
          <Form>
            <Form.Field>
              <label><LanguageKey stringId="editConfigPageNameLabel"/></label>
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
                  {lang.save}
                </Form.Button>
              </Form.Group>
              <Form.Checkbox
                label={lang.editConfigPageJsonEditor}
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
