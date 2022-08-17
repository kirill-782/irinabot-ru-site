import React, { ReactNode } from "react";

export const parseWC3TagsReact = (WC3String: string, ignoreTags?: string[]) => {
  let components: ReactNode[] = [];
  let colorData:
    | {
        color: string;
        components: ReactNode[];
      }
    | undefined;

  let key = 0;

  const pushColorTextIfExist = () => {
    if (colorData) {
      components.push(
        React.createElement(
          "span",
          {
            style: { color: `#${colorData.color}`, margin: 0, padding: 0 },
            key: ++key,
          },
          ...colorData.components
        )
      );
      colorData = undefined;
    }
  };

  const pushNode = (node: ReactNode) => {
    if (colorData) colorData.components.push(node);
    else components.push(node);
  };

  while (WC3String.length) {
    const nextTagPosition = findFirstTag(WC3String, ignoreTags);
    const plainText =
      nextTagPosition === -1
        ? WC3String
        : WC3String.substring(0, nextTagPosition);

    let tagLength = 0;

    if (plainText.length) {
      pushNode(plainText);

      WC3String = WC3String.substring(plainText.length);
      continue;
    }

    if (nextTagPosition === -1) {
      pushNode(plainText);
    } else {
      const tagType = WC3String.charAt(nextTagPosition + 1) || "";

      switch (tagType.toLocaleLowerCase()) {
        case "r":
          pushColorTextIfExist();
          tagLength = 2;

          break;

        case "n":
          pushNode(React.createElement("br", { key: ++key }));
          tagLength = 2;

          break;
        case "c":
          pushColorTextIfExist();

          const color = WC3String.substring(
            nextTagPosition + 4,
            nextTagPosition + 10
          );

          colorData = {
            color,
            components: [],
          };

          tagLength = 10;

          break;
      }
    }

    WC3String = WC3String.substring(nextTagPosition + tagLength);
  }

  pushColorTextIfExist();

  return components;
};

const findFirstTag = (WC3String: string, ignoreTags?: string[]) => {
  const colorStart =
    ignoreTags && ignoreTags.indexOf("|c") !== -1
      ? -1
      : WC3String.toLowerCase().indexOf("|c");
  const colorEnd =
    ignoreTags && ignoreTags.indexOf("|r") !== -1
      ? -1
      : WC3String.toLowerCase().indexOf("|r");
  const newLine =
    ignoreTags && ignoreTags.indexOf("|n") !== -1
      ? -1
      : WC3String.toLowerCase().indexOf("|n");

  if (colorStart === -1 && colorEnd === -1 && newLine === -1) return -1;

  let simpleTagPosition = colorEnd;

  if (
    simpleTagPosition === -1 ||
    (newLine < simpleTagPosition && newLine !== -1)
  )
    simpleTagPosition = newLine;

  if (
    colorStart === -1 ||
    (simpleTagPosition < colorStart && simpleTagPosition !== -1)
  )
    return simpleTagPosition;

  // Color start validation

  if (colorStart + 10 > WC3String.length) return simpleTagPosition;

  const colorTag = WC3String.substring(colorStart, colorStart + 10);

  const colorTagValidation = /\|[cC][0-9a-fA-F]{8}/;

  if (colorTag.match(colorTagValidation)) return colorStart;

  return simpleTagPosition;
};

export const escapeWC3Tags = (WC3String: string, ignoreTags?: string[]) => {
  while (true) {
    const tagPotition = findFirstTag(WC3String, ignoreTags);

    if (tagPotition === -1) break;

    const tag = WC3String.charAt(tagPotition + 1)?.toLocaleLowerCase();

    if (tag === "r" || tag === "n") {
      WC3String =
        WC3String.slice(0, tagPotition) + WC3String.slice(tagPotition + 2);
    } else if (tag === "c")
      WC3String =
        WC3String.slice(0, tagPotition) + WC3String.slice(tagPotition + 10);
  }

  return WC3String;
};
