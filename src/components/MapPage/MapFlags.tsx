import React, { memo, useContext } from "react";
import { Container, Grid, Header, Label, List, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext, MapContext } from "../../context";
import LanguageKey from "../LanguageKey";
import "./MapFlags.scss";

function MapFlags() {
    const { mapDescription, hasCheats, statsType, hclSupport, sematicCheckError, ...otherFlags } =
        useContext(MapContext).map.additionalFlags || {};

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    return (
        <div className="map-flags">
            {hasCheats && <Label color="red">{lang.mapFlagsCheat}</Label>}
            {sematicCheckError && <Label color="red">{lang.mapFlagsSemantic}</Label>}
            {statsType && (
                <Label>
                    <LanguageKey stringId="mapFlagsStatsType" value={statsType}></LanguageKey>
                </Label>
            )}
            {hclSupport && <Label>{lang.mapFlagsHclSupport}</Label>}
        </div>
    );
}

export default memo(MapFlags);
