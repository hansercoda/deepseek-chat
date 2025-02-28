import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Snackbar,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const ChatInterface = () => {
  // 从本地存储加载初始状态
  const loadInitialState = () => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedDeepThinking = localStorage.getItem('deepThinking');
    const savedWebSearch = localStorage.getItem('webSearch');
    return {
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      deepThinking: savedDeepThinking ? JSON.parse(savedDeepThinking) : false,
      webSearch: savedWebSearch ? JSON.parse(savedWebSearch) : false,
    };
  };

  const initialState = loadInitialState();
  const [messages, setMessages] = useState(initialState.messages);
  const [inputMessage, setInputMessage] = useState('');
  const [deepThinking, setDeepThinking] = useState(initialState.deepThinking);
  const [webSearch, setWebSearch] = useState(initialState.webSearch);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const messagesEndRef = useRef(null);

  // 保存状态到本地存储
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('deepThinking', JSON.stringify(deepThinking));
  }, [deepThinking]);

  useEffect(() => {
    localStorage.setItem('webSearch', JSON.stringify(webSearch));
  }, [webSearch]);

  // 打字机效果
  useEffect(() => {
    if (currentTypingIndex >= 0 && currentTypingIndex < messages.length) {
      const message = messages[currentTypingIndex];
      if (!message.isUser && message.text !== displayedText) {
        let index = 0;
        const text = message.text;
        const interval = setInterval(() => {
          if (index <= text.length) {
            setDisplayedText(text.slice(0, index));
            index++;
          } else {
            clearInterval(interval);
            setCurrentTypingIndex(-1);
          }
        }, 30);
        return () => clearInterval(interval);
      }
    }
  }, [currentTypingIndex, messages, displayedText]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
    setDeepThinking(false);
    setWebSearch(false);
    setSnackbarMessage('已新建对话');
    setSnackbarOpen(true);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('复制成功');
    setSnackbarOpen(true);
  };

  const handleRegenerateResponse = async (index) => {
    try {
      const userMessage = messages[index - 1];
      if (!userMessage || !userMessage.isUser) return;

      let endpoint = '/api/chat';
      if (deepThinking && webSearch) {
        endpoint += '/deepseek-r1-bing';
      } else if (!deepThinking && !webSearch) {
        endpoint += '/deepseek-v3';
      } else if (deepThinking) {
        endpoint += '/deepseek-r1';
      } else {
        endpoint += '/deepseek-v3-bing';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();
      const newMessages = [...messages];
      newMessages[index] = { text: data.response, isUser: false };
      setMessages(newMessages);
      setCurrentTypingIndex(index);
      setDisplayedText('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { text: inputMessage, isUser: true }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      let endpoint = '/api/chat';
      if (deepThinking && webSearch) {
        endpoint += '/deepseek-r1-bing';
      } else if (!deepThinking && !webSearch) {
        endpoint += '/deepseek-v3';
      } else if (deepThinking) {
        endpoint += '/deepseek-r1';
      } else {
        endpoint += '/deepseek-v3-bing';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      const aiMessage = { text: data.response, isUser: false };
      setMessages([...newMessages, aiMessage]);
      setCurrentTypingIndex(newMessages.length);
      setDisplayedText('');
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        { text: '内容由 AI 生成，请仔细甄别', isUser: false },
      ]);
    }
  };

  const renderMessageText = (message, index) => {
    if (message.isUser) {
      return message.text;
    }
    return index === currentTypingIndex ? displayedText : message.text;
  };

  const hasMessages = messages.length > 0;

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f9fafb',
        position: 'relative',
        justifyContent: hasMessages ? 'flex-start' : 'center',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 欢迎信息 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        transition: 'all 0.5s ease',
        ...(hasMessages ? {
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          transform: 'translateY(0)',
        } : {
          p: 3,
          transform: 'translateY(-30%)',
        })
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 2,
          }}>
            <img 
              src="/deepseek-color.png"
              alt="AiChat Logo" 
              style={{ 
                width: hasMessages ? 32 : 48,
                height: hasMessages ? 32 : 48,
                transition: 'all 0.3s ease',
              }} 
            />
            <Typography 
              variant={hasMessages ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 500,
                transition: 'all 0.3s ease',
              }}
            >
              我是 AiChat，很高兴见到你!
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              transition: 'all 0.3s ease',
              fontSize: hasMessages ? '0.875rem' : '1rem',
            }}
          >
            我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~
          </Typography>
        </Box>
      </Box>

      {/* 聊天消息区域 */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        px: 2, 
        py: 3,
        opacity: hasMessages ? 1 : 0,
        transition: 'opacity 0.3s ease',
        display: hasMessages ? 'block' : 'none',
      }}>
        <Container maxWidth="md">
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.isUser ? 'flex-end' : 'flex-start',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                  width: '100%',
                }}
              >
                {!message.isUser ? (
                  <Box
                    component="img"
                    src="/deepseek-color.png"
                    alt="AI"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      mr: message.isUser ? 0 : 2,
                      ml: message.isUser ? 2 : 0,
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src="/user-avatar.png"
                    alt="User"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      mr: message.isUser ? 2 : 0,
                      ml: message.isUser ? 0 : 2,
                    }}
                  />
                )}
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.isUser ? '#1d4ed8' : '#fff',
                    color: message.isUser ? '#fff' : '#000',
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: message.isUser ? 'none' : '1px solid #e5e7eb',
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {renderMessageText(message, index)}
                  </Typography>
                </Paper>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mt: 1,
                  px: 5,
                }}
              >
                <ButtonGroup variant="text" size="small">
                  <IconButton
                    onClick={() => handleCopy(message.text)}
                    sx={{ 
                      color: '#6b7280',
                      padding: '4px',
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                  {!message.isUser && (
                    <>
                      <IconButton
                        onClick={() => handleRegenerateResponse(index)}
                        sx={{ 
                          color: '#6b7280',
                          padding: '4px',
                        }}
                      >
                        <RefreshIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <IconButton
                        sx={{ 
                          color: '#6b7280',
                          padding: '4px',
                        }}
                      >
                        <ThumbUpIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <IconButton
                        sx={{ 
                          color: '#6b7280',
                          padding: '4px',
                        }}
                      >
                        <ThumbDownIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </>
                  )}
                </ButtonGroup>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* 底部输入区域 */}
      <Container 
        maxWidth="md" 
        sx={{ 
          p: 2,
          mt: hasMessages ? 0 : 2,
          mb: 4,  // Add margin bottom for the disclaimer
          transition: 'all 0.3s ease',
          transform: hasMessages ? 'translateY(0)' : 'translateY(-30%)',
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            boxShadow: 'none',
            bgcolor: '#f9fafb',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ 
            px: 2,
            pt: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f9fafb',
          }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="给 AiChat 发送消息"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    return;
                  } else {
                    e.preventDefault();
                    handleSend();
                  }
                }
              }}
              multiline
              maxRows={4}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{ 
                mx: 1,
                '& .MuiInputBase-root': {
                  bgcolor: '#f9fafb',
                }
              }}
            />
          </Box>
          <Box sx={{ 
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f9fafb',
          }}>
            <Button
              variant={deepThinking ? "contained" : "outlined"}
              size="small"
              sx={{ 
                mr: 1,
                borderRadius: 4,
                bgcolor: deepThinking ? '#1d4ed8' : 'transparent',
                '&:hover': {
                  bgcolor: deepThinking ? '#1e40af' : 'rgba(29, 78, 216, 0.04)',
                },
                height: '28px',
                textTransform: 'none',
                fontSize: '13px',
              }}
              onClick={() => setDeepThinking(!deepThinking)}
            >
              深度思考 (R1)
            </Button>
            <Button
              variant={webSearch ? "contained" : "outlined"}
              size="small"
              sx={{ 
                borderRadius: 4,
                bgcolor: webSearch ? '#1d4ed8' : 'transparent',
                '&:hover': {
                  bgcolor: webSearch ? '#1e40af' : 'rgba(29, 78, 216, 0.04)',
                },
                height: '28px',
                textTransform: 'none',
                fontSize: '13px',
              }}
              onClick={() => setWebSearch(!webSearch)}
            >
              联网搜索
            </Button>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title="新建对话">
                <IconButton
                  onClick={handleNewChat}
                  sx={{
                    width: '28px',
                    height: '28px',
                    bgcolor: '#f3f4f6',
                    '&:hover': {
                      bgcolor: '#e5e7eb',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </Tooltip>
              <IconButton 
                onClick={handleSend}
                sx={{ 
                  bgcolor: '#1d4ed8',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#1e40af',
                  },
                  width: '28px',
                  height: '28px',
                }}
              >
                <SendIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* 底部固定提示文字 */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          py: 1,
          bgcolor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          zIndex: 1000,
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#9ca3af',
            fontSize: '0.875rem',
          }}
        >
          内容由 AI 生成，请仔细甄别
        </Typography>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ChatInterface; 