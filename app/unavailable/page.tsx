import Typography from "@/components/typography";

export default function RegionUnavailablePage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-6 py-12">
            <div className="w-full max-w-lg rounded-[16px] border border-[#0B0E0514] bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <Typography type="text24" fontWeight={700} className="!text-[#0B0E05]">
                    LiquidsAIO Admin is only available in the United States
                </Typography>
                <Typography type="text16" fontWeight={500} className="mt-3 !text-[#0B0E05A3]">
                    Admin access is limited to supported U.S. regions.
                </Typography>
            </div>
        </main>
    );
}
