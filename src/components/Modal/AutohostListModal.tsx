import { Button, Grid, Header, Modal, Table } from "semantic-ui-react";

function AutohostListModal() {
  return (
    <Modal closeIcon open>
      <Header content="Список автохостов" />
      <Modal.Content>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={9}>Имя</Table.HeaderCell>
              <Table.HeaderCell width={2}>Автостарт</Table.HeaderCell>
              <Table.HeaderCell width={2}>Лимит игр</Table.HeaderCell>
              <Table.HeaderCell width={5}>Создано игр</Table.HeaderCell>
              <Table.HeaderCell width={3}>Владелец</Table.HeaderCell>
              <Table.HeaderCell width={1}>Действия</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>DotA Imba Legends</Table.Cell>
              <Table.Cell>10</Table.Cell>
              <Table.Cell>5</Table.Cell>
              <Table.Cell>105</Table.Cell>
              <Table.Cell>8</Table.Cell>
              <Table.Cell>
                <Grid textAlign="center">
                  <Button basic size="small" color="red" icon="x"></Button>
                </Grid>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Body>
            <Table.Row>
              <Table.Cell>DotA Imba Legends</Table.Cell>
              <Table.Cell>10</Table.Cell>
              <Table.Cell>5</Table.Cell>
              <Table.Cell>105</Table.Cell>
              <Table.Cell>8</Table.Cell>
              <Table.Cell>
                <Grid textAlign="center">
                  <Button basic size="small" color="red" icon="x"></Button>
                </Grid>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Modal.Content>
    </Modal>
  );
}

export default AutohostListModal;
