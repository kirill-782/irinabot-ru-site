import React, { memo, useContext, useState } from "react";
import { Button, Dropdown, Form, Icon, Modal } from "semantic-ui-react";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { AppRuntimeSettingsContext, RestContext } from "./../../context/index";
import { toast } from "@kokomi/react-semantic-toasts";
import { useNavigate } from "react-router-dom";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

interface CloneConfigButtonProps {
  configs?: ConfigInfo[];
  mapId: number;
  className?: string;
}

function CloneConfigButton({
  configs,
  mapId,
  className,
}: CloneConfigButtonProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [selectedVersion, setSelectedVersion] = useState("");
  const [configName, setConfigName] = useState("");

  const enabled = (configs?.filter((i) => i.status === 1).length || []) > 0;

  const { mapsApi } = useContext(RestContext);

  const go = useNavigate();

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  const cloneConfigRequests = async (): Promise<ConfigInfo> => {
    const defaultConfig = await mapsApi.getDefaultMapConfig(
      mapId,
      selectedVersion
    );
    if (defaultConfig.status !== 1 || !defaultConfig.config)
      throw new Error(lang.page_map_cloneConfig_error);
    else {
      return await mapsApi.createConfig(
        mapId,
        configName,
        selectedVersion,
        defaultConfig.config
      );
    }
  };

  const cloneConfig = () => {
    cloneConfigRequests()
      .then((createdConfig) => {
        go(`/config/${createdConfig.id}/edit`);
      })
      .catch((e) => {
        toast({
          title: lang.copyError,
          description: convertErrorResponseToString(e),
          color: "red",
        });
      });
  };

  return (
    <>
      <Button
        className={className}
        color="green"
        basic
        icon="copy"
        title={lang.caption}
        disabled={!enabled}
        onClick={() => {
          setModalOpen(true);
        }}
      />
      {modalOpen && configs && (
        <Modal
          open={modalOpen}
          size="tiny"
          closeIcon
          onClose={() => {
            setModalOpen(false);
          }}
        >
          <Modal.Header>
            {lang.page_map_cloneConfing_modal_caption}
          </Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Select
                label={lang.page_map_cloneConfing_modal_version}
                value={selectedVersion}
                onChange={(_, data) => {
                  setSelectedVersion((data.value as string) || "");
                }}
                options={
                  configs
                    .filter((i) => i.status === 1)
                    .map((i) => {
                      return {
                        text:
                          lang.configStandart +
                          " " +
                          i.version,
                        value: i.version,
                      };
                    }) || []
                }
              ></Form.Select>
              <Form.Input
                value={configName}
                onChange={(_, data) => {
                  setConfigName(data.value);
                }}
                label={lang.configCaption}
              />
              <Form.Button
                color="green"
                onClick={() => {
                  cloneConfig();
                }}
              >
                <Icon name="copy" />
                {lang.copy}
              </Form.Button>
            </Form>
          </Modal.Content>
        </Modal>
      )}
    </>
  );
}

export default memo(CloneConfigButton);
