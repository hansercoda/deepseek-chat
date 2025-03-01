const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// DeepSeek Chat API - v3 版本 (默认模式)
app.post('/api/chat/deepseek-v3', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message }
            ],
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            }
        });

        console.log('DeepSeek API Response:', response.data);

        res.json({
            success: true,
            response: response.data.choices[0].message.content,
            raw_response: response.data
        });

    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: '服务器错误',
            details: error.response?.data || error.message
        });
    }
});

// DeepSeek Chat API - R1 版本 (深度思考模式)
app.post('/api/chat/deepseek-r1', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('\n=== R1 API Request ===');
        console.log('Received message:', message);

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-reasoner",
            messages: [
                { 
                    role: "system", 
                    content: "你是一个深度思考的智能助手。请按照以下格式回复：\n1. 首先提供详细的推理过程，分析问题的各个方面\n2. 然后用两个换行符分隔\n3. 最后给出最终答案\n\n请确保使用用户的输入语言进行回复。" 
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            }
        });

        console.log('\n=== R1 API Response ===');
        console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

        // 分析响应内容，将其分为推理过程和最终答案
        const fullContent = response.data.choices[0].message.content;
        console.log('\n=== Full Content ===');
        console.log(fullContent);

        let reasoningContent = '';
        let finalContent = '';

        // 尝试分离推理过程和最终答案
        const parts = fullContent.split('\n\n');
        if (parts.length > 1) {
            reasoningContent = parts[0];
            finalContent = parts.slice(1).join('\n\n');
            
            console.log('\n=== Separated Content ===');
            console.log('Reasoning Content:', reasoningContent);
            console.log('\nFinal Content:', finalContent);
        } else {
            // 如果没有明确的分隔，尝试查找其他分隔标记
            const possibleSeparators = ['结论：', '最终答案：', '答案：', '总结：'];
            for (const separator of possibleSeparators) {
                if (fullContent.includes(separator)) {
                    const [reasoning, ...rest] = fullContent.split(separator);
                    reasoningContent = reasoning.trim();
                    finalContent = separator + rest.join(separator).trim();
                    break;
                }
            }
            
            // 如果仍然没有找到分隔，使用整个内容作为最终答案
            if (!reasoningContent && !finalContent) {
                finalContent = fullContent;
            }
            
            console.log('\n=== Separated Content (Alternative) ===');
            console.log('Reasoning Content:', reasoningContent);
            console.log('\nFinal Content:', finalContent);
        }

        const responseData = {
            success: true,
            response: finalContent,
            reasoning_content: reasoningContent,
            raw_response: response.data
        };

        console.log('\n=== Final Response to Client ===');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('================\n');

        res.json(responseData);
    } catch (error) {
        console.error('\n=== R1 API Error ===');
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: '服务器错误',
            details: error.response?.data || error.message
        });
    }
});

// DeepSeek Chat API - R1 with Search (深度思考+联网搜索模式)
app.post('/api/chat/deepseek-r1-search', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message (R1+Search):', message);

        // 这里可以添加网络搜索的逻辑
        const searchResults = ""; // 实现搜索功能后替换

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-reasoner",
            messages: [
                { 
                    role: "system", 
                    content: "You are a thoughtful assistant with access to current information. First, analyze the search results and provide your reasoning. Then, provide your final answer. Separate the reasoning and answer with a double newline." 
                },
                { role: "user", content: `Based on this search context: ${searchResults}\n\nUser question: ${message}` }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            }
        });

        // 分析响应内容，将其分为推理过程和最终答案
        const fullContent = response.data.choices[0].message.content;
        let reasoningContent = '';
        let finalContent = '';

        // 尝试分离推理过程和最终答案
        const parts = fullContent.split('\n\n');
        if (parts.length > 1) {
            reasoningContent = parts[0];
            finalContent = parts.slice(1).join('\n\n');
        } else {
            finalContent = fullContent;
        }

        res.json({
            success: true,
            response: finalContent,
            reasoning_content: reasoningContent,
            raw_response: response.data
        });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: '服务器错误',
            details: error.response?.data || error.message
        });
    }
});

// DeepSeek Chat API - V3 with Search (联网搜索模式)
app.post('/api/chat/deepseek-v3-search', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message (V3+Search):', message);

        // 这里可以添加网络搜索的逻辑
        const searchResults = ""; // 实现搜索功能后替换

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant with access to current information." },
                { role: "user", content: `Based on this search context: ${searchResults}\n\nUser question: ${message}` }
            ],
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            }
        });

        res.json({
            success: true,
            response: response.data.choices[0].message.content,
            raw_response: response.data
        });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: '服务器错误',
            details: error.response?.data || error.message
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});