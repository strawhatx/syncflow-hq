import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";

const NavbarLayout = () => {
    return (
        <div className="min-h-screen bg-background flex w-full">
            <main className="flex-1">
                <Header />
                <Outlet />
            </main>
        </div>
    );
};

export default NavbarLayout; 