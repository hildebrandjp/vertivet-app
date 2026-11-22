import { getCurrentUser } from "../_lib/data/dal";
import { UserMenu } from "./UserMenu";

/** Resolves the signed-in user on the server, renders the client menu. */
export async function TopbarUser() {
  const user = await getCurrentUser();
  return (
    <UserMenu
      name={`${user.firstName} ${user.lastName}`}
      avatarUrl={user.avatarUrl ?? null}
    />
  );
}
