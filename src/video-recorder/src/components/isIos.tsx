import { UAParser } from "ua-parser-js";

export default function useIsIos() {
  const { os } = UAParser(navigator.userAgent);

  const isIos = os.name === "iOS";

  console.log(os, navigator.userAgent);

  return isIos;
}
