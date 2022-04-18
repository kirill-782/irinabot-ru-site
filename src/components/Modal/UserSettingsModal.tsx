import {
  Button,
  Container,
  Header,
  Icon,
  Item,
  List,
  Modal,
  Image,
  Form,
  Input,
} from "semantic-ui-react";
import { useContext } from "react";
import { AuthContext } from "./../../context/index";

function UserSettingsModal(props) {
  const auth = useContext(AuthContext).auth;

  return (
    <Modal {...props}>
      <Modal.Header>Настройки</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Подключение аккаунтов</Header>
          <Container>
            <Button basic color="green">
              Warcraft III
            </Button>
            <Button color="blue">
              <Icon name="vk"></Icon>VK
            </Button>
            <Button color="purple">
              <Icon name="discord"></Icon>Discord
            </Button>
          </Container>
          <List size="medium">
            <Item>
              <Image avatar>
                <Icon name="hashtag"></Icon>
              </Image>
              {auth.currentAuth.connectorId}
            </Item>
            {auth.currentAuth.bnetName.length > 0 && (
              <Item>
                <Image avatar>
                  <Icon name="ambulance"></Icon>
                </Image>
                {auth.currentAuth.bnetName}
              </Item>
            )}
            {auth.currentAuth.vkId > 0 && (
              <Item>
                <Image avatar>
                  <Icon name="vk"></Icon>
                </Image>
                {auth.currentAuth.vkId}
              </Item>
            )}
            {auth.currentAuth.discordId.length > 0 && (
              <Item>
                <Image avatar>
                  <Icon name="discord"></Icon>
                </Image>
                {auth.currentAuth.discordId}
              </Item>
            )}
          </List>
          <Form>
            <Form.Field>
              <label>Nickname IrInA connector</label>
              <Form.Group widths="equal">
                <Input placeholder={auth.currentAuth.connectorName}></Input>
                <Button style={{ marginLeft: 10 }} color="green">
                  Сохранить
                </Button>
              </Form.Group>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default UserSettingsModal;
