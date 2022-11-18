import { trpc } from "utils/trpc";

export function useMeQuery() {
  const meQuery = trpc.user.me.useQuery(undefined, {
    retry(failureCount) {
      return failureCount > 3;
    },
  });

  return meQuery;
}

export default useMeQuery;
