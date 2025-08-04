import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const memberInfoSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  gender: z.enum(["female", "male", "none"], {
    required_error: "성별을 선택해주세요",
  }),
  weight: z.string().min(1, "몸무게를 입력해주세요").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "올바른 몸무게를 입력해주세요",
  }),
  height: z.string().min(1, "키를 입력해주세요").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "올바른 키를 입력해주세요",
  }),
  age: z.string().min(1, "나이를 입력해주세요").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "올바른 나이를 입력해주세요",
  }),
});

type MemberInfoForm = z.infer<typeof memberInfoSchema>;

const MemberInfo = () => {
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<MemberInfoForm>({
    resolver: zodResolver(memberInfoSchema),
    defaultValues: {
      nickname: "",
      gender: undefined,
      weight: "",
      height: "",
      age: "",
    },
  });

  const watchedNickname = form.watch("nickname");

  // 닉네임이 변경되면 중복확인 상태를 초기화
  const handleNicknameChange = (value: string) => {
    form.setValue("nickname", value);
    setIsNicknameChecked(false);
  };

  const handleNicknameCheck = async () => {
    const nickname = form.getValues("nickname");
    if (!nickname) {
      toast({
        variant: "destructive",
        title: "닉네임을 입력해주세요",
      });
      return;
    }

    setNicknameCheckLoading(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setIsNicknameChecked(true);
      setNicknameCheckLoading(false);
      toast({
        title: "사용 가능한 닉네임입니다",
        className: "bg-success text-success-foreground",
      });
    }, 1000);
  };

  const onSubmit = async (data: MemberInfoForm) => {
    if (!isNicknameChecked) {
      toast({
        variant: "destructive",
        title: "닉네임 중복확인을 완료해주세요",
      });
      return;
    }

    // 실제 회원정보 저장 로직
    console.log("Member info:", data);
    
    toast({
      title: "회원정보가 저장되었습니다",
      className: "bg-success text-success-foreground",
    });
    
    // 메인 페이지로 이동
    navigate("/");
  };

  const isFormValid = form.formState.isValid && isNicknameChecked;

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 숫자, 백스페이스, 딜리트, 탭, 엔터만 허용
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-card">
        <CardContent className="p-8 lg:p-12">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-foreground">회원정보 입력</h1>
            <p className="text-muted-foreground">건강한 식습관을 위한 기본 정보를 입력해주세요</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 닉네임 */}
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">닉네임</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleNicknameChange(e.target.value)}
                          placeholder="사용할 닉네임을 입력해주세요"
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleNicknameCheck}
                        disabled={!watchedNickname || nicknameCheckLoading}
                        className="px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {nicknameCheckLoading ? "확인중..." : "중복확인"}
                      </Button>
                    </div>
                    {isNicknameChecked && (
                      <p className="text-sm text-success font-medium">✓ 사용 가능한 닉네임입니다</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 성별 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">성별</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-8"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">여</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">남</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="none" />
                          <Label htmlFor="none">없음</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 몸무게 */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">몸무게 (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleNumberInput}
                        placeholder="몸무게를 입력해주세요"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 키 */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">키 (cm)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleNumberInput}
                        placeholder="키를 입력해주세요"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 나이 */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">나이</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleNumberInput}
                        placeholder="나이를 입력해주세요"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 완료 버튼 */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300"
                >
                  완료
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberInfo;