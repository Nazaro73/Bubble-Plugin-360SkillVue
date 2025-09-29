import { UAParser } from "ua-parser-js";

export default function useIsIos() {
  const { os } = UAParser(navigator.userAgent);
  const userAgent = navigator.userAgent;

  // Détection plus robuste pour iOS/Safari
  const isIos = os.name === "iOS" ||
               /iPad|iPhone|iPod/.test(userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro

  console.log('Device detection:', {
    osName: os.name,
    userAgent: userAgent.substring(0, 100),
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    isIos
  });

  return isIos;
}
