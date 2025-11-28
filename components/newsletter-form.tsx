"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "blog-sidebar",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="you@example.com"
        className="bg-background"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        required
      />
      <Button 
        type="submit" 
        className="w-full font-semibold"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
      {status === "success" && message && (
        <p className="text-xs text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
      {status === "error" && message && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </form>
  );
}

