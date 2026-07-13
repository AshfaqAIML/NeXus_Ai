'use client';

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-muted/30 p-4">
      <div className="mb-6 text-lg font-bold">Nexus AI</div>
      <nav className="flex-1 space-y-1">
        <a className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Chats</a>
        <a className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Knowledge</a>
        <a className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Agents</a>
      </nav>
    </aside>
  );
}
