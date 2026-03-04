import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const role = requestUrl.searchParams.get("role");

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

        // If we have a role from the OAuth flow, update the profile
        if (session?.user && role) {
            await supabase
                .from("profiles")
                .update({ role })
                .eq("id", session.user.id);
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/dashboard", request.url));
}
