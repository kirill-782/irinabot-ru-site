import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Button, Dropdown, Form, Grid, Header, Modal } from "semantic-ui-react";

import { Category } from "../../models/rest/Category";
import { Flags } from "../../models/rest/Flags";
import { AdditionalFlags, MapService } from "../../services/MapService";
import { useCategoryFilter } from "../../hooks/useCategoryFilter";

interface PrepareUploadMapModalProps {
  onMapSelected: (
    file: FileList,
    flags: Flags,
    additionalFlags: AdditionalFlags
  ) => void;
  open: boolean;
  onClose: (event: SyntheticEvent, data: object) => void;
}

function PrepareUploadMapModal({
  onMapSelected,
  open,
  onClose,
}: PrepareUploadMapModalProps) {
  const mapService = new MapService();
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadding, setLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);

  const [selectedCategories, setSelectedCategories] = useState<any>([]);

  useEffect(() => {
    mapService
      .getCategories()
      .then((categories) => {
        setLoading(false);
        setCategories(categories);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setLoadingError(true);
      });
  }, []);

  const dropdownOptions = useCategoryFilter(selectedCategories, categories, 5);

  const fileInput = useRef<HTMLInputElement>(null);

  const emitMapSelected = (files: FileList) => {
    const flags: Flags = {
      categories: selectedCategories,
    };

    onMapSelected(files, flags, {});
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Выберите карту</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Какую карту загрузить?</Header>
          <p>
            Укажите путь до w3x карты. Обычно карты находятся в папке maps,
            которая находится там где Warcraft III.
          </p>
          <Form>
            <Form.Field>
              <label>Выберите до 5 категорий для карты</label>
              <Dropdown
                fluid
                multiple
                placeholder="Категории"
                selection
                options={dropdownOptions}
                error={loadingError}
                loading={loadding}
                onChange={(e, p) => {
                  setSelectedCategories(p.value);
                }}
                value={selectedCategories}
              />
            </Form.Field>
            <Form.Field>
              <Grid>
                <Grid.Row centered>
                  <Button
                    as={"a"}
                    content="Выбрать карту"
                    icon="file"
                    disabled={!selectedCategories.length}
                    size="big"
                    onClick={() => {
                      fileInput.current.click();
                    }}
                  />
                  <input
                    multiple
                    accept=".w3x , .w3m"
                    onChange={(e) => {
                      emitMapSelected(e.target.files);
                    }}
                    type="file"
                    hidden
                    ref={fileInput}
                  />
                </Grid.Row>
              </Grid>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default PrepareUploadMapModal;
