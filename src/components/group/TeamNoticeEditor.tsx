import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  type: 'FIXED' | 'NORMAL';
}

interface TeamNoticeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice?: Notice;
  noticeType: 'FIXED' | 'NORMAL';
  teamId: string;
  onSave: (notice: Notice) => void;
  onDelete?: () => void;
}

const TeamNoticeEditor = ({ 
  open, 
  onOpenChange, 
  notice, 
  noticeType, 
  teamId, 
  onSave, 
  onDelete 
}: TeamNoticeEditorProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(notice?.title || '');
  const [content, setContent] = useState(notice?.content || '');
  const [loading, setLoading] = useState(false);

  const isEditing = !!notice;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      const savedNotice: Notice = {
        id: notice?.id || `notice-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        author: notice?.author || '김운동', // 실제로는 현재 사용자 정보
        createdAt: notice?.createdAt || new Date().toISOString(),
        type: noticeType
      };

      onSave(savedNotice);
      
      toast({
        title: isEditing ? "공지사항 수정 완료" : "공지사항 작성 완료",
        description: `${noticeType === 'FIXED' ? '고정' : '일반'} 공지가 ${isEditing ? '수정' : '등록'}되었습니다.`
      });

      onOpenChange(false);
      setTitle('');
      setContent('');
    } catch (error) {
      toast({
        title: "오류",
        description: `공지사항 ${isEditing ? '수정' : '작성'} 중 오류가 발생했습니다.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notice || !onDelete) return;

    setLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDelete();
      
      toast({
        title: "공지사항 삭제 완료",
        description: `${noticeType === 'FIXED' ? '고정' : '일반'} 공지가 삭제되었습니다.`
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "오류",
        description: "공지사항 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setTitle('');
      setContent('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {noticeType === 'FIXED' ? '고정' : '일반'} 공지 {isEditing ? '수정' : '작성'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              rows={6}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                삭제
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (isEditing ? '수정 중...' : '작성 중...') : (isEditing ? '수정' : '작성')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNoticeEditor;