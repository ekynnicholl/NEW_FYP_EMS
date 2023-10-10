import SideBarDesktop from "@/components/layouts/SideBarDesktop"
import SideBarMobile from "@/components/layouts/SideBarMobile"
import TopBar from "@/components/layouts/TopBar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-screen max-w-full flex flex-row justify-start bg-slate-100">
			<div className="sm:hidden">
                <SideBarMobile />
            </div>

            <div className="hidden sm:flex">
                <SideBarDesktop />
            </div>
			<div className="w-full">
                <div className="hidden sm:block">
                    <TopBar />
                </div>
				{children}
            </div>
		</div>
	);
}
