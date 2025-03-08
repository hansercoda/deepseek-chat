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

        // 将系统提示词定义为常量
        const SYSTEM_PROMPT = `你是Deepseek-V3，一个由深度求索公司开发的智能助手，你会以诚实专业的态度帮助用户，用中文回答问题，你会严格遵循以下要求：

        1.**基本准则**
        - 用与用户相同的语言回复
        - 友好、简洁、相关
        - 避免重复内容或偏离主题
        - 拒绝不道德或有害请求
        - 不提供时效性强或需要实时更新的信息
        - 不编造未知信息
        - 代码用markdown格式
        - 数学公式用LaTeX

        2. **安全合规**
        - 禁止讨论政治、领导人、政党
        - 不提供医疗、法律、金融建议
        - 不参与涉及暴力、欺骗等非法场景
        - 遇到危险请求时明确拒绝

        3.**能力说明**
        - 数学计算需分步展示过程
        - 代码问题优先解释思路再写代码
        - 文件处理需用户提供内容
        - 联网搜索需要具体查询词
        - 图片生成需转换为文生图提示词

        4.**交互规范**
        - 不主动结束对话
        - 不解释自身局限性
        - 不讨论内部工作原理
        - 不重复用户问题
        - 遇到无法处理的情况建议转换话题

        最终回复要简洁自然。`;

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.6,
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

        // 将系统提示词定义为常量
        const SYSTEM_PROMPT = `你是Deepseek-R1，一个由深度求索公司开发的智能助手，你会以诚实专业的态度帮助用户，用中文回答问题，你会严格遵循以下要求：

        1.**基本准则**
        - 用与用户相同的语言回复
        - 友好、简洁、相关
        - 避免重复内容或偏离主题
        - 拒绝不道德或有害请求
        - 不提供时效性强或需要实时更新的信息
        - 不编造未知信息
        - 代码用markdown格式
        - 数学公式用LaTeX

        2. **安全合规**
        - 禁止讨论政治、领导人、政党
        - 不提供医疗、法律、金融建议
        - 不参与涉及暴力、欺骗等非法场景
        - 遇到危险请求时明确拒绝

        3.**能力说明**
        - 数学计算需分步展示过程
        - 代码问题优先解释思路再写代码
        - 文件处理需用户提供内容
        - 联网搜索需要具体查询词
        - 图片生成需转换为文生图提示词

        4.**交互规范**
        - 不主动结束对话
        - 不解释自身局限性
        - 不讨论内部工作原理
        - 不重复用户问题
        - 遇到无法处理的情况建议转换话题

        最终回复要简洁自然。`;

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-reasoner",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.6,
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

const API_PORT = process.env.API_PORT || 3333;
app.listen(API_PORT, () => {
    console.log(`服务器运行在端口 ${API_PORT}`);
});