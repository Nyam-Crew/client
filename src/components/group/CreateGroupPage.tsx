import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupForm {
  name: string;
  description: string;
  maxMembers: number;
  image?: File;
}

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateGroupForm>({
    name: '',
    description: '',
    maxMembers: 20
  });

  const handleInputChange = (field: keyof CreateGroupForm, value: string | number | File) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.description.trim()) {
      toast({
        title: "입력 오류",
        description: "그룹명과 소개를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (form.maxMembers < 2 || form.maxMembers > 50) {
      toast({
        title: "입력 오류",
        description: "최대 인원은 2명에서 50명 사이여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 실제 구현에서는 이미지 업로드 후 그룹 생성 API 호출
      console.log('Creating group:', form);
      
      // 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "그룹 생성 완료",
        description: "새로운 그룹이 성공적으로 생성되었습니다."
      });
      
      // 생성된 그룹으로 이동 (실제로는 API 응답의 그룹 ID 사용)
      navigate('/api/teams/1');
      
    } catch (error) {
      toast({
        title: "오류",
        description: "그룹 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/api/teams')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            그룹으로 돌아가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 그룹 만들기</CardTitle>
            <p className="text-sm text-muted-foreground">
              함께할 그룹을 만들어보세요. 그룹을 통해 더 재미있게 목표를 달성할 수 있습니다.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 그룹명 */}
              <div className="space-y-2">
                <Label htmlFor="group-name">
                  그룹명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="group-name"
                  type="text"
                  placeholder="예: 매일 운동하기"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={50}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {form.name.length}/50자
                </p>
              </div>

              {/* 그룹 소개 */}
              <div className="space-y-2">
                <Label htmlFor="group-description">
                  그룹 소개 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="group-description"
                  placeholder="그룹의 목표와 활동에 대해 설명해주세요"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {form.description.length}/500자
                </p>
              </div>

              {/* 최대 인원 */}
              <div className="space-y-2">
                <Label htmlFor="max-members">
                  최대 인원 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="max-members"
                  type="number"
                  min="2"
                  max="50"
                  value={form.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 20)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  2명에서 50명까지 설정 가능합니다
                </p>
              </div>

              {/* 그룹 이미지 */}
              <div className="space-y-2">
                <Label htmlFor="group-image">그룹 이미지 (선택사항)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="group-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    업로드
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG 파일만 업로드 가능합니다 (최대 5MB)
                </p>
              </div>

              {/* 제출 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/api/teams')}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#c2d595] hover:bg-[#a8c373] text-[#2d3d0f]"
                  disabled={loading}
                >
                  {loading ? '생성 중...' : '그룹 만들기'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateGroupPage;