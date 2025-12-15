import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type WebSocketMessage = {
    type: string;
    [key: string]: any;
};

type MessageHandler = (message: WebSocketMessage) => void;

interface UseWebSocketReturn {
    isConnected: boolean;
    sendMessage: (message: WebSocketMessage) => void;
    subscribe: (type: string, handler: MessageHandler) => () => void;
}

// Singleton WebSocket instance
let wsInstance: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const handlers = new Map<string, Set<MessageHandler>>();
const globalHandlers = new Set<MessageHandler>();

export function useWebSocket(): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();

    const { data: user } = useQuery<any>({
        queryKey: ['/api/auth/me'],
    });

    // Connect to WebSocket
    useEffect(() => {
        if (!user?.id) {
            // Disconnect if user logs out
            if (wsInstance) {
                wsInstance.close();
                wsInstance = null;
            }
            return;
        }

        // Already connected
        if (wsInstance?.readyState === WebSocket.OPEN) {
            setIsConnected(true);
            return;
        }

        const connect = () => {
            try {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                if (!host) {
                    console.warn('WebSocket: host not available');
                    return;
                }
                const wsUrl = `${protocol}//${host}/ws`;

                wsInstance = new WebSocket(wsUrl);

            wsInstance.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);

                // Authenticate
                wsInstance?.send(JSON.stringify({
                    type: 'auth',
                    userId: user.id,
                }));
            };

            wsInstance.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message:', message);

                    // Call type-specific handlers
                    const typeHandlers = handlers.get(message.type);
                    if (typeHandlers) {
                        typeHandlers.forEach(handler => handler(message));
                    }

                    // Call global handlers
                    globalHandlers.forEach(handler => handler(message));

                    // Auto-update React Query cache based on message type
                    handleCacheUpdate(message, queryClient);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            wsInstance.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                wsInstance = null;

                // Reconnect after 3 seconds
                if (user?.id) {
                    reconnectTimeout = setTimeout(connect, 3000);
                }
            };

            wsInstance.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            } catch (error) {
                console.warn('WebSocket connection failed:', error);
            }
        };

        connect();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [user?.id, queryClient]);

    // Send message
    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsInstance?.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected');
        }
    }, []);

    // Subscribe to specific message type
    const subscribe = useCallback((type: string, handler: MessageHandler) => {
        if (!handlers.has(type)) {
            handlers.set(type, new Set());
        }
        handlers.get(type)!.add(handler);

        // Return unsubscribe function
        return () => {
            handlers.get(type)?.delete(handler);
        };
    }, []);

    return { isConnected, sendMessage, subscribe };
}

// Handle cache updates based on message type
function handleCacheUpdate(message: WebSocketMessage, queryClient: any) {
    switch (message.type) {
        // New message received
        case 'message':
        case 'new_message':
            queryClient.invalidateQueries({
                queryKey: ['/api/conversations', message.message?.conversationId, 'messages']
            });
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
            break;

        // Message sent confirmation
        case 'message_sent':
            queryClient.invalidateQueries({
                queryKey: ['/api/conversations', message.message?.conversationId, 'messages']
            });
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
            break;

        // New coaching request
        case 'new_request':
            queryClient.invalidateQueries({ queryKey: ['/api/coach/requests'] });
            queryClient.invalidateQueries({ queryKey: ['/api/coach/requests/pending-count'] });
            break;

        // Request status changed
        case 'request_accepted':
        case 'request_rejected':
            queryClient.invalidateQueries({ queryKey: ['/api/coaching-requests/my'] });
            queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
            break;

        // New post in feed
        case 'new_post':
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
            break;

        // Post liked/unliked
        case 'post_liked':
        case 'post_unliked':
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
            break;

        // New comment
        case 'new_comment':
            queryClient.invalidateQueries({
                queryKey: ['/api/posts', message.postId, 'comments']
            });
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
            break;

        // New follower
        case 'new_follower':
            queryClient.invalidateQueries({ queryKey: ['/api/users', message.userId] });
            break;

        // New nutrition plan
        case 'new_nutrition_plan':
            queryClient.invalidateQueries({ queryKey: ['/api/nutrition-plans/active'] });
            queryClient.invalidateQueries({ queryKey: ['/api/nutrition-plans'] });
            break;

        // New workout program
        case 'new_program':
            queryClient.invalidateQueries({ queryKey: ['/api/user/programs'] });
            queryClient.invalidateQueries({ queryKey: ['/api/user/programs/details'] });
            break;

        // User online/offline status
        case 'user_online':
        case 'user_offline':
            // Can be used to show online status
            break;
    }
}

// Export singleton send function for use outside React
export function sendWebSocketMessage(message: WebSocketMessage) {
    if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(message));
        return true;
    }
    return false;
}
