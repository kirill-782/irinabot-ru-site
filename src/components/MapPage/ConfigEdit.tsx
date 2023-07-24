import React, { useContext } from "react";
import { Form, Header } from "semantic-ui-react";
import { Config } from "../../models/rest/Config";
import SlotsEdit from "./SlotsEdit";
import { AppRuntimeSettingsContext } from "../../context";

interface ConfigEditProps {
  configPayload: Config;
  onConfigChange: (config: Config) => void;
}

function ConfigEdit({ configPayload, onConfigChange }: ConfigEditProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <>
      <Header size="large">{lang.edit}</Header>
      <Form>
        <Form.Group widths="equal">
          <Form.Input
            type="number"
            fluid
            label="numPlayers"
            value={configPayload.numPlayers}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                numPlayers: parseInt(data.value),
              });
            }}
          />
          <Form.Input
            type="number"
            fluid
            label="numTeams"
            value={configPayload.numTeams}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                numTeams: parseInt(data.value),
              });
            }}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Input
            type="number"
            label="width"
            fluid
            value={configPayload.width}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                width: parseInt(data.value),
              });
            }}
          />
          <Form.Input
            label="height"
            type="number"
            fluid
            value={configPayload.height}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                height: parseInt(data.value),
              });
            }}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Input
            label="options"
            type="number"
            fluid
            value={configPayload.options}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                options: parseInt(data.value),
              });
            }}
          />
          <Form.Input
            label="size"
            fluid
            type="number"
            value={configPayload.size}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                size: parseInt(data.value),
              });
            }}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Input
            label="info"
            fluid
            value={configPayload.info}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                info: data.value,
              });
            }}
          />
          <Form.Input
            label="crc"
            fluid
            value={configPayload.crc}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                crc: data.value,
              });
            }}
          />
          <Form.Input
            label="sha1"
            fluid
            value={configPayload.sha1}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                sha1: data.value,
              });
            }}
          />
          <Form.Input
            label="fileSha1"
            fluid
            value={configPayload.fileSha1}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                fileSha1: data.value,
              });
            }}
          />
        </Form.Group>
        <Form.Checkbox
          label="broadcast"
          checked={configPayload.broadcast}
          onChange={(_, data) => {
            onConfigChange({
              ...configPayload,
              broadcast: data.checked,
            });
          }}
        />
        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="maxPlayers"
            type="number"
            value={configPayload.maxPlayers}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                maxPlayers: parseInt(data.value),
              });
            }}
          />
          <Form.Input
            fluid
            label="versionPrefix"
            value={configPayload.versionPrefix}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                versionPrefix: data.value,
              });
            }}
          />
          <Form.Input
            fluid
            label="productID"
            value={configPayload.productID}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                productID: data.value,
              });
            }}
          />
          <Form.Input
            label="domain"
            fluid
            value={configPayload.domain}
            onChange={(_, data) => {
              onConfigChange({
                ...configPayload,
                domain: data.value,
              });
            }}
          />
        </Form.Group>
        <Header size="medium">{lang.configEditPlayerSlots}</Header>
        <SlotsEdit
          slots={configPayload.playableSlots}
          options={configPayload.options}
          onSlotsChange={(slots) => {
            onConfigChange({ ...configPayload, playableSlots: slots });
          }}
        />
        {configPayload.observerSlots && (
          <>
            <Header size="medium">{lang.configEditObserverSlots}</Header>
            <SlotsEdit
              slots={configPayload.observerSlots}
              onSlotsChange={(slots) => {
                onConfigChange({ ...configPayload, observerSlots: slots });
              }}
            />
          </>
        )}
      </Form>
    </>
  );
}

export default ConfigEdit;
