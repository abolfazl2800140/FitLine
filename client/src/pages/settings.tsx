import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
    ArrowRight,
    Lock,
    Bell,
    BellOff,
    Moon,
    Sun,
    Monitor,
    Eye,
    EyeOff,
    Shield,
    HelpCircle,
    MessageSquare,
    Info,
    LogOut,
    Trash2,
    ChevronLeft,
    Loader2,
    User,
    Smartphone,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    // Settings state
    const [notifications, setNotifications] = useState({
        workout: true,
        messages: true,
        social: true,
        challenges: false,
    });
    const [privacy, setPrivacy] = useState({
        publicProfile: true,
        showProgress: true,
    });

    // Password change state
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/auth/logout");
        },
        onSuccess: () => {
            queryClient.clear();
            setLocation("/");
            toast({
                title: "خروج موفق",
                description: "از حساب کاربری خارج شدید",
            });
        },
    });

    const handlePasswordChange = () => {
        if (passwords.new !== passwords.confirm) {
            toast({
                title: "خطا",
                description: "رمز عبور جدید و تکرار آن مطابقت ندارند",
                variant: "destructive",
            });
            return;
        }
        if (passwords.new.length < 6) {
            toast({
                title: "خطا",
                description: "رمز عبور باید حداقل ۶ کاراکتر باشد",
                variant: "destructive",
            });
            return;
        }
        // TODO: API call to change password
        toast({
            title: "رمز عبور تغییر کرد",
            description: "رمز عبور جدید با موفقیت ذخیره شد",
        });
        setPasswordDialog(false);
        setPasswords({ current: "", new: "", confirm: "" });
    };

    const handleDeleteAccount = () => {
        // TODO: API call to delete account
        toast({
            title: "حساب حذف شد",
            description: "حساب کاربری شما با موفقیت حذف شد",
        });
        queryClient.clear();
        setLocation("/");
    };

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center justify-between px-4 h-14 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/profile")}
                        className="rounded-xl text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>
                    <div className="w-10" />
                </div>
            </div>
            {/* Spacer for fixed header */}
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6 space-y-6">

                {/* Account Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            حساب کاربری
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between h-12 px-3">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <span>تغییر رمز عبور</span>
                                    </div>
                                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>تغییر رمز عبور</DialogTitle>
                                    <DialogDescription>
                                        رمز عبور جدید باید حداقل ۶ کاراکتر باشد
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>رمز عبور فعلی</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="pl-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-0 top-0 h-full"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>رمز عبور جدید</Label>
                                        <Input
                                            type={showPasswords ? "text" : "password"}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>تکرار رمز عبور جدید</Label>
                                        <Input
                                            type={showPasswords ? "text" : "password"}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setPasswordDialog(false)}>
                                        انصراف
                                    </Button>
                                    <Button onClick={handlePasswordChange}>
                                        ذخیره
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            اعلان‌ها
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">یادآور تمرین</p>
                                    <p className="text-xs text-muted-foreground">اعلان روزانه برای تمرین</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.workout}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, workout: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">پیام‌های مربی</p>
                                    <p className="text-xs text-muted-foreground">پیام‌های جدید از مربی</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.messages}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">فعالیت اجتماعی</p>
                                    <p className="text-xs text-muted-foreground">لایک و کامنت</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.social}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, social: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Moon className="h-5 w-5 text-primary" />
                            ظاهر برنامه
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sun className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-sm">حالت تاریک</p>
                                    <p className="text-xs text-muted-foreground">تغییر تم برنامه</p>
                                </div>
                            </div>
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            حریم خصوصی
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">پروفایل عمومی</p>
                                <p className="text-xs text-muted-foreground">همه می‌توانند پروفایل شما را ببینند</p>
                            </div>
                            <Switch
                                checked={privacy.publicProfile}
                                onCheckedChange={(checked) => setPrivacy({ ...privacy, publicProfile: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">نمایش پیشرفت</p>
                                <p className="text-xs text-muted-foreground">نمایش آمار و پیشرفت به دیگران</p>
                            </div>
                            <Switch
                                checked={privacy.showProgress}
                                onCheckedChange={(checked) => setPrivacy({ ...privacy, showProgress: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Support Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            پشتیبانی
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Button variant="ghost" className="w-full justify-between h-12 px-3">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <span>تماس با پشتیبانی</span>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" className="w-full justify-between h-12 px-3">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                <span>سوالات متداول</span>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            درباره
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center justify-between h-12 px-3">
                            <span className="text-sm">نسخه برنامه</span>
                            <span className="text-sm text-muted-foreground">۱.۰.۰</span>
                        </div>
                        <Button variant="ghost" className="w-full justify-between h-12 px-3">
                            <span>قوانین و مقررات</span>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" className="w-full justify-between h-12 px-3">
                            <span>سیاست حریم خصوصی</span>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Logout & Delete */}
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full h-12 gap-2"
                        onClick={() => setLogoutDialogOpen(true)}
                        disabled={logoutMutation.isPending}
                    >
                        {logoutMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <LogOut className="h-5 w-5" />
                        )}
                        خروج از حساب
                    </Button>

                    {/* Logout Confirmation Dialog */}
                    <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                        <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>خروج از حساب کاربری</AlertDialogTitle>
                                <AlertDialogDescription>
                                    آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => logoutMutation.mutate()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    بله، خارج شو
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="w-full h-12 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                                حذف حساب کاربری
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>حذف حساب کاربری</AlertDialogTitle>
                                <AlertDialogDescription>
                                    آیا مطمئن هستید؟ این عمل غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    حذف حساب
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </div>
        </div>
    );
}
