export const parseWC3Tags = (WC3String: string) => {
  WC3String = WC3String.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  WC3String = WC3String.replace(new RegExp("\\|n", "gi"), "<br>");
  WC3String = WC3String.replace(new RegExp("\n", "gi"), "<br>");

  let colourReplaces = 0;

  WC3String = WC3String.replace(
    new RegExp("\\|c([a-f0-9]{2})([a-f0-9]{6})", "gi"),
    function (match, p1, p2) {
      colourReplaces++;
      return '<span style="color:#' + p2 + '">';
    }
  );

  let stopColourReplaces = 0;

  WC3String = WC3String.replace(new RegExp("\\|r", "gi"), function () {
    stopColourReplaces++;
    return "</span>";
  });

  if (colourReplaces >= stopColourReplaces)
    WC3String =
      WC3String + "</span>".repeat(colourReplaces - stopColourReplaces);

  return WC3String;
};
