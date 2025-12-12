import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    permission: NotificationPermission | null;
}

export function usePushNotifications() {
    const { toast } = useToast();
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        isSubscribed: false,
        isLoading: true,
        permission: null,
    });

    // Check if push notifications are supported
    useEffect(() => {
        const checkSupport = async () => {
            const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
            const permission = isSupported ? Notification.permission : null;

            let isSubscribed = false;
            if (isSupported && permission === 'granted') {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    isSubscribed = !!subscription;
                } catch (error) {
                    console.error('Error checking subscription:', error);
                }
            }

            setState({
                isSupported,
                isSubscribed,
                isLoading: false,
                permission,
            });
        };

        checkSupport();
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!state.isSupported) {
            toast({
                title: 'خطا',
                description: 'مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند',
                variant: 'destructive',
            });
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast({
                    title: 'دسترسی رد شد',
                    description: 'برای دریافت یادآورها، لطفاً دسترسی نوتیفیکیشن را فعال کنید',
                    variant: 'destructive',
                });
                setState(prev => ({ ...prev, isLoading: false, permission }));
                return false;
            }

            // Get VAPID public key
            const vapidResponse = await fetch('/api/push/vapid-key');
            const { publicKey } = await vapidResponse.json();

            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Send subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                        auth: arrayBufferToBase64(subscription.getKey('auth')),
                    },
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                isLoading: false,
                permission: 'granted',
            }));

            toast({
                title: 'فعال شد! 🔔',
                description: 'یادآورهای تغذیه برای شما ارسال خواهد شد',
            });

            return true;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            toast({
                title: 'خطا',
                description: 'مشکلی در فعال‌سازی نوتیفیکیشن پیش آمد',
                variant: 'destructive',
            });
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, [state.isSupported, toast]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from browser
                await subscription.unsubscribe();

                // Remove from server
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                    credentials: 'include',
                });
            }

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                isLoading: false,
            }));

            toast({
                title: 'غیرفعال شد',
                description: 'دیگر یادآوری دریافت نخواهید کرد',
            });

            return true;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, [toast]);

    // Test notification
    const testNotification = useCallback(async () => {
        try {
            const response = await fetch('/api/push/test', {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                toast({
                    title: 'ارسال شد',
                    description: 'نوتیفیکیشن تست ارسال شد',
                });
            }
        } catch (error) {
            console.error('Error testing notification:', error);
        }
    }, [toast]);

    return {
        ...state,
        subscribe,
        unsubscribe,
        testNotification,
    };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
