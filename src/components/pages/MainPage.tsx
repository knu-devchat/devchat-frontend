import { NavigationMenuDemo } from "../common/NavigationMenu";
import { Button } from "../ui/button";

export default function MainPage() {
  return (
    <div>
        <div className="flex justify-center">
            <NavigationMenuDemo />
        </div>
        <div className="w-full flex justify-between items-center mt-2 px-4">
            <div>
                <Button>
                    로고
                </Button>
            </div>
            <div>
                <Button>
                    Login
                </Button>
            </div>
        </div>
        <h1 className="flex justify-center text-center text-6xl font-bold leading-relaxed
 mt-40">협업과 AI의 모든 것<br />DevChat에서 쉽고 간편하게</h1>
    </div>
  );
}