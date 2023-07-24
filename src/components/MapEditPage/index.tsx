import React, { useContext, useEffect, useState } from "react";
import { Grid, Header, Loader, Message } from "semantic-ui-react";
import { useMapFlags } from "../../hooks/useMapFlags";
import MapHeader from "../MapPage/MapHeader";
import AccessControl from "./AccessControl";
import FlagsEditBlock from "./FlagsEditBlock";
import {
  AppRuntimeSettingsContext,
  AuthContext,
  MapContext,
  RestContext,
} from "../../context";
import usePrevious from "../../hooks/usePrevious";
import ForbiddenPage from "../Pages/ForbiddenPage";
import MapExternalDescriptionEdit from "./MapExternalDescriptionEdit";

interface MapEditPageProps {
  updateMap: () => void;
}

function MapEditPage({ updateMap }: MapEditPageProps) {
  const { map } = useContext(MapContext);
  const { apiToken } = useContext(AuthContext).auth;

  const { mapsApi } = useContext(RestContext);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

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

  const externalMapDescriptionAccess = "MAP_VERIFY";

  const [mapDescriptionLoading, setMapDescriptionLoading] = useState(false);

  const updateMapDescription = (description: string | null) => {
    setMapDescriptionLoading(true);

    mapsApi
      .patchAdditionalMapFlags(map.id!!, {
        mapDescription: description,
      })
      .then(() => {
        updateMap();
      })
      .finally(() => {
        setMapDescriptionLoading(false);
      });
  };

  if (
    !apiToken.hasAuthority(flagsRequiredAccess) &&
    !apiToken.hasAuthority(externalMapDescriptionAccess)
  ) {
    return <ForbiddenPage />;
  }

  return (
    <Grid stackable>
      <MapHeader></MapHeader>
      <AccessControl requeredAuthority={flagsRequiredAccess}>
        <Grid.Row stretched>
          {flagsLoadError && (
            <Message error className="fluid">
              <p>{flagsLoadError}</p>
            </Message>
          )}
          {flags && (
            <>
              <Message info className="fluid">
                <p>{lang.mapEditPageFlagsNotification}</p>
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
              {lang.mapEditPageFlagsLoading}
            </Loader>
          )}
        </Grid.Row>
      </AccessControl>
      <AccessControl requeredAuthority="MAP_VERIFY">
        <Grid.Row stretched>
          <Header>{lang.mapEditPageExtraDescriptionLabel}</Header>
          <Message info className="fluid">
            <p>{lang.mapEditPageExtraDescriptionNotification}</p>
          </Message>
          <MapExternalDescriptionEdit
            value={map.additionalFlags?.["mapDescription"]}
            loading={mapDescriptionLoading}
            onChange={updateMapDescription}
          />
        </Grid.Row>
      </AccessControl>
    </Grid>
  );
}

export default MapEditPage;
