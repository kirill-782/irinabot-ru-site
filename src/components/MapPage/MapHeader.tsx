import React, { useContext } from "react";
import { memo } from "react";
import { Grid, Header } from "semantic-ui-react";
import { AppRuntimeSettingsContext, MapContext } from "../../context";
import { getBotFileName } from "../../utils/MapFileUtils";
import LazyLoadedImage from "../LazyLoadedImage";
import MapStatusIcons from "../MapStatusIcons";
import WarcraftIIIText from "../WarcraftIIIText";
import LanguageKey from "../LanguageKey";

function MapHeader() {
    const map = useContext(MapContext).map;
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return (
        <>
            <Grid.Column className="cover-image" width={3}>
                {map.mapInfo?.coverImageUrl && (
                    <LazyLoadedImage
                        size="medium"
                        centered
                        blured={map?.additionalFlags?.["nsfw_images"]}
                        src={map.mapInfo?.coverImageUrl}
                    />
                )}
            </Grid.Column>
            <Grid.Column width={10}>
                <Header>
                    <WarcraftIIIText>{map.mapInfo?.name}</WarcraftIIIText>
                    <u>#{map.id}</u>
                    <MapStatusIcons {...map} />
                </Header>
                <p>
                    <WarcraftIIIText>{map.mapInfo?.description}</WarcraftIIIText>
                </p>
                <p>
                    <LanguageKey stringId="mapHeaderSourceFileName" />
                    <WarcraftIIIText>{map.mapInfo?.author}</WarcraftIIIText>
                </p>
                <p>
                    <LanguageKey stringId="mapHeaderPlayerRecommendation" />
                    <WarcraftIIIText>{map.mapInfo?.playerRecommendation}</WarcraftIIIText>
                </p>
                <p>
                    <LanguageKey stringId="mapHeaderSourceFileName" value={map.fileName} />
                </p>
                <p>
                    <LanguageKey
                        stringId="mapHeaderBotFileName"
                        value={getBotFileName(map.fileName || "", map.id || 0)}
                    />
                </p>
            </Grid.Column>
            <Grid.Column width={3}>
                {map.mapInfo?.mapImageUrl && (
                    <LazyLoadedImage
                        className="map-image"
                        centered
                        size="medium"
                        blured={map?.additionalFlags?.["nsfw_images"]}
                        src={map.mapInfo?.mapImageUrl}
                    />
                )}
            </Grid.Column>
        </>
    );
}

export default memo(MapHeader);
