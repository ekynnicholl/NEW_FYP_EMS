import RequestNTF from "@/components/view_ntf/request_ntf";

export default function Home() {
    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg h-screen">
                    <RequestNTF />
                </div>
            </div>
        </div>
    )
}