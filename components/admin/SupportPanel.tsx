"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/engine/dates";

type Item = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  submitted_at: string;
};

type ChatMessage = { role: string; content: string; at: string };
type Conversation = {
  id: string;
  session_id: string;
  messages: ChatMessage[];
  started_at: string;
  updated_at: string;
};

type Followup = {
  id: string;
  email: string;
  stage: string;
  response: string;
  responded_at: string;
};

type ConvoMessage = { from: string; content: string; at: string };
type EmailConversation = {
  id: string;
  email: string;
  context: string;
  messages: ConvoMessage[];
  status: string;
  updated_at: string;
};

export function SupportPanel() {
  const [tab, setTab] = useState<"messages" | "sos" | "chatbot" | "followups" | "conversations">("messages");
  const [messages, setMessages] = useState<Item[]>([]);
  const [reports, setReports] = useState<Item[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [emailConversations, setEmailConversations] = useState<EmailConversation[]>([]);
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  const [expandedEmailConvo, setExpandedEmailConvo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [msgRes, sosRes, convoRes, followupRes, emailConvoRes] = await Promise.all([
        fetch("/api/admin/contact-messages"),
        fetch("/api/admin/sos-reports"),
        fetch("/api/admin/chatbot-conversations"),
        fetch("/api/admin/rejection-followups"),
        fetch("/api/admin/email-conversations"),
      ]);
      const msgData = msgRes.ok ? await msgRes.json() : { messages: [] };
      const sosData = sosRes.ok ? await sosRes.json() : { reports: [] };
      const convoData = convoRes.ok ? await convoRes.json() : { conversations: [] };
      const followupData = followupRes.ok ? await followupRes.json() : { followups: [] };
      const emailConvoData = emailConvoRes.ok ? await emailConvoRes.json() : { conversations: [] };
      setMessages(msgData.messages || []);
      setReports(sosData.reports || []);
      setConversations(convoData.conversations || []);
      setFollowups(followupData.followups || []);
      setEmailConversations(emailConvoData.conversations || []);
    } catch {
      setError("Failed to load support data.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function markResolved(collection: "contact_messages" | "sos_reports", id: string) {
    setResolvingId(id);
    try {
      const res = await fetch("/api/admin/mark-resolved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, id }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch {
      setError("Failed to update status.");
    }
    setResolvingId(null);
  }

  async function sendReply(conversationId: string) {
    const message = replyDrafts[conversationId]?.trim();
    if (!message) return;
    setSendingReplyId(conversationId);
    try {
      const res = await fetch("/api/admin/email-conversations/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setError(`Server error (status ${res.status}).`);
        setSendingReplyId(null);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to send reply.");
        setSendingReplyId(null);
        return;
      }
      setReplyDrafts((prev) => ({ ...prev, [conversationId]: "" }));
      await loadData();
    } catch {
      setError("Network error sending reply.");
    }
    setSendingReplyId(null);
  }

  const activeMessages = messages.filter((m) => m.status !== "resolved");
  const activeReports = reports.filter((r) => r.status !== "resolved");
  const yesFollowups = followups.filter((f) => f.response === "yes");
  const newConversations = emailConversations.filter((c) => c.status === "new");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Support</h2>
        </div>
      </div>

      <div className="flex gap-6 border-b border-brand-line mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => setTab("messages")}
          className={
            "pb-3 text-sm font-semibold border-b-2 transition-colors " +
            (tab === "messages" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate")
          }
        >
          Messages {activeMessages.length > 0 && "(" + activeMessages.length + ")"}
        </button>
        <button
          type="button"
          onClick={() => setTab("sos")}
          className={
            "pb-3 text-sm font-semibold border-b-2 transition-colors " +
            (tab === "sos" ? "border-red-500 text-red-600" : "border-transparent text-brand-slate")
          }
        >
          SOS Reports {activeReports.length > 0 && "(" + activeReports.length + ")"}
        </button>
        <button
          type="button"
          onClick={() => setTab("chatbot")}
          className={
            "pb-3 text-sm font-semibold border-b-2 transition-colors " +
            (tab === "chatbot" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate")
          }
        >
          Chatbot {conversations.length > 0 && "(" + conversations.length + ")"}
        </button>
        <button
          type="button"
          onClick={() => setTab("followups")}
          className={
            "pb-3 text-sm font-semibold border-b-2 transition-colors " +
            (tab === "followups" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate")
          }
        >
          Follow-Ups {yesFollowups.length > 0 && "(" + yesFollowups.length + ")"}
        </button>
        <button
          type="button"
          onClick={() => setTab("conversations")}
          className={
            "pb-3 text-sm font-semibold border-b-2 transition-colors " +
            (tab === "conversations" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate")
          }
        >
          Conversations {newConversations.length > 0 && "(" + newConversations.length + ")"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : tab === "messages" ? (
        <ItemList items={messages} collection="contact_messages" onResolve={markResolved} resolvingId={resolvingId} accent="brand-green" />
      ) : tab === "sos" ? (
        <ItemList items={reports} collection="sos_reports" onResolve={markResolved} resolvingId={resolvingId} accent="red-500" />
      ) : tab === "chatbot" ? (
        <ConversationList conversations={conversations} expandedId={expandedConvo} onToggle={setExpandedConvo} />
      ) : tab === "followups" ? (
        <FollowupList followups={followups} />
      ) : (
        <EmailConversationList
          conversations={emailConversations}
          expandedId={expandedEmailConvo}
          onToggle={setExpandedEmailConvo}
          replyDrafts={replyDrafts}
          onDraftChange={(id, val) => setReplyDrafts((prev) => ({ ...prev, [id]: val }))}
          onSendReply={sendReply}
          sendingReplyId={sendingReplyId}
        />
      )}
    </div>
  );
}

function ItemList({
  items,
  collection,
  onResolve,
  resolvingId,
  accent,
}: {
  items: Item[];
  collection: "contact_messages" | "sos_reports";
  onResolve: (collection: "contact_messages" | "sos_reports", id: string) => void;
  resolvingId: string | null;
  accent: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-brand-slate">No items yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            "bg-white rounded-xl border p-5 " +
            (item.status === "resolved" ? "border-brand-line opacity-60" : "border-" + accent + "/30")
          }
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-brand-charcoal">{item.name}</p>
              <p className="text-xs text-brand-slate">{item.email}</p>
            </div>
            <div className="text-right">
              <span
                className={
                  "inline-block rounded-pill px-3 py-1 text-xs font-medium " +
                  (item.status === "resolved" ? "bg-gray-100 text-brand-slate" : "bg-amber-50 text-amber-700")
                }
              >
                {item.status === "resolved" ? "Resolved" : "New"}
              </span>
              <p className="text-xs text-brand-slate mt-1">{formatShortDate(item.submitted_at)}</p>
            </div>
          </div>
          <p className="text-sm text-brand-slate whitespace-pre-wrap mb-3">{item.message}</p>
          {item.status !== "resolved" && (
            <Button
              variant="secondary"
              className="!px-4 !py-2 text-xs"
              disabled={resolvingId === item.id}
              onClick={() => onResolve(collection, item.id)}
            >
              {resolvingId === item.id ? "Marking..." : "Mark Resolved"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function ConversationList({
  conversations,
  expandedId,
  onToggle,
}: {
  conversations: Conversation[];
  expandedId: string | null;
  onToggle: (id: string | null) => void;
}) {
  if (conversations.length === 0) {
    return <p className="text-sm text-brand-slate">No chatbot conversations yet.</p>;
  }

  return (
    <div className="space-y-3">
      {conversations.map((convo) => {
        const isExpanded = expandedId === convo.id;
        const msgCount = convo.messages?.length ?? 0;
        return (
          <div key={convo.id} className="bg-white rounded-xl border border-brand-line overflow-hidden">
            <button
              type="button"
              onClick={() => onToggle(isExpanded ? null : convo.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-brand-charcoal">Session {convo.session_id.slice(0, 8)}</p>
                <p className="text-xs text-brand-slate">{msgCount} messages - {formatShortDate(convo.updated_at)}</p>
              </div>
              <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 space-y-2 border-t border-brand-line pt-4">
                {(convo.messages || []).map((m, i) => (
                  <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm " +
                        (m.role === "user" ? "bg-brand-green text-white" : "bg-gray-100 text-brand-charcoal")
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FollowupList({ followups }: { followups: Followup[] }) {
  if (followups.length === 0) {
    return <p className="text-sm text-brand-slate">No responses yet.</p>;
  }

  return (
    <div>
      <p className="text-sm text-brand-slate mb-4">
        People who responded to a rejection email, indicating whether they want future updates.
      </p>
      <div className="overflow-x-auto rounded-lg border border-brand-line">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Response</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((f) => (
              <tr key={f.id} className="border-t border-brand-line">
                <td className="px-4 py-3 text-brand-charcoal font-medium">{f.email}</td>
                <td className="px-4 py-3 text-brand-slate capitalize">{f.stage}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-block rounded-pill px-3 py-1 text-xs font-medium " +
                      (f.response === "yes" ? "bg-brand-green/10 text-brand-green-dark" : "bg-gray-100 text-brand-slate")
                    }
                  >
                    {f.response === "yes" ? "Wants updates" : "No thanks"}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-slate">{formatShortDate(f.responded_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailConversationList({
  conversations,
  expandedId,
  onToggle,
  replyDrafts,
  onDraftChange,
  onSendReply,
  sendingReplyId,
}: {
  conversations: EmailConversation[];
  expandedId: string | null;
  onToggle: (id: string | null) => void;
  replyDrafts: Record<string, string>;
  onDraftChange: (id: string, value: string) => void;
  onSendReply: (id: string) => void;
  sendingReplyId: string | null;
}) {
  if (conversations.length === 0) {
    return <p className="text-sm text-brand-slate">No conversations yet.</p>;
  }

  return (
    <div className="space-y-3">
      {conversations.map((convo) => {
        const isExpanded = expandedId === convo.id;
        const msgCount = convo.messages?.length ?? 0;
        return (
          <div key={convo.id} className="bg-white rounded-xl border border-brand-line overflow-hidden">
            <button
              type="button"
              onClick={() => onToggle(isExpanded ? null : convo.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-brand-charcoal">{convo.email}</p>
                <p className="text-xs text-brand-slate">
                  {msgCount} messages - {convo.context} - {formatShortDate(convo.updated_at)}
                </p>
              </div>
              <span
                className={
                  "inline-block rounded-pill px-3 py-1 text-xs font-medium mr-3 " +
                  (convo.status === "new" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-brand-slate")
                }
              >
                {convo.status === "new" ? "New" : "Replied"}
              </span>
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-brand-line pt-4">
                <div className="space-y-2 mb-4">
                  {(convo.messages || []).map((m, i) => (
                    <div key={i} className={"flex " + (m.from === "user" ? "justify-start" : "justify-end")}>
                      <div
                        className={
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm " +
                          (m.from === "user" ? "bg-gray-100 text-brand-charcoal" : "bg-brand-green text-white")
                        }
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Type your reply..."
                  value={replyDrafts[convo.id] ?? ""}
                  onChange={(e) => onDraftChange(convo.id, e.target.value)}
                  className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                />
                <Button
                  variant="primary"
                  className="!px-4 !py-2 text-xs"
                  disabled={sendingReplyId === convo.id || !replyDrafts[convo.id]?.trim()}
                  onClick={() => onSendReply(convo.id)}
                >
                  {sendingReplyId === convo.id ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
