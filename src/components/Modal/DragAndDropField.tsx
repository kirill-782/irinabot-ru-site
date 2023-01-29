import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";
import "./DragAndDropField.scss";

export const DragAndDropField = () => {
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return <div className="drag-and-drop-field">{t("modal.dragAndDropField")}</div>;
};
