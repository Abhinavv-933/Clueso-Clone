
import { Hero } from "@/components/dashboard/Hero";
import { CreateVideoSection } from "@/components/dashboard/CreateVideoSection";
import { AiToolsSection } from "@/components/dashboard/AiToolsSection";
import { RecentProjectsSection } from "@/components/dashboard/RecentProjectsSection";
import { GettingStartedSection } from "@/components/dashboard/GettingStartedSection";

export default function HomePage() {
    return (
        <div className="text-white space-y-8 max-w-6xl mx-auto pb-12">
            <Hero />

            <CreateVideoSection />

            <AiToolsSection />

            <RecentProjectsSection />

            <GettingStartedSection />

            {/* Future Sections Placeholders */}
        </div>
    );
}
