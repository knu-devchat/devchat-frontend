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
                <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                    DevChat
                </Link>
                <Link to="/login">
                    <Button>
                        Login
                    </Button>
                </Link>
            </div>
            <h1 className="flex justify-center text-center text-6xl font-bold leading-relaxed mt-40">
                AI를 공유하는 협업<br />DevChat에서 쉽고 간편하게
            </h1>
        </div>
    );
}