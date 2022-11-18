import { DefaultSession } from "next-auth";

declare module "next-auth" {
  type DefaultSessionUser = NonNullable<DefaultSession["user"]>;
  type BudgetistSessionUser = DefaultSessionUser & {
    id: number;
    username: string;
  };
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: BudgetistSessionUser;
  }
}
