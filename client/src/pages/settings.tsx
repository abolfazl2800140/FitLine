import { useState, useEffect } from "react";
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
import { PageHeader } from "@/components/layout/PageHeader";
import {
    Lock,
    Bell,
    Moon,
    Sun,
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

interface UserSettings {
    notifications: {
        workout: boolean;
        messages: boolean;
        social: boolean;
    };
    privacy: {
        publicProfile: boolean;
        showProgress: boolean;
    };
}

export default function SettingsPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    // Password change state
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    // Fetch user settings
    const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
        queryKey: ["/api/user/settings"],
        enabled: !!user,
    });

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (data: Partial<UserSettings>) => {
            return apiRequest("PATCH", "/api/user/settings", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
        },
        onError: () => {
            toast({
                title: "خطا",
                description: "خطا در ذخیره تنظیمات",
                variant: "destructive",
            });
        },
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

    const changePasswordMutation = useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            return apiRequest("POST", "/api/user/change-password", data);
        },
        onSuccess: () => {
            toast({
                title: "رمز عبور تغییر کرد",
                description: "رمز عبور جدید با موفقیت ذخیره شد",
            });
            setPasswordDialog(false);
            setPasswords({ current: "", new: "", confirm: "" });
        },
        onError: (error: any) => {
            toast({
                title: "خطا",
                description: error.message || "خطا در تغییر رمز عبور",
                variant: "destructive",
            });
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: async (password: string) => {
            return apiRequest("DELETE", "/api/user/account", { password });
        },
        onSuccess: () => {
            queryClient.clear();
            setLocation("/");
            toast({
                title: "حساب حذف شد",
                description: "حساب کاربری شما با موفقیت حذف شد",
            });
        },
        onError: (error: any) => {
            toast({
                title: "خطا",
                description: error.message || "خطا در حذف حساب کاربری",
                variant: "destructive",
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
        changePasswordMutation.mutate({
            currentPassword: passwords.current,
            newPassword: passwords.new,
        });
    };

    const handleDeleteAccount = () => {
        if (!deletePassword) {
            toast({
                title: "خطا",
                description: "لطفاً رمز عبور خود را وارد کنید",
                variant: "destructive",
            });
            return;
        }
        deleteAccountMutation.mutate(deletePassword);
    };

    const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
        updateSettingsMutation.mutate({
            notifications: {
                ...settings?.notifications,
                [key]: value,
            },
        });
    };

    const updatePrivacy = (key: keyof UserSettings['privacy'], value: boolean) => {
        updateSettingsMutation.mutate({
            privacy: {
                ...settings?.privacy,
                [key]: value,
            },
        });
    };

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <PageHeader showBack backPath="/profile" />

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
                                    <Button onClick={handlePasswordChange} disabled={changePasswordMutation.isPending}>
                                        {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
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
                                checked={settings?.notifications?.workout ?? true}
                                onCheckedChange={(checked) => updateNotification('workout', checked)}
                                disabled={settingsLoading || updateSettingsMutation.isPending}
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
                                checked={settings?.notifications?.messages ?? true}
                                onCheckedChange={(checked) => updateNotification('messages', checked)}
                                disabled={settingsLoading || updateSettingsMutation.isPending}
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
                                checked={settings?.notifications?.social ?? true}
                                onCheckedChange={(checked) => updateNotification('social', checked)}
                                disabled={settingsLoading || updateSettingsMutation.isPending}
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

                {/* Privacy Section - Only show progress toggle */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            حریم خصوصی
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">نمایش پیشرفت</p>
                                <p className="text-xs text-muted-foreground">نمایش عکس‌ها و آمار پیشرفت به دیگران</p>
                            </div>
                            <Switch
                                checked={settings?.privacy?.showProgress ?? true}
                                onCheckedChange={(checked) => updatePrivacy('showProgress', checked)}
                                disabled={settingsLoading || updateSettingsMutation.isPending}
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
                        className="w-full h-12 gap-2 min-h-[48px]"
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
                                <AlertDialogCancel className="min-h-[44px]">انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => logoutMutation.mutate()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
                                >
                                    بله، خارج شو
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Delete Account Button */}
                    <Button
                        variant="ghost"
                        className="w-full h-12 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[48px]"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-5 w-5" />
                        حذف حساب کاربری
                    </Button>

                    {/* Delete Account Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent dir="rtl">
                            <DialogHeader>
                                <DialogTitle>حذف حساب کاربری</DialogTitle>
                                <DialogDescription>
                                    این عمل غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد.
                                    برای تأیید، رمز عبور خود را وارد کنید.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>رمز عبور</Label>
                                <Input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="رمز عبور خود را وارد کنید"
                                    className="mt-2"
                                />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setDeletePassword("");
                                }}>
                                    انصراف
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteAccountMutation.isPending}
                                >
                                    {deleteAccountMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "حذف حساب"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

            </div>
        </div>
    );
}
