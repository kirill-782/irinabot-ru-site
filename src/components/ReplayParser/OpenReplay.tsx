import React, { useContext, useRef, useState } from "react";
import {
  Button,
  Container,
  Form,
  Grid,
  Header,
  Icon,
  Message,
  Progress,
} from "semantic-ui-react";

import "./OpenReplay.scss";
import {
  DataBuffer,
  PackedData,
  ReplayParser,
  ReplayRecords,
} from "@kokomi/w3g-parser";
import { AppRuntimeSettingsContext } from "../../context";

import pako from "pako";

const decompressor = (data: Uint8Array): Uint8Array => {
  const inflater = new pako.Inflate();
  inflater.push(data, pako.constants.Z_SYNC_FLUSH | pako.constants.Z_FINISH);

  const inflaterNative = inflater as any;

  if (inflater.result) return inflater.result as Uint8Array;

  return inflaterNative.strm.output.length === inflaterNative.strm.next_out
    ? inflaterNative.strm.output
    : inflaterNative.strm.output.subarray(0, inflaterNative.strm.next_out);
};

interface OpenReplayProps {
  setReplayData: (name: string, data: PackedData<ReplayRecords>) => void;
}

function OpenReplay({ setReplayData }: OpenReplayProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const xhr = useRef<XMLHttpRequest | null>(null);

  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const openFromFile = (file: File) => {
    setError("");

    file.arrayBuffer().then((data) => {
      try {
        const parser = new ReplayParser(decompressor);
        setReplayData(file.name, parser.parse(DataBuffer.wrap(data, true)));
      } catch (e) {
        setError(e.toString());
      }
    });
  };

  const openFromUrl = (file: string) => {
    xhr.current = new XMLHttpRequest();
    xhr.current.responseType = "arraybuffer";

    xhr.current.onreadystatechange = () => {
      if (xhr.current?.readyState === 4) {
        try {
          const parser = new ReplayParser(decompressor);
          setReplayData("remote", parser.parse(DataBuffer.wrap(xhr.current.response, true)));
        } catch (e) {
          setError(e.toString());
        } finally {
          xhr.current = null;
          setProgress(0);
        }
      }
    };

    xhr.current.onerror = (e) => {
      xhr.current = null;
      setProgress(0);
      setError("Network error");
    };

    xhr.current.onprogress = (e) => {
      setProgress((e.loaded / e.total) * 100);
    };

    xhr.current.open("GET", file);
    xhr.current.send();
  };

  return (
    <Container className="open-replay">
      <div className="centerd">
        <Grid>
          <Grid.Row centered>
            <Header>{t("page.replay.open.insert")}</Header>
          </Grid.Row>
          {error && (
            <Grid.Row centered>
              <Message error>{error}</Message>
            </Grid.Row>
          )}
          <Grid.Row centered>
            <Form>
              <Form.Group>
                <Form.Input
                  style={{ width: "25vw" }}
                  value={url}
                  onChange={(_, data) => {
                    setUrl(data.value);
                  }}
                ></Form.Input>
                <Form.Button
                  disabled={!!xhr.current}
                  onClick={() => {
                    openFromUrl(url);
                  }}
                >
                  <Icon name="linkify" />
                  {t("page.replay.open.open")}
                </Form.Button>
              </Form.Group>
            </Form>
          </Grid.Row>
          {xhr.current && (
            <Grid.Row centered>
              <Progress
                style={{ width: "35vw" }}
                active
                indicating
                percent={progress}
              ></Progress>
            </Grid.Row>
          )}
          <Grid.Row centered>
            <Header>{t("page.replay.open.or")}</Header>
          </Grid.Row>
          <Grid.Row centered>
            <Button
              disabled={!!xhr.current}
              color="green"
              onClick={() => {
                fileInput.current?.click();
              }}
            >
              <Icon name="file" />
              {t("page.replay.open.file")}
            </Button>
            <input
              multiple
              accept=".w3g"
              onChange={(e) => {
                if (e.target.files?.length) openFromFile(e.target.files[0]);
              }}
              type="file"
              hidden
              ref={fileInput}
            />
          </Grid.Row>
        </Grid>
      </div>
    </Container>
  );
}

export default OpenReplay;
