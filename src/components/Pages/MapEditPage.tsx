import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Container, Header, Message } from "semantic-ui-react";
import { RestContext } from "../../context";
import { Flags } from "../../models/rest/Flags";
import FlagsEditBlock from "../MapEditPage/FlagsEditBlock";
import { convertErrorResponseToString } from "./../../utils/ApiUtils";

function MapEditPage() {
  const { id } = useParams();
  const { mapsApi } = useContext(RestContext);

  const [flags, setFlags] = useState<Flags>();
  const [flagsLoading, setFlagsLoading] = useState<boolean>(false);
  const [flagsLoadError, setFlagsLoadError] = useState<string>("");

  const updateFlags = (flags: Flags) => {
    setFlagsLoading(true);
    mapsApi
      .patchMapFlags(parseInt(id || "0"), flags)
      .then((flags) => {
        setFlags(flags);
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  };

  useEffect(() => {
    // Load flags

    setFlagsLoading(true);
    setFlagsLoadError("");
    setFlags(undefined);

    mapsApi
      .getMapFlags(parseInt(id || "0"))
      .then((e) => {
        setFlags(e);
      })
      .catch((e) => {
        setFlagsLoadError(convertErrorResponseToString(e));
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  }, [id, mapsApi]);

  return (
    <Container>
      <Message info>
        <p>
          Данные флаги влияют на поведение объекта карты. Обратите внимание, что
          тег уникален и не может задан для не верефицированных карт.
        </p>
      </Message>
      <FlagsEditBlock
        flags={flags}
        loading={flagsLoading}
        onFlagsChange={(flags) => {
          if (flags) updateFlags(flags);
        }}
      ></FlagsEditBlock>
    </Container>
  );
}

export default MapEditPage;
