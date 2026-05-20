import { registerChangeUsernameButtonHandler } from "@Rmigrations/logic/001/changeUsernameButton.js";
import { registerSkipUsernameButtonHandler } from "@Rmigrations/logic/001/skipUsernameButton.js";
import { registerSubmitUsernameModalHandler } from "@Rmigrations/logic/001/submitUsernameModal.js";

export const registerUsernameMigrationHandlers = (): void => {
  registerSkipUsernameButtonHandler();
  registerChangeUsernameButtonHandler();
  registerSubmitUsernameModalHandler();
};
