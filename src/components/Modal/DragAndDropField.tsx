import React, { useContext } from "react";
import { AppRuntimeSettingsContext } from "../../context";
import "./DragAndDropField.scss";

export const DragAndDropField = () => {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <div className="drag-and-drop-field">{lang.dragAndDropField}</div>
  );
};
