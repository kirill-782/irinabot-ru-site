import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Container, Form, Grid, Header, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext } from "./../../context/index";
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
    title: "page.autopay.place.vip",
    description: "",
    imageUrl: "/images/vip.png",
    price: 99,
  },
  {
    placeId: 5,
    title: "page.autopay.place.banList",
    description: "",
    imageUrl: "/images/ban_list.png",
    price: 74,
  },
  {
    placeId: 6,
    title: "page.autopay.place.adminList",
    description: "",
    imageUrl: "/images/admin_lina.png",
    price: 74,
  },
  {
    placeId: 4,
    title: "page.autopay.place.autohost",
    description: "",
    imageUrl: "/images/autohost.png",
    price: 249,
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

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  useEffect(() => {
    setConnectorId(authContext.auth.currentAuth?.connectorId.toString());
  }, [authContext.auth.currentAuth]);

  useEffect(() => {
    window.document.title = `${t("page.autopay.donute")} | ${SITE_TITLE}`;
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
          <Message.Header>{t("page.autopay.donuteNotSelected")}</Message.Header>
          <p>{t("page.autopay.needMark")}</p>
        </Message>
      );

    return (
      <Message color="red">
        <Message.Header>{t("page.autopay.incorrectedID")}</Message.Header>
        <p>{t("page.autopay.incorrectedIDEx")}</p>
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
      <MetaDescription description={t("page.autopay.payhere") + "."} />
      <Header>{t("page.autopay.donuteCalc")}</Header>
      <Form
        ref={formRef}
        method="POST"
        action="https://yoomoney.ru/quickpay/confirm.xml"
      >
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
                  label={t(place.title)}
                ></Form.Checkbox>
              );
            })}
          </Grid.Column>
          <Grid.Column width="three" floated="right">
            <Form.Input
              label={t("page.autopay.yourID")}
              value={connectroId}
              onChange={(e) => checkAndSetConnectorId(e.target.value)}
            ></Form.Input>
            <Form.Input
              label={t("page.autopay.duration")}
              value={duration}
              onChange={(e) => checkAndSetDuration(e.target.value)}
            ></Form.Input>
            <Form.Input
              name="sum"
              label={t("page.autopay.totalCost")}
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
                {t("page.autopay.paycard")}
              </Form.Button>
              <Form.Button
                onClick={() => pay("PC")}
                disabled={!isValid}
                basic
                color="green"
              >
                {t("page.autopay.pcYoo")}
              </Form.Button>
            </Form.Group>
            <Message info>
              <p>
                {t("page.autopay.infoA")} (
                <a href="https://vk.com/irina_bot">https://vk.com/irina_bot</a>)
                {t("page.autopay.infoA")} (
                <a href="https://discord.gg/cTfyEZT">
                  https://discord.gg/cTfyEZT
                </a>
                ) {t("page.autopay.infoC")}.
              </p>
            </Message>
          </Grid.Row>
        </Grid>
        <input type="hidden" name="receiver" value="41001757275906" />
        <input
          type="hidden"
          name="formcomment"
          value={t("page.autopay.paying") + "."}
        />
        <input
          type="hidden"
          name="short-dest"
          value={t("page.autopay.paying") + "."}
        />
        <input type="hidden" name="label" ref={paylentLabelRef} />
        <input type="hidden" name="quickpay-form" value="shop" />
        <input type="hidden" name="targets" value={t("page.autopay.payirka")} />
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
