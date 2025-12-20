import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { isConnected, subscribe } = useWebSocket();
    const { toast } = useToast();

    // Subscribe to global notifications
    useEffect(() => {
        // New message notification
        const unsubMessage = subscribe('new_message', (msg) => {
            // Only show toast if not on messages page
            if (!window.location.pathname.includes('/messages')) {
                toast({
                    title: '💬 پیام جدید',
                    description: 'یک پیام جدید دریافت کردید',
                });
            }
        });

        // Request accepted
        const unsubAccepted = subscribe('request_accepted', (msg) => {
            toast({
                title: '🎉 درخواست قبول شد!',
                description: `${msg.coach?.fullName} درخواست شما را قبول کرد`,
            });
        });

        // Request rejected
        const unsubRejected = subscribe('request_rejected', (msg) => {
            toast({
                title: 'درخواست رد شد',
                description: msg.reason || 'متأسفانه درخواست شما رد شد',
                variant: 'destructive',
            });
        });

        // New coaching request (for coaches)
        const unsubNewRequest = subscribe('new_request', (msg) => {
            toast({
                title: '📩 درخواست جدید',
                description: `${msg.user?.fullName} درخواست مربیگری داد`,
            });
        });

        // Post liked
        const unsubLiked = subscribe('post_liked', (msg) => {
            toast({
                title: '❤️ لایک جدید',
                description: `${msg.user?.fullName} پست شما را لایک کرد`,
            });
        });

        // New comment
        const unsubComment = subscribe('new_comment', (msg) => {
            toast({
                title: '💬 کامنت جدید',
                description: `${msg.user?.fullName} روی پست شما کامنت گذاشت`,
            });
        });

        // New nutrition plan
        const unsubNutrition = subscribe('new_nutrition_plan', (msg) => {
            toast({
                title: '🍎 برنامه تغذیه جدید!',
                description: 'مربی شما یک برنامه تغذیه جدید ارسال کرد',
            });
        });

        // New workout program
        const unsubProgram = subscribe('new_program', (msg) => {
            toast({
                title: '💪 برنامه تمرینی جدید!',
                description: 'مربی شما یک برنامه تمرینی جدید ارسال کرد',
            });
        });

        // New follower
        const unsubFollower = subscribe('new_follower', (msg) => {
            toast({
                title: '👤 دنبال‌کننده جدید',
                description: `${msg.follower?.fullName} شما را دنبال کرد`,
            });
        });

        return () => {
            unsubMessage();
            unsubAccepted();
            unsubRejected();
            unsubNewRequest();
            unsubLiked();
            unsubComment();
            unsubNutrition();
            unsubProgram();
            unsubFollower();
        };
    }, [subscribe, toast]);

    return <>{children}</>;
}
