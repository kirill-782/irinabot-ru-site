import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Grid, Header, Loader, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import "./ConfigSelectTab.scss";

function ConfigSelectTab() {
  const { mapsApi } = useContext(RestContext);

  const [configList, setConfigList] = useState<ConfigInfo[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasError, setError] = useState<string>("");

  const go = useNavigate();
  
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const deleteConfig = (configId: number) => {
    mapsApi
      .deleteConfig(configId)
      .then(() => {
        setConfigList((configList) => {
          return configList.filter((i) => i.id !== configId);
        });
      })
      .catch((e) => {
        toast({
          title: t("other.config.selectTAB.removeError"),
          description: convertErrorResponseToString(e),
          color: "red",
        });
      });
  };

  useEffect(() => {
    setConfigList([]);
    setLoading(true);
    setError("");

    mapsApi
      .getConfigs()
      .then(setConfigList)
      .catch((e) => {
        setError(convertErrorResponseToString(e));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mapsApi]);

  return (
    <Grid columns="equal" stackable className="config-select-tab">
      {hasError && <Message color="red">{hasError}</Message>}
      {isLoading && (
        <Loader active size="massive">
          {t("other.config.selectTAB.loading")}
        </Loader>
      )}
      {configList.length > 0 && (
        <Grid.Column>
          <Grid.Row className="config-list">
            {configList.map((config) => (
              <Grid.Row key={config.id}>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={11}>
                      <Grid.Row>
                        <Header>
                          {config.name} ({config.version})
                        </Header>
                      </Grid.Row>
                      <Grid.Row>
                      {t("other.config.selectTAB.update")}:
                        {new Date(config.lastUpdateDate || 0).toLocaleString()}
                      </Grid.Row>
                      <Grid.Row>
                        <Link to={`/maps/${config.mapId}`}>
                        {t("other.config.selectTAB.tomap")}
                        </Link>
                      </Grid.Row>
                    </Grid.Column>
                    <Grid.Column width={5}>
                      <Button
                        floated="right"
                        as={Link}
                        to={`/create/confirm?configId=${config.id}`}
                      >
                        {t("other.config.selectTAB.choose")}
                      </Button>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Button
                      color="green"
                      onClick={() => {
                        go(`/config/${config.id}/edit`);
                      }}
                    >
                      {t("other.config.selectTAB.edit")}
                    </Button>
                    <Button
                      color="red"
                      onClick={() => {
                        deleteConfig(config.id || 0);
                      }}
                    >
                      {t("other.config.selectTAB.delete")}
                    </Button>
                  </Grid.Row>
                </Grid>
              </Grid.Row>
            ))}
          </Grid.Row>
        </Grid.Column>
      )}
      {configList.length === 0 && !hasError && !isLoading && (
        <Grid.Column>
          <Grid.Row className="config-list">
            <Message info>{t("other.config.selectTAB.noconfig")}.</Message>
          </Grid.Row>
        </Grid.Column>
      )}
    </Grid>
  );
}

export default ConfigSelectTab;
