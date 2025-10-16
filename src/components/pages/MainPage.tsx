import { NavigationMenuDemo } from "../common/NavigationMenu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function MainPage() {

  return (
    <div>
        <div className="flex justify-center mt-1">
            <NavigationMenuDemo />
        </div>
        <div className="w-full flex justify-between items-center mt-2 px-4">
            <Link to="/">
                <Button>
                    로고
                </Button>
            </Link>
            <Link to="/login">
                <Button>
                    Login
                </Button>
            </Link>
        </div>
        <h1 className="flex justify-center text-center text-6xl font-bold leading-relaxed mt-40">
            협업과 AI의 모든 것<br />DevChat에서 쉽고 간편하게
        </h1>
    </div>
  );
}