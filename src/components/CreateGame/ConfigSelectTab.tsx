import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Grid, Header } from "semantic-ui-react";
import { RestContext } from "../../context";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import "./ConfigSelectTab.scss";

function ConfigSelectTab() {
  const { mapsApi } = useContext(RestContext);

  const [configList, setConfigList] = useState<ConfigInfo[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasError, setError] = useState<string>("");

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
      <Grid.Column>
        <Grid.Row className="config-list">
          {configList.map((config) => (
            <Grid.Row key={config.id}>
              <Grid>
                <Grid.Column width={11}>
                  <Grid.Row>
                    <Header>{config.name}</Header>
                  </Grid.Row>
                  <Grid.Row>Дата обновления: {new Date(config.lastUpdateDate || 0).toLocaleString( ) }</Grid.Row>
                  <Grid.Row><Link to={`/maps/${config.mapId}`}>Перейти к карте</Link></Grid.Row>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Button floated="right" as={Link} to={`/create/confirm?configId=${config.id}`}>Выбрать</Button>
                </Grid.Column>
              </Grid>
            </Grid.Row>
          ))}
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
}

export default ConfigSelectTab;
