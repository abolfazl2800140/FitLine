import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Dumbbell, Users, User, ArrowRight, Phone, KeyRound, UserCircle, Briefcase, Check, X } from "lucide-react";
import { toPersianNumber } from "@/lib/persian";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "phone" | "otp" | "info" | "coach-info" | "login";
type UserType = "user" | "coach" | null;

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string; checks: { label: string; passed: boolean }[] } => {
  const checks = [
    { label: "حداقل ۶ کاراکتر", passed: password.length >= 6 },
    { label: "حداقل یک عدد", passed: /\d/.test(password) },
    { label: "حداقل یک حرف بزرگ", passed: /[A-Z]/.test(password) },
    { label: "حداقل یک کاراکتر خاص", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  
  const passedCount = checks.filter(c => c.passed).length;
  const score = (passedCount / checks.length) * 100;
  
  let label = "ضعیف";
  let color = "bg-red-500";
  
  if (score >= 75) {
    label = "قوی";
    color = "bg-green-500";
  } else if (score >= 50) {
    label = "متوسط";
    color = "bg-yellow-500";
  } else if (score >= 25) {
    label = "ضعیف";
    color = "bg-orange-500";
  }
  
  return { score, label, color, checks };
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("phone");
  const [userType, setUserType] = useState<UserType>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState(1);
  const [pricePerSession, setPricePerSession] = useState(100000);

  const sendOtpMutation = useMutation({
    mutationFn: async () => ({ success: true }),
    onSuccess: () => {
      setStep("otp");
      toast({ title: "کد تأیید ارسال شد", description: `کد به ${phone} ارسال شد` });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => ({ exists: false }),
    onSuccess: () => setStep("info"),
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", {
        phone, fullName, username, password, role: userType || "user",
      });
      if (userType === "coach") {
        await apiRequest("POST", "/api/coach-profiles", { specialty, experience, pricePerSession });
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "ثبت‌نام موفق" });
      setLocation("/");
    },
    onError: (e: any) => toast({ title: "خطا", description: e.message, variant: "destructive" }),
  });

  const loginMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/auth/login", { phone, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
    onError: () => toast({ title: "رمز عبور اشتباه است", variant: "destructive" }),
  });

  const handlePhoneSubmit = () => {
    if (phone.length !== 11 || !phone.startsWith("09")) {
      toast({ title: "شماره تلفن معتبر وارد کنید", variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate();
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 5) verifyOtpMutation.mutate();
  };

  const handleInfoSubmit = () => {
    if (!fullName || !username || password.length < 6) {
      toast({ title: "همه فیلدها را پر کنید (رمز حداقل ۶ کاراکتر)", variant: "destructive" });
      return;
    }
    if (userType === "coach") setStep("coach-info");
    else registerMutation.mutate();
  };

  const handleCoachSubmit = () => {
    if (!specialty) {
      toast({ title: "تخصص را وارد کنید", variant: "destructive" });
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-sm border-0 shadow-none" dir="rtl">
        <CardHeader className="text-center pb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">فیت‌لاین</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "phone" && !userType && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">نوع حساب را انتخاب کنید</p>
              <button className="w-full p-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-right flex items-center gap-4 min-h-[72px]" onClick={() => setUserType("user")}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
                <div><p className="font-bold">ورزشکار</p><p className="text-sm text-muted-foreground">میخوام تمرین کنم</p></div>
              </button>
              <button className="w-full p-4 rounded-xl border-2 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-right flex items-center gap-4 min-h-[72px]" onClick={() => setUserType("coach")}>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center"><Users className="h-6 w-6 text-orange-500" /></div>
                <div><p className="font-bold">مربی</p><p className="text-sm text-muted-foreground">میخوام آموزش بدم</p></div>
              </button>
              <div className="pt-4 border-t mt-4">
                <Button variant="ghost" className="w-full min-h-[44px]" onClick={() => setStep("login")}>
                  قبلاً ثبت‌نام کردم / ورود
                </Button>
              </div>
            </div>
          )}

          {step === "phone" && userType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setUserType(null)}><ArrowRight className="h-5 w-5" /></Button>
                <span className="text-sm text-muted-foreground">{userType === "coach" ? "ثبت‌نام مربی" : "ثبت‌نام ورزشکار"}</span>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Phone className="h-7 w-7 text-primary" /></div>
                <p className="text-sm text-muted-foreground">شماره موبایل خود را وارد کنید</p>
              </div>
              <Input type="tel" inputMode="numeric" placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} className="text-center text-lg tracking-widest h-12" maxLength={11} dir="ltr" />
              <Button className="w-full h-12" onClick={handlePhoneSubmit} disabled={phone.length !== 11 || sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ادامه"}
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setStep("phone")}><ArrowRight className="h-5 w-5" /></Button>
                <span className="text-sm text-muted-foreground">تأیید شماره</span>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><KeyRound className="h-7 w-7 text-primary" /></div>
                <p className="text-sm text-muted-foreground">کد ۵ رقمی ارسال شده به</p>
                <p className="font-bold mt-1" dir="ltr">{phone}</p>
              </div>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={5} value={otp} onChange={handleOtpComplete} inputMode="numeric">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full h-12" onClick={() => verifyOtpMutation.mutate()} disabled={otp.length !== 5 || verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "تأیید کد"}
              </Button>
            </div>
          )}

          {step === "info" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setStep("otp")}><ArrowRight className="h-5 w-5" /></Button>
                <span className="text-sm text-muted-foreground">اطلاعات شما</span>
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><UserCircle className="h-7 w-7 text-primary" /></div>
              </div>
              <Input placeholder="نام و نام خانوادگی" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-12 text-right" />
              <Input placeholder="نام کاربری (انگلیسی)" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className="h-12 text-left" dir="ltr" />
              <div className="space-y-2">
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-left pr-12" dir="ltr" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {password && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${getPasswordStrength(password).score >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                        {getPasswordStrength(password).label}
                      </span>
                      <span className="text-muted-foreground">قدرت رمز:</span>
                    </div>
                    <Progress value={getPasswordStrength(password).score} className={`h-2 ${getPasswordStrength(password).color}`} />
                    <div className="space-y-1 mt-2">
                      {getPasswordStrength(password).checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs flex-row-reverse">
                          {check.passed ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={check.passed ? 'text-green-600' : 'text-muted-foreground'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button className="w-full h-12" onClick={handleInfoSubmit} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : userType === "coach" ? "ادامه" : "ثبت‌نام"}
              </Button>
            </div>
          )}

          {step === "coach-info" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setStep("info")}><ArrowRight className="h-5 w-5" /></Button>
                <span className="text-sm text-muted-foreground">اطلاعات مربیگری</span>
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3"><Briefcase className="h-7 w-7 text-orange-500" /></div>
              </div>
              <Input placeholder="تخصص (مثلاً: بدنسازی)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-12 text-right" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-muted-foreground mb-1 block">سابقه (سال)</label><Input type="number" inputMode="numeric" min={1} value={experience} onChange={(e) => setExperience(parseInt(e.target.value) || 1)} className="h-12 text-center" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">قیمت جلسه</label><Input type="number" inputMode="numeric" min={10000} step={10000} value={pricePerSession} onChange={(e) => setPricePerSession(parseInt(e.target.value) || 100000)} className="h-12 text-center" /></div>
              </div>
              <Button className="w-full h-12" onClick={handleCoachSubmit} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ثبت‌نام"}
              </Button>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setStep("phone"); setUserType(null); }}><ArrowRight className="h-5 w-5" /></Button>
                <span className="text-sm text-muted-foreground">ورود به حساب</span>
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><KeyRound className="h-7 w-7 text-primary" /></div>
                <p className="text-sm text-muted-foreground">شماره موبایل و رمز عبور را وارد کنید</p>
              </div>
              <Input type="tel" inputMode="numeric" placeholder="شماره موبایل" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 text-center tracking-widest" maxLength={11} dir="ltr" />
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-left pr-12" dir="ltr" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button className="w-full h-12" onClick={() => loginMutation.mutate()} disabled={phone.length !== 11 || !password || loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ورود"}
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-sm min-h-[44px]" onClick={() => { setStep("phone"); setUserType(null); setPhone(""); setPassword(""); }}>
                  حساب ندارم / ثبت‌نام
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
