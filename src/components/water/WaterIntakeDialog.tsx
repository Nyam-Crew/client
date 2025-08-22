import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Plus, Minus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { defaultFetch } from '@/api/defaultFetch';

interface WaterIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 오늘까지 마신 양(현재 표시/기준) */
  currentAmount: number;
  /** YYYY-MM-DD (예: '2025-08-22') */
  selectedDate: Date;
  /** 저장 성공 후 상위 합계 갱신용 콜백 (이번에 추가한 양 or 총합, 팀 규칙에 맞게 사용) */
  onSave: (amount: number) => void;
}

const WaterIntakeDialog = ({
                             open,
                             onOpenChange,
                             currentAmount,
                             selectedDate,
                             onSave,
                           }: WaterIntakeDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(currentAmount);
  const [saving, setSaving] = useState(false);

  // 다이얼로그가 열릴 때마다 표시값 초기화
  useEffect(() => {
    if (open) setAmount(currentAmount);
  }, [open, currentAmount, selectedDate]);

  const quickAmounts = [200, 300, 500, 800];

  const handleSave = async () => {
    // 방어: 날짜가 없으면 오늘 날짜로 보정
    const dateForSend =
        selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
            ? selectedDate
            : new Date().toISOString().slice(0, 10);

    // 확인용 로그 (네트워크 탭 + 백엔드 로그와 맞춰보자)
    console.log('[WaterIntakeDialog] POST /api/meal/water body =', {
      date: dateForSend,
      amount,
    });

    try {
      setSaving(true);

      await defaultFetch('/api/meal/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ⚠️ defaultFetch가 axios 기반이면 JSON.stringify 없이도 될 수 있지만,
        // 타입 에러(TS2353) 회피 및 일관성을 위해 문자열로 보낸다.
        body: JSON.stringify({
          date: dateForSend,
          amount: Number.isFinite(amount) ? amount : 0,
        }),
      });

      onSave(amount);
      toast({ title: '저장 완료', description: '물 섭취가 기록되었습니다.' });
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to save water intake:', e);
      toast({
        title: '오류',
        description: '물 섭취 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(0, (prev || 0) + delta));
  };

  const addQuickAmount = (quickAmount: number) => {
    setAmount((prev) => Math.max(0, (prev || 0) + quickAmount));
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets size={20} className="text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">물 섭취량</DialogTitle>
                {/* 기준일 표시 */}
                <div className="text-xs text-muted-foreground mt-1">
                  기준일: {selectedDate || new Date().toISOString().slice(0, 10)}
                </div>
              </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="p-2"
                disabled={saving}
                aria-label="닫기"
            >
              <X size={20} />
            </Button>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* 현재 물 섭취량 표시 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{amount}ml</div>
              <div className="text-sm text-gray-600">이번에 기록할 양</div>
            </div>

            {/* 직접 입력 */}
            <div className="space-y-2">
              <Label htmlFor="water-amount">직접 입력</Label>
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustAmount(-50)}
                    className="p-2"
                    disabled={saving}
                    aria-label="50ml 감소"
                >
                  <Minus size={16} />
                </Button>
                <Input
                    id="water-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setAmount(Number.isFinite(v) ? Math.max(0, v) : 0);
                    }}
                    className="text-center"
                    min="0"
                    max="5000"
                    disabled={saving}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustAmount(50)}
                    className="p-2"
                    disabled={saving}
                    aria-label="50ml 증가"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* 빠른 추가 버튼들 */}
            <div className="space-y-3">
              <Label>빠른 추가</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((qa) => (
                    <Button
                        key={qa}
                        variant="outline"
                        onClick={() => addQuickAmount(qa)}
                        className="py-3"
                        disabled={saving}
                    >
                      + {qa}ml
                    </Button>
                ))}
              </div>
            </div>

            {/* 목표 달성 상태 (예시 1000ml) */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">일일 목표</span>
                <span className="text-sm text-blue-600">1000ml</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (amount / 1000) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {amount >= 1000 ? '목표 달성! 🎉' : `${1000 - amount}ml 더 마시면 목표 달성!`}
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="border-t pt-4">
            <Button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={saving || amount <= 0}
            >
              {saving ? '저장 중…' : '저장하기'}
            </Button>
            {amount <= 0 && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  0ml 이하는 저장할 수 없어요.
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default WaterIntakeDialog;