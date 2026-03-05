import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, User, Bot, Sparkles, MoreVertical, Plus } from 'lucide-react-native';
import { Message } from '../types';

const { width } = Dimensions.get('window');

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI assistant. How can I help you today?",
            createdAt: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "That's an interesting question! As a simulated ChatGPT-like interface, I'm here to show you how a real integration would look. Would you like to see some code snippets or UI components?",
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
        }, 2000);
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';

        return (
            <View
                style={[
                    styles.messageWrapper,
                    isUser ? styles.userWrapper : styles.aiWrapper,
                ]}
            >
                <View style={styles.avatarContainer}>
                    {isUser ? (
                        <View style={[styles.avatar, styles.userAvatar]}>
                            <User size={16} color="#fff" />
                        </View>
                    ) : (
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            style={styles.avatar}
                        >
                            <Bot size={16} color="#fff" />
                        </LinearGradient>
                    )}
                </View>

                <View style={styles.messageContent}>
                    <Text style={styles.roleText}>{isUser ? 'You' : 'Assistant'}</Text>
                    <View
                        style={[
                            styles.bubble,
                            isUser ? styles.userBubble : styles.aiBubble,
                        ]}
                    >
                        {isUser ? (
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                style={styles.gradientBubble}
                            >
                                <Text style={styles.userText}>{item.content}</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.aiText}>{item.content}</Text>
                        )}
                    </View>
                    <Text style={styles.timeText}>
                        {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View style={styles.headerInfo}>
                        <View style={styles.sparkleContainer}>
                            <Sparkles size={18} color="#60a5fa" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>ChatGPT 4.0</Text>
                            <Text style={styles.headerSubtitle}>Pro Edition</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreVertical size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isTyping ? (
                        <View style={styles.typingContainer}>
                            <View style={[styles.avatar, styles.aiAvatarSmall]}>
                                <Bot size={12} color="#fff" />
                            </View>
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size="small" color="#94a3b8" />
                                <Text style={styles.typingText}>thinking...</Text>
                            </View>
                        </View>
                    ) : null
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputWrapper}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Plus size={22} color="#64748b" />
                    </TouchableOpacity>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message..."
                            placeholderTextColor="#94a3b8"
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!input.trim()}
                            style={[
                                styles.sendButton,
                                !input.trim() && styles.sendButtonDisabled,
                            ]}
                        >
                            <Send
                                size={18}
                                color={input.trim() ? '#fff' : '#94a3b8'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sparkleContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: '#64748b',
        fontSize: 12,
    },
    iconButton: {
        padding: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 24,
        maxWidth: '90%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    aiWrapper: {
        alignSelf: 'flex-start',
    },
    avatarContainer: {
        marginTop: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatar: {
        backgroundColor: '#3b82f6',
        marginLeft: 10,
    },
    aiAvatarSmall: {
        backgroundColor: '#10b981',
        width: 24,
        height: 24,
        marginRight: 8,
    },
    messageContent: {
        flex: 1,
    },
    roleText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        marginHorizontal: 4,
    },
    bubble: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    userBubble: {
        borderTopRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#1e293b',
        padding: 14,
        borderTopLeftRadius: 4,
    },
    gradientBubble: {
        padding: 14,
    },
    userText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },
    aiText: {
        color: '#e2e8f0',
        fontSize: 15,
        lineHeight: 22,
    },
    timeText: {
        color: '#475569',
        fontSize: 10,
        marginTop: 6,
        marginHorizontal: 4,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderTopLeftRadius: 4,
    },
    typingText: {
        color: '#94a3b8',
        fontSize: 13,
        marginLeft: 8,
        fontStyle: 'italic',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
    },
    attachButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 24,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        paddingVertical: 10,
        maxHeight: 100,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: 'transparent',
    },
});

export default ChatInterface;
