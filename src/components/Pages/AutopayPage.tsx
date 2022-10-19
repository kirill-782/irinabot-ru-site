import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Container, Form, Grid, Header, Message } from "semantic-ui-react";
import { AuthContext } from "./../../context/index";
import { SITE_TITLE } from "../../config/ApplicationConfig";
import MetaDescription from "../Meta/MetaDescription";
import React from "react";

interface Place {
  placeId: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
}

const availablePlaces: Place[] = [
  {
    placeId: 1,
    title: "VIP доступ",
    description: "",
    imageUrl: "/images/vip.png",
    price: 149,
  },
  {
    placeId: 5,
    title: "Ban list",
    description: "",
    imageUrl: "/images/ban_list.png",
    price: 99,
  },
  {
    placeId: 6,
    title: "Admin list",
    description: "",
    imageUrl: "/images/admin_lina.png",
    price: 99,
  },
  {
    placeId: 4,
    title: "Autohost",
    description: "",
    imageUrl: "/images/autohost.png",
    price: 299,
  },
];

function AutopayPage() {
  const authContext = useContext(AuthContext);

  const [selectedPlaces, setSelectedPlaces] = useState<number[]>([]);
  const [connectroId, setConnectorId] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");

  const formRef = useRef<HTMLFormElement>(null);
  const paymentTypeRef = useRef<HTMLInputElement>(null);
  const paylentLabelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConnectorId(authContext.auth.currentAuth?.connectorId.toString());
  }, [authContext.auth.currentAuth]);

  useEffect(() => {
    window.document.title = `Донат | ${SITE_TITLE}`;
  }, []);

  const togglePlaceCheckbox = (placeId) => {
    if (selectedPlaces.find((el) => el === placeId) === undefined)
      setSelectedPlaces([...selectedPlaces, placeId]);
    else setSelectedPlaces(selectedPlaces.filter((el) => el !== placeId));
  };

  const checkAndSetConnectorId = (value: string) => {
    if (value === "") setConnectorId("");

    value = value.replace("#", "");

    if (isNaN(parseInt(value))) return;
    else setConnectorId(parseInt(value).toString());
  };

  const checkAndSetDuration = (value: string) => {
    if (value === "") setDuration("");

    if (isNaN(parseInt(value))) return;
    else if (parseInt(value) > 0) setDuration(parseInt(value).toString());
  };

  const [totalPrice, isValid] = useMemo(() => {
    let basePriceInMoonth = 0;

    selectedPlaces.forEach((placeId) => {
      const placeInfo = availablePlaces.find(
        (placeInfo) => placeInfo.placeId === placeId
      );

      if (placeInfo !== undefined) basePriceInMoonth += placeInfo.price;
    });

    const totalPrice = basePriceInMoonth * parseInt(duration);

    return [totalPrice, totalPrice > 0 && parseInt(connectroId) > 1];
  }, [selectedPlaces, duration, connectroId]);

  const renerErrorMessage = () => {
    if (isValid) return null;

    if (totalPrice === 0)
      return (
        <Message color="red">
          <Message.Header>Не выбран донат</Message.Header>
          <p>Отметьте одну или несколько галочек выше</p>
        </Message>
      );

    return (
      <Message color="red">
        <Message.Header>ID connector неверный</Message.Header>
        <p>
          Неверно введен ID коннектора. Ведите числа напротив # в настройках на
          сайте
        </p>
      </Message>
    );
  };

  const pay = (payType: string) => {
    if (paymentTypeRef.current && paylentLabelRef.current && formRef.current) {
      paymentTypeRef.current.value = payType;
      paylentLabelRef.current.value = JSON.stringify([
        connectroId,
        selectedPlaces,
      ]);
      formRef.current.submit();
    }
  };

  return (
    <Container>
      <MetaDescription description="Здесь можно оплатить привилегии на боте." />
      <Header>Калькулятор описания для автоподключения доната</Header>
      <Form ref={formRef} method="POST" action="https://yoomoney.ru/quickpay/confirm.xml">
        <Grid columns="equal" stackable>
          <Grid.Column width="two">
            {availablePlaces.map((place) => {
              return (
                <Form.Checkbox
                  key={place.placeId}
                  checked={
                    selectedPlaces.find((el) => el === place.placeId) !==
                    undefined
                  }
                  onChange={() => {
                    togglePlaceCheckbox(place.placeId);
                  }}
                  label={place.title}
                ></Form.Checkbox>
              );
            })}
          </Grid.Column>
          <Grid.Column width="three" floated="right">
            <Form.Input
              label="Ваш ID"
              value={connectroId}
              onChange={(e) => checkAndSetConnectorId(e.target.value)}
            ></Form.Input>
            <Form.Input
              label="Продолжительность (месяцы)"
              value={duration}
              onChange={(e) => checkAndSetDuration(e.target.value)}
            ></Form.Input>
            <Form.Input
              name="sum"
              label="Итого"
              value={totalPrice}
            ></Form.Input>
          </Grid.Column>
          <Grid.Row>{renerErrorMessage()}</Grid.Row>
          <Grid.Row>
            <Form.Group>
              <Form.Button
                onClick={() => pay("AC")}
                disabled={!isValid}
                basic
                color="green"
              >
                Оплата картой
              </Form.Button>
              <Form.Button
                onClick={() => pay("PC")}
                disabled={!isValid}
                basic
                color="green"
              >
                Оплата Yoo Money
              </Form.Button>
            </Form.Group>
            <Message info>
              <p>
                Если вы подключаете автохост впервые - напишите в группу ВК (
                <a href="https://vk.com/irina_bot">https://vk.com/irina_bot</a>)
                или на сервере Discord (
                <a href="https://discord.gg/cTfyEZT">
                  https://discord.gg/cTfyEZT
                </a>
                ), чтобы получить информацию по его установке.
              </p>
            </Message>
          </Grid.Row>
        </Grid>
        <input type="hidden" name="receiver" value="41001757275906" />
        <input
          type="hidden"
          name="formcomment"
          value="Irina Bot оплата платных услуг."
        />
        <input
          type="hidden"
          name="short-dest"
          value="Irina Bot оплата платных услуг."
        />
        <input type="hidden" name="label" ref={paylentLabelRef} />
        <input type="hidden" name="quickpay-form" value="shop" />
        <input type="hidden" name="targets" value="Оплата платных услуг" />
        <input
          type="hidden"
          name="paymentType"
          value="PC"
          ref={paymentTypeRef}
        />
      </Form>
    </Container>
  );
}

export default AutopayPage;
