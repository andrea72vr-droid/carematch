import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    // Temporaneamente disabilitato per debug timeout
    /*
    const supabase = createMiddlewareClient({ req, res });
    try {
        await supabase.auth.getSession();
    } catch (error) {
        console.error("Middleware session error:", error);
    }
    */
    return res;
}

// Matcher semplificato al massimo per evitare errori di parsing su Vercel
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
