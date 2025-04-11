import React from 'react';
import { Modal, Button } from 'antd';
import Editor, { EditorProps } from '@monaco-editor/react';
import styled from 'styled-components';

const ModalContainer = styled.div`
  background: #0a1321;
  border-radius: 8px;
  overflow: hidden;
`;

const EditorContainer = styled.div`
  display: flex;
  height: 600px;
  background: #0a1321;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1f2937;

  &:last-child {
    border-right: none;
  }
`;

const EditorHeader = styled.div`
  padding: 16px 20px;
  background: #0e1721;
  color: #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #1f2937;
`;

const EditorContent = styled.div`
  flex: 1;
  background: #0e1721;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  background: #0e1721;
  border-top: 1px solid #1f2937;
`;

const ActionButton = styled(Button) <{ $primary?: boolean }>`
  height: 40px;
  padding: 0 24px;
  border-radius:0px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.$primary ? `
    background: #ffd60a;
    border: none;
    color: #000000;
    &:hover {
      background: #e6c009;
      color: #000000;
    }
  ` : `
    background: #1c2936;
    border: 1px solid #29334a;
    color: #e5e7eb;
    &:hover {
      background: #29334a;
      border-color: #374151;
      color: #ffffff;
    }
  `}
`;

interface SolutionCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCode: string;
    solutionCode: string;
    language: string;
    onReplaceSolution: (code: string) => void;
}

const SolutionCompareModal: React.FC<SolutionCompareModalProps> = ({
    isOpen,
    onClose,
    currentCode,
    solutionCode,
    language,
    onReplaceSolution
}) => {
    const handleReplaceSolution = () => {
        onReplaceSolution(solutionCode);
        onClose();
    };

    const editorOptions: EditorProps['options'] = {
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 15,
        fontFamily: "'Jetbrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 10, bottom: 10 },
        lineHeight: 1.5,
        folding: true,
        scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
        },
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            width={1200}
            footer={null}
            closable={false}
            style={{ top: 20 }}
            bodyStyle={{
                padding: 0,
                background: '#0a1321',
            }}
            maskStyle={{
                background: 'rgba(0, 0, 0, 0.8)',
            }}
        >
            <ModalContainer>
                <EditorContainer>
                    <EditorWrapper>
                        <EditorHeader>My code</EditorHeader>
                        <EditorContent>
                            <Editor
                                height="100%"
                                language={language}
                                value={currentCode}
                                theme="mytheme"
                                options={editorOptions}
                            />
                        </EditorContent>
                    </EditorWrapper>
                    <EditorWrapper>
                        <EditorHeader>Example solution</EditorHeader>
                        <EditorContent>
                            <Editor
                                height="100%"
                                language={language}
                                value={solutionCode}
                                theme="mytheme"
                                options={editorOptions}
                            />
                        </EditorContent>
                    </EditorWrapper>
                </EditorContainer>
                <ModalFooter>
                    <ActionButton type='none' onClick={onClose}>
                        Keep my code
                    </ActionButton>
                    <ActionButton type='none' $primary onClick={handleReplaceSolution}>
                        Replace with solution
                    </ActionButton>
                </ModalFooter>
            </ModalContainer>
        </Modal>
    );
};

export default SolutionCompareModal; 