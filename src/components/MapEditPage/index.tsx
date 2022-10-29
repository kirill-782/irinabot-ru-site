import React, { useContext, useEffect } from "react";
import { Grid, Loader, Message } from "semantic-ui-react";
import { useMapFlags } from "../../hooks/useMapFlags";
import MapHeader from "../MapPage/MapHeader";
import AccessControl from "./AccessControl";
import FlagsEditBlock from "./FlagsEditBlock";
import { AuthContext, MapContext } from "./../../context/index";
import usePrevious from "../../hooks/usePrevious";
import ForbiddenPage from "../Pages/ForbiddenPage";

interface MapEditPageProps {
  updateMap: () => void;
}

function MapEditPage({ updateMap }: MapEditPageProps) {
  const { map } = useContext(MapContext);
  const { apiToken } = useContext(AuthContext).auth;

  const [flags, updateFlags, flagsLoading, flagsLoadError] = useMapFlags({
    mapId: map.id!!,
  });

  const oldFlags = usePrevious(flags);

  useEffect(() => {
    if (oldFlags !== flags && oldFlags) updateMap();
  }, [flags, updateMap]);

  const flagsRequiredAccess = map.owner
    ? "MAP_FLAGS_EDIT"
    : "MAP_FLAGS_EDIT_GLOBAL";

  if(!apiToken.hasAuthority(flagsRequiredAccess)) {
    return <ForbiddenPage />
  }

  return (
    <Grid stackable>
      <MapHeader></MapHeader>
      <Grid.Row stretched>
        <AccessControl requeredAuthority={flagsRequiredAccess}>
          {flagsLoadError && (
            <Message error className="fluid">
              <p>{flagsLoadError}</p>
            </Message>
          )}
          {flags && (
            <>
              <Message info className="fluid">
                <p>
                  Данные флаги влияют на поведение объекта карты. Обратите
                  внимание, что тег уникален и не может задан для не
                  верефицированных карт.
                </p>
              </Message>
              <FlagsEditBlock
                flags={flags}
                loading={flagsLoading}
                onFlagsChange={(flags) => {
                  if (flags) updateFlags(flags);
                }}
              ></FlagsEditBlock>
            </>
          )}
          {!flags && flagsLoading && (
            <Loader active size="big">
              Флаги загружаются
            </Loader>
          )}
        </AccessControl>
      </Grid.Row>
    </Grid>
  );
}

export default MapEditPage;
