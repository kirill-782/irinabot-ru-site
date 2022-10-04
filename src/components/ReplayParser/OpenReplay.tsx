import React, { useRef, useState } from "react";
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
import ReplayParser, { ReplayResult } from "@kokomi/w3g-parser-browser";

interface OpenReplayProps {
  setReplayData: (name: string, data: ReplayResult) => void;
}

function OpenReplay({ setReplayData }: OpenReplayProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const xhr = useRef<XMLHttpRequest | null>(null);

  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const openFromFile = (file: File) => {
    setError("");

    file.arrayBuffer().then((data) => {
      try {
        const parser = new ReplayParser();
        setReplayData(file.name, parser.parseReplay(data));
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
          const parser = new ReplayParser();
          setReplayData("remote", parser.parseReplay(xhr.current.response));
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
            <Header>Вставьте ссылку на файл повтора</Header>
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
                  Открыть
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
            <Header>Или</Header>
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
              Открыть файл
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
