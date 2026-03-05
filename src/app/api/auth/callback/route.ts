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
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        console.log("Auth callback session check:", {
            hasSession: !!session,
            userId: session?.user?.id,
            error: sessionError?.message
        });

        if (session?.user) {
            // 1. Assicuriamoci che l'utente esista in public.users
            // Se non c'è il ruolo, default disabile
            const uRole = (role || 'disabile');
            await supabase.from("users").upsert({
                id: session.user.id,
                email: session.user.email,
                role: uRole
            }, { onConflict: 'id' });

            // 2. Assicuriamoci che il profilo esista in public.profiles
            // Usiamo role se presente, altrimenti disabile
            await supabase.from("profiles").upsert({
                user_id: session.user.id,
                role: uRole,
                id: session.user.id // Usiamo lo stesso ID per coerenza
            }, { onConflict: 'id' });
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/dashboard", request.url));
}
