import { getNotifications } from "../_lib/data/dal";
import { NotificationsMenu } from "./NotificationsMenu";

/** Loads notifications on the server and hands plain data to the menu. */
export async function TopbarNotifications() {
  const notifications = await getNotifications();
  return <NotificationsMenu notifications={notifications} />;
}
