import { useState } from "react";
import { usersApi } from "@/api/users.api";
import { boardsApi } from "@/api/boards.api";

export function AddMember({
  boardId,
  onMemberAdded,
}: {
  boardId?: string;
  onMemberAdded?: () => void;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    if (!boardId) return;

    const user = await usersApi.gesUserIdByEmail(email);
    if (!user) return;

    await boardsApi.addMember(boardId, user.id);
    setEmail("");
    onMemberAdded?.();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="Add member by email"
        className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await handleSubmit();
          }
        }}
      />
    </div>
  );
}
