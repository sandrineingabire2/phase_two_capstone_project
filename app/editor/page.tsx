import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function EditorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?from=editor");
  }

  return <EditorShell />;
}
