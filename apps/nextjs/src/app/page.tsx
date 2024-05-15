import { redirect } from "next/navigation";
import { genericMetadata } from "./utils/url";


export function generateMetadata() {
  return genericMetadata();
}

const HomePage = () => {
  redirect("/home");
};

export default HomePage;
