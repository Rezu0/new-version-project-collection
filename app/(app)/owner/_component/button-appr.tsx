import { ManhwaEntry } from "@/lib/types";
import { Check } from "lucide-react";
import { toast } from "sonner";

export function ButtonApprOwner({
    uuid,
    userId,
    title,
    totalCh,
    lang,
    isNew,
    link,
    oktWm,
    insertedAt,
    approved,
    staff
}: ManhwaEntry) {
    
    const handlerApprManhwaProject = () => {
        toast("Project Manhwa", {
            description: title
        })
    }

    return (
        <button
            type="button"
            onClick={handlerApprManhwaProject}
            className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition hover:bg-muted"
        >
            <Check className="size-3.5" />
        </button>
    )
}