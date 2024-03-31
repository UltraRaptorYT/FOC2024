import useAuth from "@/hooks/useAuth";

function Home() {
  const { auth } = useAuth();
  console.log(auth);
  return <div>HOME</div>;
}
export default Home;
