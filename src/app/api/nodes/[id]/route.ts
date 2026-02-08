import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/database.types";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const supabase = await createClient<Database>();
        const body = await request.json();
        const { status } = body;

        if (!["pending", "in_progress", "completed"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { error } = await supabase
            .from("roadmap_nodes")
            .update({ status })
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id, status });
    } catch (error) {
        console.error("Update node error:", error);
        return NextResponse.json(
            { error: "Failed to update node" },
            { status: 500 }
        );
    }
}
