import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <AuthShowcase />
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-blue-400 px-10 py-3 font-semibold no-underline transition hover:scale-105"
        onClick={
          sessionData ? () => void signOut() : () => void signIn("google")
        }
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
