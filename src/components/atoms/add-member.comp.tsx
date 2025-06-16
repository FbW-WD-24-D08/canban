import { useState } from "react";

export function AddMember() {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    console.log(email, "Member added");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="Add member by email"
        className="flex-1 bg-zinc-800 text-zinc-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
    </div>
  );
}
