import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Plus, Minus, X } from 'lucide-react';

interface WaterIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAmount: number;
  onSave: (amount: number) => void;
}

const WaterIntakeDialog = ({ open, onOpenChange, currentAmount, onSave }: WaterIntakeDialogProps) => {
  const [amount, setAmount] = useState(currentAmount);

  const quickAmounts = [200, 300, 500, 800];

  const handleSave = () => {
    onSave(amount);
    onOpenChange(false);
  };

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(0, amount + delta);
    setAmount(newAmount);
  };

  const addQuickAmount = (quickAmount: number) => {
    setAmount(prev => prev + quickAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets size={20} className="text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">물 섭취량</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* 현재 물 섭취량 표시 */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{amount}ml</div>
            <div className="text-sm text-gray-600">오늘 마신 물의 양</div>
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
              >
                <Minus size={16} />
              </Button>
              <Input
                id="water-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center"
                min="0"
                max="5000"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustAmount(50)}
                className="p-2"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* 빠른 추가 버튼들 */}
          <div className="space-y-3">
            <Label>빠른 추가</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => addQuickAmount(quickAmount)}
                  className="py-3"
                >
                  + {quickAmount}ml
                </Button>
              ))}
            </div>
          </div>

          {/* 목표 달성 상태 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">일일 목표</span>
              <span className="text-sm text-blue-600">1000ml</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (amount / 1000) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {amount >= 1000 ? '목표 달성! 🎉' : `${1000 - amount}ml 더 마시면 목표 달성!`}
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="border-t pt-4">
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
            저장하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaterIntakeDialog;