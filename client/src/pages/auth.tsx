import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Dumbbell, Users, User, ArrowLeft, Phone, KeyRound, UserCircle, Briefcase, Check, X } from "lucide-react";

type Step = "phone" | "info" | "coach-info" | "login";
type UserType = "user" | "coach" | null;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

const getPasswordStrength = (password: string): PasswordStrength => {
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
  if (score >= 75) { label = "قوی"; color = "bg-green-500"; }
  else if (score >= 50) { label = "متوسط"; color = "bg-yellow-500"; }
  else if (score >= 25) { label = "ضعیف"; color = "bg-orange-500"; }
  return { score, label, color, checks };
};

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const pageTransition = { type: "tween", ease: "easeInOut", duration: 0.15 };

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("phone");
  const [userType, setUserType] = useState<UserType>(null);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState(1);
  const [pricePerSession, setPricePerSession] = useState(100000);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [showOtp, setShowOtp] = useState(false);

  const sendOtpMutation = useMutation({
    mutationFn: async () => ({ success: true }),
    onSuccess: () => { setShowOtp(true); toast({ title: "کد تأیید ارسال شد", description: `کد به ${phone} ارسال شد` }); },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => ({ exists: false }),
    onSuccess: () => setStep("info"),
  });

  const translateError = (error: string): string => {
    const errorMap: Record<string, string> = {
      "Phone number already registered": "این شماره تلفن قبلاً ثبت شده است",
      "Username already taken": "این نام کاربری قبلاً استفاده شده است",
      "All fields are required": "همه فیلدها الزامی هستند",
      "Login failed after registration": "خطا در ورود پس از ثبت‌نام",
      "Registration failed": "ثبت‌نام ناموفق بود",
      "Unauthorized": "دسترسی غیرمجاز",
      "Not authenticated": "وارد نشده‌اید",
      "Invalid phone/email or password": "شماره موبایل یا رمز عبور اشتباه است",
      "Invalid phone or password": "شماره موبایل یا رمز عبور اشتباه است",
      "Missing credentials": "شماره موبایل یا رمز عبور وارد نشده",
    };

    // Check if error contains any of the keys
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) return value;
    }

    return error; // Return original error if no translation found
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", { phone, fullName, username, password, role: userType || "user" });
      if (userType === "coach") await apiRequest("POST", "/api/coach-profiles", { specialty, experience, pricePerSession });
      return res;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); toast({ title: "ثبت‌نام موفق" }); setLocation("/"); },
    onError: (e: any) => setError(translateError(e.message)),
  });

  const loginMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/auth/login", { phone, password }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); setLocation("/"); },
    onError: (e: any) => setError(translateError(e.message)),
  });

  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    setPhone(cleanValue);
    setError("");

    // Auto send OTP when 11 digits entered
    if (cleanValue.length === 11 && cleanValue.startsWith("09") && !showOtp) {
      sendOtpMutation.mutate();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);

    const fullOtp = newOtpValues.join("");

    // Auto focus next input
    if (value && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit when complete
    if (fullOtp.length === 5) {
      verifyOtpMutation.mutate();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    const newOtpValues = [...otpValues];
    pastedData.split("").forEach((char, i) => {
      if (i < 5) newOtpValues[i] = char;
    });
    setOtpValues(newOtpValues);
    if (pastedData.length === 5) verifyOtpMutation.mutate();
  };

  const handleInfoSubmit = () => {
    setError("");
    if (!fullName) { setError("نام و نام خانوادگی را وارد کنید"); return; }
    if (!username) { setError("نام کاربری را وارد کنید"); return; }
    if (password.length < 6) { setError("رمز عبور باید حداقل ۶ کاراکتر باشد"); return; }
    if (userType === "coach") setStep("coach-info"); else registerMutation.mutate();
  };

  const handleCoachSubmit = () => {
    setError("");
    if (!specialty) { setError("تخصص را وارد کنید"); return; }
    registerMutation.mutate();
  };

  const handleBack = () => {
    setError("");
    if (step === "login") { setStep("phone"); setUserType(null); }
    else if (step === "phone" && userType && showOtp) { setShowOtp(false); setOtpValues(["", "", "", "", ""]); }
    else if (step === "phone" && userType) setUserType(null);
    else if (step === "info") { setStep("phone"); setShowOtp(true); }
    else if (step === "coach-info") setStep("info");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30 relative" dir="rtl">
      {(step !== "phone" || userType) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 flex items-center gap-2 z-10"
        >
          <span className="text-sm text-muted-foreground">
            {step === "login" && "ورود به حساب"}
            {step === "phone" && userType === "coach" && "ثبت‌نام مربی"}
            {step === "phone" && userType === "user" && "ثبت‌نام ورزشکار"}
            {step === "info" && "اطلاعات شما"}
            {step === "coach-info" && "اطلاعات مربیگری"}
          </span>
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      <Card className="w-full max-w-sm border-0 shadow-none overflow-hidden" dir="rtl">
        <AnimatePresence mode="wait">
          {step === "phone" && !userType && (
            <motion.div key="welcome" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3"
                >
                  <Dumbbell className="h-7 w-7 text-primary-foreground" />
                </motion.div>
                <CardTitle className="text-2xl">فیت‌لاین</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <Button variant="ghost" className="w-full min-h-[44px]" onClick={() => setStep("login")}>قبلاً ثبت‌نام کردم / ورود</Button>
                </div>
              </CardContent>
            </motion.div>
          )}

          {step === "phone" && userType && (
            <motion.div key="phone-input" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <CardContent className="space-y-4 pt-6">
                <div className="text-center mb-6">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-7 w-7 text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    {showOtp ? "کد ۵ رقمی ارسال شده را وارد کنید" : "شماره موبایل خود را وارد کنید"}
                  </p>
                </div>

                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="text-center text-lg tracking-widest h-12"
                  maxLength={11}
                  dir="ltr"
                  disabled={showOtp}
                />

                <AnimatePresence>
                  {showOtp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center gap-3" dir="ltr">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <div key={index} className="w-12 border-b-2 border-muted-foreground/40">
                            <input
                              ref={(el) => (otpRefs.current[index] = el)}
                              type="tel"
                              inputMode="numeric"
                              maxLength={1}
                              value={otpValues[index]}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              className="otp-input w-full h-10 text-center text-2xl font-semibold bg-transparent border-0 outline-none"
                              autoFocus={index === 0}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        className="text-sm text-primary w-full text-center"
                        onClick={() => sendOtpMutation.mutate()}
                      >
                        ارسال مجدد کد
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              </CardContent>
            </motion.div>
          )}

          {step === "info" && (
            <motion.div key="info" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <CardContent className="space-y-4 pt-6">
                <div className="text-center mb-4">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <UserCircle className="h-7 w-7 text-primary" />
                  </motion.div>
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
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">قدرت رمز:</span>
                        <span className={`font-medium ${getPasswordStrength(password).score >= 50 ? 'text-green-600' : 'text-orange-500'}`}>{getPasswordStrength(password).label}</span>
                      </div>
                      <Progress value={getPasswordStrength(password).score} className={`h-2 ${getPasswordStrength(password).color}`} />
                      <div className="space-y-1 mt-2">
                        {getPasswordStrength(password).checks.map((check, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {check.passed ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                            <span className={check.passed ? 'text-green-600' : 'text-muted-foreground'}>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <Button className="w-full h-12" onClick={handleInfoSubmit} disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : userType === "coach" ? "ادامه" : "ثبت‌نام"}
                </Button>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              </CardContent>
            </motion.div>
          )}

          {step === "coach-info" && (
            <motion.div key="coach-info" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <CardContent className="space-y-4 pt-6">
                <div className="text-center mb-4">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-7 w-7 text-orange-500" />
                  </motion.div>
                </div>
                <Input placeholder="تخصص (مثلاً: بدنسازی)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-12 text-right" />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm text-muted-foreground mb-1 block">سابقه (سال)</label><Input type="number" inputMode="numeric" min={1} value={experience} onChange={(e) => setExperience(parseInt(e.target.value) || 1)} className="h-12 text-center" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">قیمت جلسه</label><Input type="number" inputMode="numeric" min={10000} step={10000} value={pricePerSession} onChange={(e) => setPricePerSession(parseInt(e.target.value) || 100000)} className="h-12 text-center" /></div>
                </div>
                <Button className="w-full h-12" onClick={handleCoachSubmit} disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ثبت‌نام"}
                </Button>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              </CardContent>
            </motion.div>
          )}

          {step === "login" && (
            <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <CardContent className="space-y-4 pt-6">
                <div className="text-center mb-4">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="h-7 w-7 text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">شماره موبایل و رمز عبور را وارد کنید</p>
                </div>
                <Input type="tel" inputMode="numeric" placeholder="شماره موبایل" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 text-center tracking-widest" maxLength={11} dir="ltr" />
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 text-left pr-12" dir="ltr" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button className="w-full h-12" onClick={() => { setError(""); loginMutation.mutate(); }} disabled={phone.length !== 11 || !password || loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ورود"}
                </Button>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <div className="text-center">
                  <Button variant="link" className="text-sm min-h-[44px]" onClick={() => { setStep("phone"); setUserType(null); setPhone(""); setPassword(""); }}>حساب ندارم / ثبت‌نام</Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
