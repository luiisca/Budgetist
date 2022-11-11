import { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "server/common/get-server-auth-session";

function RedirectPage() {
  return;
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

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
