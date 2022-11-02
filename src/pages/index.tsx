import { NextPageContext } from "next";

import { getSession } from "utils/auth";

function RedirectPage() {
  return;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session?.user.id) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login",
      },
    };
  }

  return {
    redirect: {
      permanent: false,
      destination: "/home",
    },
  };
}

export default RedirectPage;
