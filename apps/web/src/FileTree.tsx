'use client';

interface FileTreeProps {
  activeFile: string;
  onSelect: (file: string) => void;
}

const files = [
  { name: 'src', type: 'folder' as const, children: [
    { name: 'auth.ts', type: 'file' as const },
    { name: 'api.ts', type: 'file' as const },
  ]},
];

export function FileTree({ activeFile, onSelect }: FileTreeProps) {
  return (
    <div className="h-full border-r bg-muted/30 p-2 text-xs">
      <div className="mb-2 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
        Explorer
      </div>
      {files.map((item) => (
        <div key={item.name}>
          <div className="py-0.5 text-muted-foreground">{item.name}/</div>
          {item.children?.map((child) => (
            <button
              key={child.name}
              onClick={() => onSelect(`${item.name}/${child.name}`)}
              className={`block w-full text-left py-0.5 pl-4 rounded ${
                activeFile === `${item.name}/${child.name}`
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
