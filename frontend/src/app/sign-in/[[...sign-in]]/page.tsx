
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f16]">
            <SignIn
                forceRedirectUrl="/dashboard"
                appearance={{
                    elements: {
                        rootBox: "font-sans",
                        card: "bg-[#1c1c2a] border border-white/10",
                        headerTitle: "text-white",
                        headerSubtitle: "text-muted-foreground",
                        formButtonPrimary: "bg-clueso-pink hover:bg-clueso-pink/90 text-white",
                        formFieldLabel: "text-white",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        footerActionLink: "text-clueso-pink hover:text-clueso-pink/90"
                    }
                }}
            />
        </div>
    );
}
