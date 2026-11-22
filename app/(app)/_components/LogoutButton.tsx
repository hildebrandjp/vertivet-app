import { LogOutIcon } from "@/app/shared/ui/icons";
import { logout } from "../_lib/actions";
import styles from "./LogoutButton.module.css";

/** Sign-out as a real form: works before hydration and without JS. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className={styles.button}>
        <LogOutIcon className={styles.icon} />
        Log Out
      </button>
    </form>
  );
}
