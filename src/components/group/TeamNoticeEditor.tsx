import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createNotice, updateNotice, Notice } from '@/api/teamNoticeApi';

interface TeamNoticeEditorProps {
  teamId: number;
  editingNotice: Notice | null;
  noticeTypeToCreate: 'NORMAL' | 'FIXED' | null; // 생성할 공지 타입을 받음
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TeamNoticeEditor = ({
  teamId,
  editingNotice,
  noticeTypeToCreate,
  isOpen,
  onClose,
  onSave,
}: TeamNoticeEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = editingNotice !== null;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setTitle(editingNotice.title);
        setContent(editingNotice.content);
      } else {
        setTitle('');
        setContent('');
      }
    }
  }, [isOpen, editingNotice, isEditing]);

  const handleSave = async () => {
    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 생성 모드일 때 noticeTypeToCreate가 제공되지 않으면 에러 처리
    if (!isEditing && !noticeTypeToCreate) {
        alert('생성할 공지 타입을 지정해야 합니다.');
        return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateNotice(teamId, editingNotice.id, { title, content });
      } else {
        await createNotice(teamId, { title, content, teamNoticeType: noticeTypeToCreate! });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('공지 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? '공지 수정' : '공지 작성'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
          />
          <Textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            disabled={isSaving}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNoticeEditor;