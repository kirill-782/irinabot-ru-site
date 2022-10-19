import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Form,
  Grid,
  Icon,
} from "semantic-ui-react";
import { CacheContext } from "../../context";
import { useCategoryFilter } from "../../hooks/useCategoryFilter";
import { Flags } from "../../models/rest/Flags";

import './FlagsEditBlock.scss';

interface FlagsEditBlockProps {
  flags?: Flags;
  onFlagsChange?: (flags?: Flags) => void;
}

function FlagsEditBlock({ flags, onFlagsChange }: FlagsEditBlockProps) {
  const cacheContext = useContext(CacheContext);

  const [selectedCategories, setSelectedCategories] = useState<any>([]);

  const dropdownOptions = useCategoryFilter(
    selectedCategories,
    cacheContext.cachedCategories,
    5
  );

  useEffect(() => {
    if (cacheContext.cachedCategories.length === 0)
      cacheContext.cacheCategories();
  }, [cacheContext.cachedCategories, cacheContext.cacheCategories]);

  return (
    <div className="flags-edit">
      <Grid columns="equal" stackable>
        <Grid.Column>
          <Form>
            <Form.Checkbox label="Карту можно скачать" />
            <Form.Checkbox label="Карта заблокирована" />
          </Form>
        </Grid.Column>
        <Grid.Column>
          <Form>
            <Form.Checkbox label="Изображения из карты доступны" />
            <Form.Checkbox label="Карта проверена" />
          </Form>
        </Grid.Column>
      </Grid>
      <div className="block">
        <Form>
          <Form.Group widths="equal">
            <Form.Dropdown
              label="Категории"
              fluid
              multiple
              placeholder="Категории"
              selection
              options={dropdownOptions}
              loading={cacheContext.cachedCategories.length === 0}
              onChange={(e, p) => {
                setSelectedCategories(p.value);
              }}
              value={selectedCategories}
            />
            <Form.Input fluid label="Тег карты (отметка)" />
          </Form.Group>
        </Form>
      </div>
      {
        !onFlagsChange && (
          <Button color="green" ><Icon name="save" />Сохранить</Button>
        )
      }
    </div>
  );
}

export default FlagsEditBlock;
