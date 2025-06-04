import { Outlet } from "react-router-dom";

const PlainLayout = () => {
    return (
        <div className="min-h-screen bg-background flex w-full">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default PlainLayout; 