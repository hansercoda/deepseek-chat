// r1-671b 的返回格式
{
  "raw_response": {
    "choices": [{
      "message": {
        "role": "assistant",
        "content": "实际内容",
        "reasoning_content": "推理过程"
      }
    }]
  }
}

// r1-671b-search 的返回格式
{
  "raw_response": {
    "choices": [{
      "message": {
        "content": [
          {
            "type": "reasoning",
            "reasoning": {
              "content": "推理过程"
            }
          },
          {
            "type": "text",
            "text": {
              "content": "实际内容"
            }
          }
        ]
      }
    }],
    "httpResult": {
      "data": {
        "webPages": {
          "value": [/* 搜索结果 */]
        }
      }
    }
  }
}

// v3-search 的返回格式（需要确认）
{
  "raw_response": {
    "choices": [{
      "message": {
        "content": "实际内容"
      }
    }],
    "httpResult": {
      "data": {
        "webPages": {
          "value": [/* 搜索结果 */]
        }
      }
    }
  }
}