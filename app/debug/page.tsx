"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<string>("");
  const [postId, setPostId] = useState("getting-started-with-nextjs");
  const [comment, setComment] = useState("This is a test comment");

  const testComment = async () => {
    try {
      setResult("Testing...");

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const testReaction = async () => {
    try {
      setResult("Testing reaction...");

      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like" }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8 space-y-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-400">🔧 Debug Page</h1>

      <div className="bg-blue-800 p-4 rounded border border-blue-600">
        <p className="text-white">
          Auth Status: <span className="font-bold text-green-400">{status}</span>
        </p>
        <p className="text-white">
          User:{" "}
          <span className="font-bold text-green-400">
            {session?.user?.name || "Not logged in"}
          </span>
        </p>
        <p className="text-white">
          User ID:{" "}
          <span className="font-bold text-green-400">{session?.user?.id || "None"}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-yellow-300 font-semibold">Post ID/Slug:</label>
        <input
          type="text"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          className="border-2 border-yellow-500 p-3 w-full rounded text-black bg-yellow-100 font-mono"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-yellow-300 font-semibold">Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border-2 border-yellow-500 p-3 w-full rounded text-black bg-yellow-100 font-mono"
          rows={3}
        />
      </div>

      <div className="space-x-4">
        <button
          onClick={testComment}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg disabled:bg-gray-600"
          disabled={status !== "authenticated"}
        >
          🗨️ Test Comment
        </button>

        <button
          onClick={testReaction}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg disabled:bg-gray-600"
          disabled={status !== "authenticated"}
        >
          👍 Test Reaction
        </button>
      </div>

      <div className="bg-black border-2 border-green-500 p-6 rounded-lg">
        <h3 className="text-green-400 font-bold mb-4 text-xl">📊 API Response:</h3>
        <pre className="whitespace-pre-wrap text-green-300 bg-gray-800 p-4 rounded border border-green-600 text-sm font-mono overflow-auto">
          {result || "No results yet..."}
        </pre>
      </div>
    </div>
  );
}
