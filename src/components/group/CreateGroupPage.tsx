import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios'; // axios import는 남겨둡니다.

interface CreateGroupFormState {
  name: string;
  description: string;
  maxMembers: number | string; // number 또는 string 허용
  image?: File;
}

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // useState의 타입을 CreateGroupFormState로 변경
  const [form, setForm] = useState<CreateGroupFormState>({
    name: '',
    description: '',
    maxMembers: 10,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // maxMembers 필드일 경우, 숫자만 입력되도록 처리
    if (name === 'maxMembers') {
      if (value === '' || /^[0-9]*$/.test(value)) {
        setForm(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      // 그 외 필드는 그냥 업데이트
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // setForm을 사용하여 image 상태를 직접 업데이트합니다.
      setForm(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      // ... (에러 처리)
      return;
    }

    // 최종적으로 숫자로 변환
    const maxMembersNumber = Number(form.maxMembers);

    // 숫자형으로 한 번만 유효성 검사
    if (maxMembersNumber < 2 || maxMembersNumber > 10) {
      toast({
        title: "입력 오류",
        description: "최대 인원은 2명에서 10명 사이여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    
    const dto = {
      teamTitle: form.name,
      teamDescription: form.description,
      teamMaxMembers: maxMembersNumber,
    };

    formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (form.image) {
      formData.append('imageFile', form.image);
    }

    try {
      const response = await axios.post('/api/teams', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdTeam = response.data;
      
      toast({
        title: "그룹 생성 완료",
        description: "새로운 그룹이 성공적으로 생성되었습니다."
      });
      
      navigate(`/teams/${createdTeam.teamId}`);
      
    } catch (error) {
      console.error("Group creation failed:", error);
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
            onClick={() => navigate('/teams')}
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
                  name="name"
                  onChange={handleInputChange}
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
                  name="description" // name 속성 추가
                  onChange={handleInputChange}
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
                  max="10"
                  value={String(form.maxMembers)}
                  name="maxMembers" // name 속성 추가
                  onChange={handleInputChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  2명에서 10명까지 설정 가능합니다
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
                  onClick={() => navigate('/teams')}
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