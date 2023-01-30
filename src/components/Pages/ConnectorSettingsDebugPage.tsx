import { Resizable } from "re-resizable";
import React, { useState } from "react";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Grid,
  Icon,
  Message,
  SemanticICONS,
} from "semantic-ui-react";

interface SettingsCatgegoryProps {
  iconName: SemanticICONS;
  title: string;
  active?: boolean;
  onClick: () => void;
}

function SettingsTab({
  iconName,
  title,
  active,
  onClick,
}: SettingsCatgegoryProps) {
  const styles: any = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: 15,
    padding: 10,
    border: "1px solid transparent",
  };

  if (active) {
    styles.border = "dashed 1px";
  }

  return (
    <div onClick={onClick} style={styles}>
      <Icon name={iconName} size="huge" />
      <div>
        <strong>{title}</strong>
      </div>
    </div>
  );
}

const leftTabs = [
  {
    iconName: "settings",
    title: "Общие",
    id: "general",
  },
  {
    iconName: "disk",
    title: "Пути",
    id: "paths",
  },
  {
    iconName: "file alternate",
    title: "Слоты",
    id: "slots",
  },
];

const rightContent = {
  general: <GeneralSettings />,
  paths: <PathsSettings />,
  slots: <Message info>Без спойлеров</Message>,
};

function ConnectorSettingsDebugPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Container>
      <Grid celled style={{ flexWrap: "nowrap" }}>
        <Resizable
          className="column"
          minWidth="150px"
          maxWidth="40%"
          enable={{ right: true }}
        >
          {leftTabs.map((i) => {
            return (
              <SettingsTab
                onClick={() => {
                  setActiveTab(i.id);
                }}
                iconName={i.iconName as SemanticICONS}
                title={i.title}
                active={activeTab === i.id}
              ></SettingsTab>
            );
          })}
        </Resizable>
        <Grid.Column style={{ width: "100%" }}>
          {rightContent[activeTab]}
        </Grid.Column>
      </Grid>
    </Container>
  );
}

function GeneralSettings() {
  const [hasSocks, setSocks] = useState(false);

  return (
    <Form>
      <FieldSet title="Основные">
        <Form.Input
          label="Порт коннектора"
          type="number"
          defaultValue={9988}
        ></Form.Input>
        <FormGroup fluid>
          <Form.Field width={16}>
            <label>Путь до UjAPI</label>
            <Form.Group widths="equal">
              <Form.Input placeholder="C:\Users\kiril\Desktop\UJApi\UjAPILauncher.exe"></Form.Input>
              <Button style={{ marginLeft: 10 }} color="green">
                Выбрать
              </Button>
            </Form.Group>
          </Form.Field>
        </FormGroup>
        <FieldSet title="Дополнительные возможности">
          <Form.Checkbox label="Разрешить загружать карты через HTTP сервер"></Form.Checkbox>
          <Form.Checkbox label="Включить GProxy"></Form.Checkbox>
        </FieldSet>
      </FieldSet>
      <FieldSet
        disabled={!hasSocks}
        title={
          <Form.Checkbox
            label="Использовать SOCKS5 прокси для соединения"
            checked={hasSocks}
            onChange={() => {
              setSocks(!hasSocks);
            }}
          />
        }
      >
        <Form.Input label="Хост" defaultValue="localhost"></Form.Input>
        <Form.Input
          label="Порт сервера"
          type="number"
          defaultValue={3322}
        ></Form.Input>
      </FieldSet>
    </Form>
  );
}

function PathsSettings() {
  return (
    <Form>
      <Form.Select
        options={[
          {
            text: "1.26-UJ",
          },
          {
            text: "1.26",
            value: "1.26",
          },
          {
            text: "1.27",
          },
          {
            text: "1.27-custom",
          },
          {
            text: "1.28.5",
          },
          {
            text: "1.29",
          },
          {
            text: "1.31",
          },
          {
            text: "1.32",
          },
          {
            text: "1.35",
          },
        ]}
        label="Версия по умолчанию"
        defaultValue="1.26"
      ></Form.Select>

      <PatchSection name="1.26"></PatchSection>
      <PatchSection name="1.26-Uj"></PatchSection>
      <PatchSection name="1.27" canSelfRun></PatchSection>
      <PatchSection name="1.27-custom" canSelfRun></PatchSection>
      <PatchSection name="1.28.5" canSelfRun></PatchSection>
      <PatchSection name="1.29" canSelfRun></PatchSection>

    </Form>
  );
}

interface FieldSetProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

function FieldSet({ title, children, disabled }: FieldSetProps) {
  return (
    <fieldset
      disabled={disabled}
      style={{
        border: "1px solid rgba(34, 36, 38, 0.15)",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

interface PatchSectionProps {
  name: string;
  canSelfRun?: boolean;
}

function PatchSection({ name, canSelfRun }: PatchSectionProps) {
  return (
    <FieldSet title={name}>
      <FormGroup fluid>
        <Form.Field width={16}>
          <label>Путь до исполняемого файла</label>
          <Form.Group widths="equal" style={{ marginBottom: 0 }}>
            <Form.Input placeholder="C:\Users\kiril\Desktop\UJApi\UjAPILauncher.exe"></Form.Input>
            <Button style={{ marginLeft: 10 }} color="green">
              Выбрать
            </Button>
          </Form.Group>
        </Form.Field>
      </FormGroup>
      {canSelfRun && <Form.Checkbox label="Запущу сам"></Form.Checkbox>}
    </FieldSet>
  );
}

export default ConnectorSettingsDebugPage;
