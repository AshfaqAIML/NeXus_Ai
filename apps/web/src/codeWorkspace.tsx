'use client';

import Editor, { OnMount } from '@monaco-editor/react';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatInterface } from '@/components/chat/chatInterface';
import { FileTree } from './FileTree';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CodeWorkspace({ chatId }: { chatId: string }) {
  const [activeFile, setActiveFile] = useState<string>('src/auth.ts');
  const [code, setCode] = useState<string>('// Nexus AI IDE\nexport const authenticate = async () => {\n  // ...\n};');

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Configure Monaco theme to match Nexus Dark Mode
    monaco.editor.defineTheme('nexus-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000', // Transparent to match Tailwind bg
      },
    });
    monaco.editor.setTheme('nexus-dark');
  };

  return (
    <PanelGroup direction="horizontal" className="h-full">
      {/* File Explorer */}
      <Panel defaultSize={15} minSize={10} maxSize={25} className="hidden md:block">
        <FileTree activeFile={activeFile} onSelect={setActiveFile} />
      </Panel>
      
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
      
      {/* Monaco Editor */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full">
          <div className="border-b px-4 py-2 flex items-center gap-2">
            <Tabs value={activeFile} onValueChange={setActiveFile}>
              <TabsList className="bg-transparent">
                <TabsTrigger value="src/auth.ts" className="text-xs">auth.ts</TabsTrigger>
                <TabsTrigger value="src/api.ts" className="text-xs">api.ts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              path={activeFile}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
      
      {/* AI Assistant Chat (Context aware of active file) */}
      <Panel defaultSize={35} minSize={20}>
        <div className="flex flex-col h-full border-l bg-muted/30">
           <div className="p-2 border-b text-xs text-muted-foreground">
             Context: <span className="font-code text-primary">{activeFile}</span>
           </div>
           <ChatInterface chatId={chatId} />
        </div>
      </Panel>
    </PanelGroup>
  );
}