import { Alert, Platform } from "react-native";
import { dialog, DialogButton, DialogType, detectDialogType } from "../components/CustomDialog";

export function showCustomAlert(
  title: string,
  message?: string,
  buttons?: DialogButton[],
  type?: DialogType
) {
  dialog.alert(title, message, buttons, type);
}

/**
 * Patch Alert.alert on Web so standard Alert calls display
 * the sleek Relicus in-app dialog instead of browser window.alert.
 */
if (Platform.OS === "web") {
  const originalAlert = Alert.alert;
  Alert.alert = (
    title: string,
    message?: string,
    buttons?: any[],
    _options?: any
  ) => {
    try {
      const dialogButtons: DialogButton[] =
        buttons && buttons.length > 0
          ? buttons.map((b) => ({
              text: b.text || "OK",
              onPress: b.onPress,
              style:
                b.style === "cancel"
                  ? "cancel"
                  : b.style === "destructive"
                  ? "danger"
                  : "primary",
            }))
          : [{ text: "OK", style: "primary" }];

      dialog.alert(title, message, dialogButtons);
    } catch {
      if (typeof originalAlert === "function") {
        originalAlert(title, message, buttons);
      }
    }
  };
}
