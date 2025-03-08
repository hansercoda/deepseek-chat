import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Paper,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Tooltip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LanguageIcon from '@mui/icons-material/Language';

const ChatInterface = () => {
  // 从本地存储加载初始状态
  const loadInitialState = () => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedDeepThinking = localStorage.getItem('deepThinking');
    const savedWebSearch = localStorage.getItem('webSearch');
    const savedIsR1Small = localStorage.getItem('isR1Small');
    return {
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      deepThinking: savedDeepThinking ? JSON.parse(savedDeepThinking) : false,
      webSearch: savedWebSearch ? JSON.parse(savedWebSearch) : false,
      isR1Small: savedIsR1Small ? JSON.parse(savedIsR1Small) : false,
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
  const [displayedReasoning, setDisplayedReasoning] = useState('');
  const [isTypingReasoning, setIsTypingReasoning] = useState(false);
  const messagesEndRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortController = useRef(null);
  const [isR1Small, setIsR1Small] = useState(initialState.isR1Small);

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

  useEffect(() => {
    localStorage.setItem('isR1Small', JSON.stringify(isR1Small));
  }, [isR1Small]);

  // 打字机效果
  useEffect(() => {
    if (currentTypingIndex >= 0 && currentTypingIndex < messages.length) {
      const message = messages[currentTypingIndex];
      if (!message.isUser) {
        let index = 0;
        const typingInterval = 30; // 打字速度（毫秒）

        if (message.isR1 && message.reasoningContent && !isTypingReasoning) {
          // 先显示推理内容
          const reasoningText = message.reasoningContent || '';
          const timer = setInterval(() => {
            if (index <= reasoningText.length) {
              setDisplayedReasoning(reasoningText.slice(0, index));
              index++;
            } else {
              clearInterval(timer);
              // 推理内容显示完成后，设置标志并重置索引
              setIsTypingReasoning(true);
              index = 0;
            }
          }, typingInterval);

          return () => {
            clearInterval(timer);
            setDisplayedReasoning(reasoningText);
          };
        }

        // 显示最终答案（只有在推理内容显示完成后或没有推理内容时）
        if (!message.isR1 || isTypingReasoning) {
          const text = message.text || '';
          const timer = setInterval(() => {
            if (index <= text.length) {
              setDisplayedText(text.slice(0, index));
              index++;
            } else {
              clearInterval(timer);
              setCurrentTypingIndex(-1);
              setIsTypingReasoning(false);
            }
          }, typingInterval);

          return () => {
            clearInterval(timer);
            setDisplayedText(text);
          };
        }
      }
    }
  }, [currentTypingIndex, messages, isTypingReasoning]);

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

  const handleStopGeneration = () => {
    if (abortController.current) {
      abortController.current.abort();
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const processedMessage = inputMessage.replace(/\n+$/, '');
    const newMessages = [...messages, { text: processedMessage, isUser: true }];
    setMessages([...newMessages, { text: '', isUser: false, loading: true }]);
    setInputMessage('');
    setIsGenerating(true);

    try {
      abortController.current = new AbortController();

      let endpoint = 'http://localhost:3333/api/chat/';
      if (!deepThinking) {
        endpoint += webSearch ? 'deepseek-v3-search' : 'deepseek-v3';
      } else {
        endpoint += isR1Small ?
          (webSearch ? 'deepseek-r1-7b-search' : 'deepseek-r1-7b') :
          (webSearch ? 'deepseek-r1-671b-search' : 'deepseek-r1-671b');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: processedMessage }),
        signal: abortController.current.signal
      });

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          text: data.raw_response.choices[0].message.content,
          isUser: false,
          modelType: isR1Small ? '7b' : (deepThinking ? '671b' : 'v3'),
          isR1: deepThinking && !isR1Small, // 只有 671B 模型才设置 isR1
          reasoningContent: data.raw_response.choices[0].message.reasoning_content,
          showReasoning: true,
        };
        setMessages([...newMessages, aiMessage]);
        setCurrentTypingIndex(newMessages.length);
        setDisplayedText('');

        // 保持生成状态直到打字机效果结束
        const content = aiMessage.text || '';
        const totalLength = content.length;
        const typingInterval = 30;
        const totalTime = totalLength * typingInterval;

        // 在打字机效果结束前保持 isGenerating 为 true
        setTimeout(() => {
          setIsGenerating(false);
        }, totalTime);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages([...newMessages, { text: '回答已终止。', isUser: false }]);
      } else {
        console.error('Error:', error);
        setMessages([...newMessages, { text: '发送消息失败，请重试。', isUser: false }]);
      }
      setIsGenerating(false);
    }
  };

  const toggleReasoning = (index) => {
    setMessages(messages.map((msg, i) =>
      i === index ? { ...msg, showReasoning: !msg.showReasoning } : msg
    ));
  };

  const renderReasoningContent = (message, index) => {
    // 不再使用全局的 isR1Small 来判断是否显示推理框
    // 而是根据消息本身的属性来判断
    if (!message.isR1 || message.modelType === '7b') {
      return null;
    }

    let reasoningContent = '';

    if (currentTypingIndex === index && !isTypingReasoning) {
      reasoningContent = displayedReasoning;
    } else {
      reasoningContent = message.reasoningContent;
    }

    // 如果没有推理内容则不显示
    if (!reasoningContent?.trim()) {
      return null;
    }

    return (
      <Box sx={{ mt: 1, mb: 1 }}>
        <Box
          onClick={() => toggleReasoning(index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: '8px',
            padding: '4px 8px',
            width: 'fit-content',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          <PsychologyIcon sx={{ fontSize: '0.875rem', color: '#6B7280' }} />
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontSize: '0.75rem',
              fontWeight: 500,
              userSelect: 'none'
            }}
          >
            已深度思考
          </Typography>
          <Box sx={{/* ...existing styles... */}}>
            {message.showReasoning ?
              <ExpandLessIcon sx={{ fontSize: '0.875rem', color: '#6B7280' }} /> :
              <ExpandMoreIcon sx={{ fontSize: '0.875rem', color: '#6B7280' }} />
            }
          </Box>
        </Box>
        <Collapse in={message.showReasoning}>
          <Box sx={{/* ...existing styles... */}}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                color: '#6B7280',
                fontSize: '0.875rem',
                lineHeight: 2
              }}
            >
              {reasoningContent}
            </Typography>
          </Box>
        </Collapse>
      </Box>
    );
  };

  const renderMessageText = (message, index) => {
    if (message.isUser) {
      return message.text;
    }

    if (currentTypingIndex === index) {
      if (message.isR1 && message.modelType === '671b' && !isTypingReasoning) {
        return null;
      }
      return displayedText;
    }

    // 不再使用全局的 isR1Small 来判断
    // 而是根据消息本身的 modelType 来决定如何显示内容
    let content = message.text || '';

    // 如果是 7B 模型的消息，保留原始内容（包括 think 标签）
    if (message.modelType === '7b') {
      return content;
    }

    return content;
  };

  const renderMessage = (message, index) => (
    <Box
      key={index}
      sx={{
        display: 'flex',
        flexDirection: message.isUser ? 'row-reverse' : 'row',
        mb: 2,
        opacity: message.loading ? 0.5 : 1
      }}
    >
      <Box
        component="img"
        src={message.isUser ? '/user-avatar.png' : '/deepseek-color.png'}
        alt={message.isUser ? 'User Avatar' : 'AI Avatar'}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          mr: message.isUser ? 0 : 2,
          ml: message.isUser ? 2 : 0
        }}
      />
      <Box
        sx={{
          maxWidth: 'calc(100% - 84px)', // 40px(头像) + 2*2px(margin) = 84px
          minWidth: '20%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: message.isUser ? 'flex-end' : 'flex-start',
          position: 'relative',
          '&:hover .message-copy-button': {
            opacity: 1,
            visibility: 'visible',
          }
        }}
      >
        {message.loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            {deepThinking && (
              <Typography variant="body1">正在思考...</Typography>
            )}
          </Box>
        ) : (
          <>
            {message.isR1 && renderReasoningContent(message, index)}
            {(!message.isR1 || (currentTypingIndex !== index) || (currentTypingIndex === index && isTypingReasoning)) && (
              <Box sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              }}>
                {message.isUser && (
                  <Tooltip title="复制">
                    <IconButton
                      className="message-copy-button"
                      size="small"
                      onClick={() => handleCopy(message.text)}
                      sx={{
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.2s',
                        bgcolor: '#f3f4f6',
                        mr: 1,
                        order: 1,
                        width: '28px',
                        height: '28px',
                        '&:hover': {
                          bgcolor: '#e5e7eb',
                        },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: '1rem', color: '#6B7280' }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.isUser ? '#e3f2fd' : '#ffffff',
                    borderRadius: 2,
                    position: 'relative',
                    width: 'fit-content',
                    maxWidth: '100%',
                    order: message.isUser ? 2 : 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {renderMessageText(message, index)}
                  </Typography>
                </Paper>
              </Box>
            )}
            {!message.isUser && !message.loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 1
                }}
              >
                <Tooltip title="复制">
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(message.text)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );

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
        overflowY: 'scroll',  // 始终显示滚动条
        scrollbarGutter: 'stable',  // 保持滚动条空间稳定
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
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
        overflowX: 'hidden',  // 防止水平滚动
      }}>
        <Container
          maxWidth="md"
          sx={{
            margin: '0 auto',
            width: '100%',
            maxWidth: 'calc(100% - 20px)',  // 确保容器不会因为滚动条而改变宽度
          }}
        >
          {messages.map((message, index) => renderMessage(message, index))}
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
            bgcolor: '#f9fafb',
            overflow: 'hidden',
            position: 'relative',
            transition: 'box-shadow 0.2s ease-in-out',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
            },
            '&:focus-within': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          }}
        >
          <Box sx={{
            px: 2,
            pt: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f9fafb',
            position: 'relative',
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
              variant={deepThinking && isR1Small ? "contained" : "outlined"}
              size="small"
              sx={{
                mr: 1,
                borderRadius: 4,
                bgcolor: deepThinking && isR1Small ? '#1d4ed8' : 'transparent',
                '&:hover': {
                  bgcolor: deepThinking && isR1Small ? '#1e40af' : 'rgba(29, 78, 216, 0.04)',
                },
                height: '28px',
                textTransform: 'none',
                fontSize: '13px',
              }}
              onClick={() => {
                if (deepThinking && isR1Small) {
                  // 如果当前是选中状态，则取消选中
                  setDeepThinking(false);
                  setIsR1Small(false);
                } else {
                  // 如果当前是未选中状态，则选中当前按钮，取消另一个按钮
                  setDeepThinking(true);
                  setIsR1Small(true);
                }
              }}
              startIcon={<PsychologyIcon sx={{ fontSize: '1.2rem' }} />}
            >
              DeepSeek R1 (7B)
            </Button>
            <Button
              variant={deepThinking && !isR1Small ? "contained" : "outlined"}
              size="small"
              sx={{
                mr: 1,
                borderRadius: 4,
                bgcolor: deepThinking && !isR1Small ? '#1d4ed8' : 'transparent',
                '&:hover': {
                  bgcolor: deepThinking && !isR1Small ? '#1e40af' : 'rgba(29, 78, 216, 0.04)',
                },
                height: '28px',
                textTransform: 'none',
                fontSize: '13px',
              }}
              onClick={() => {
                if (deepThinking && !isR1Small) {
                  // 如果当前是选中状态，则取消选中
                  setDeepThinking(false);
                  setIsR1Small(false);
                } else {
                  // 如果当前是未选中状态，则选中当前按钮，取消另一个按钮
                  setDeepThinking(true);
                  setIsR1Small(false);
                }
              }}
              startIcon={<PsychologyIcon sx={{ fontSize: '1.2rem' }} />}
            >
              DeepSeek R1 (671B)
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
              startIcon={<LanguageIcon sx={{ fontSize: '1.2rem' }} />}
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
                onClick={isGenerating ? handleStopGeneration : handleSend}
                sx={{
                  bgcolor: isGenerating ? '#ef4444' : '#1d4ed8',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: isGenerating ? '#dc2626' : '#1e40af',
                  },
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isGenerating ? (
                  <StopIcon sx={{ fontSize: '0.9rem' }} />
                ) : (
                  <SendIcon sx={{ fontSize: '0.9rem' }} />
                )}
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
          内容由 AI 生成，请仔细甴别
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