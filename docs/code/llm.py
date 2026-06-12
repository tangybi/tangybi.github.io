#%%

import re
import os
import ast
import inspect
from openai import OpenAI
import requests

def get_weather(city: str) -> str:
    """
    通过调用 wttr.in API 查询真实的天气信息。
    """
    # API端点，我们请求JSON格式的数据
    url = f"https://wttr.in/{city}?format=j1"
    
    try:
        # 发起网络请求
        response = requests.get(url)
        # 检查响应状态码是否为200 (成功)
        response.raise_for_status() 
        # 解析返回的JSON数据
        data = response.json()
        
        # 提取当前天气状况
        current_condition = data['current_condition'][0]
        weather_desc = current_condition['weatherDesc'][0]['value']
        temp_c = current_condition['temp_C']
        
        # 格式化成自然语言返回
        return f"{city}当前天气:{weather_desc}，气温{temp_c}摄氏度"
        
    except requests.exceptions.RequestException as e:
        # 处理网络错误
        return f"错误:查询天气时遇到网络问题 - {e}"
    except (KeyError, IndexError) as e:
        # 处理数据解析错误
        return f"错误:解析天气数据失败，可能是城市名称无效 - {e}"
 
get_weather('北京')

#%%
# 联网搜索开关（DeepSeek 内置搜索）
ENABLE_WEB_SEARCH = True

AGENT_SYSTEM_PROMPT = """你是一个能调用工具的智能助手。你必须严格按照以下格式输出：

Thought: 在这里写下你的思考过程...
Action: 调用工具的函数名(参数)

可用的工具:
- get_weather(city: str) - 查询指定城市的实时天气
- get_attraction(city: str, weather: str) - 根据城市和天气推荐景点

如果任务完成，使用 Finish 动作结束：
Action: Finish[最终答案]

注意：
- 每次只能输出一个 Thought 和一个 Action
- Action 必须是上述工具之一
- 不要在 Action 之后附加任何额外内容
- 等待 Observation 之后再输出下一个 Thought/Action"""
API_KEY = os.environ.get('DEEPSEEK_API_KEY')
BASE_URL = "https://api.deepseek.com"
MODEL_ID = "deepseek-v4-flash"

class OpenAICompatibleClient:
    def __init__(self, model: str, api_key: str, base_url: str):
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)
    
    def generate(self, prompt: str, system_prompt: str, enable_search: bool = False) -> str:
        print("正在调用大语言模型..." + ("（已开启联网搜索）" if enable_search else ""))
        try:
            messages = [
                {'role': 'system', 'content': system_prompt},
                {
                    'role': 'user', 'content': prompt
                }
            ]
            extra_kwargs = {}
            if enable_search:
                extra_kwargs["extra_body"] = {"enable_search": True}
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                **extra_kwargs
            )
            answer = response.choices[0].message.content
            print("大语言模型响应成功。")
            return answer
        except Exception as e:
            print(f"调用LLM API时发生错误: {e}")
            return "错误:调用语言模型服务时出错。"
        
   
def get_attraction(city: str, weather: str) -> str:
    """
    根据城市和天气，使用 DeepSeek 联网搜索功能推荐景点。
    """
    client = OpenAICompatibleClient(model=MODEL_ID,
                                    api_key=API_KEY,
                                    base_url=BASE_URL)
    
    prompt = f"""请搜索并推荐 '{city}' 在 '{weather}' 天气下最值得去的旅游景点。
请给出景点名称、推荐理由和实用建议。
如果搜索结果中有相关信息，请基于搜索到的内容回答。"""
    
    return client.generate(prompt=prompt, system_prompt="你是一个旅游推荐助手。", enable_search=True)
    
# 将所有工具函数放入一个字典，方便后续调用
available_tools = {
    "get_weather": get_weather,
    "get_attraction": get_attraction,
}

llm = OpenAICompatibleClient(
    model=MODEL_ID,
    api_key=API_KEY,
    base_url=BASE_URL
)

# --- 2. 初始化 ---
user_prompt = "你好，请帮我查询一下今天北京的天气，然后根据天气推荐一个合适的旅游景点。"
prompt_history = [f"用户请求: {user_prompt}"]

print(f"用户输入: {user_prompt}\n" + "="*40)


# --- 3. 运行主循环 ---
for i in range(5): # 设置最大循环次数
    print(f"--- 循环 {i+1} ---\n")
    
    # 3.1. 构建Prompt
    full_prompt = "\n".join(prompt_history)
    
    # 3.2. 调用LLM进行思考
    llm_output = llm.generate(full_prompt, system_prompt=AGENT_SYSTEM_PROMPT, enable_search=ENABLE_WEB_SEARCH)
    # 模型可能会输出多余的Thought-Action，需要截断
    match = re.search(r'(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|\Z)', llm_output, re.DOTALL)
    if match:
        truncated = match.group(1).strip()
        if truncated != llm_output.strip():
            llm_output = truncated
            print("已截断多余的 Thought-Action 对")
    print(f"模型输出:\n{llm_output}\n")
    prompt_history.append(llm_output)
    
    # 3.3. 解析并执行行动
    action_match = re.search(r"Action: (.*)", llm_output, re.DOTALL)
    if not action_match:
        observation = "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。"
        observation_str = f"Observation: {observation}"
        print(f"{observation_str}\n" + "="*40)
        prompt_history.append(observation_str)
        continue
    action_str = action_match.group(1).strip()

    if action_str.startswith("Finish"):
        finish_match = re.match(r"Finish\[(.*)\]", action_str)
        if finish_match:
            final_answer = finish_match.group(1)
            print(f"任务完成，最终答案: {final_answer}")
        else:
            print(f"任务完成（无详细答案）")
        break
    
    tool_match = re.search(r"(\w+)\(", action_str)
    if not tool_match:
        observation = "错误: 未能解析到工具调用，请确保 Action 格式为 ToolName(args)"
        observation_str = f"Observation: {observation}"
        print(f"{observation_str}\n" + "="*40)
        prompt_history.append(observation_str)
        continue
    tool_name = tool_match.group(1)
    args_match = re.search(r"\((.*)\)", action_str)
    args_str = args_match.group(1) if args_match else ""

    if tool_name in available_tools:
        func = available_tools[tool_name]
        try:
            # 按顶层逗号分割参数字符串
            parts = []
            depth = 0
            buf = []
            for ch in args_str:
                if ch in '({[':
                    depth += 1
                    buf.append(ch)
                elif ch in ')}]':
                    depth -= 1
                    buf.append(ch)
                elif ch == ',' and depth == 0:
                    parts.append(''.join(buf).strip())
                    buf = []
                else:
                    buf.append(ch)
            if buf:
                parts.append(''.join(buf).strip())

            # 解析每个参数：支持位置参数和 key=value 关键字参数
            pos_args = []
            kw_args = {}
            for part in parts:
                if not part:
                    continue
                if '=' in part:
                    key, val = part.split('=', 1)
                    kw_args[key.strip()] = ast.literal_eval(val.strip())
                else:
                    pos_args.append(ast.literal_eval(part.strip()))

            # 通过函数签名绑定参数，自动处理位置/关键字参数映射
            sig = inspect.signature(func)
            bound = sig.bind(*pos_args, **kw_args)
            observation = func(*bound.args, **bound.kwargs)
        except TypeError as e:
            observation = f"错误: 调用 {tool_name} 时参数不匹配 - {e}"
        except Exception as e:
            observation = f"错误: 解析参数时出现问题 - {e}"
    else:
        observation = f"错误:未定义的工具 '{tool_name}'"

    # 3.4. 记录观察结果
    observation_str = f"Observation: {observation}"
    print(f"{observation_str}\n" + "="*40)
    prompt_history.append(observation_str)


#%%
# Python SDK 极简示例

from agent_framework.github import GitHubCopilotAgent

async def main():
    # 1. 创建一个 Agent 实例，并设定它的“人设”
    agent = GitHubCopilotAgent(
        default_options={
            "instructions": "你是一个专业的代码助手，能用中文回答问题。"
        },
    )

    # 2. 与 Agent 交互
    async with agent:
        result = await agent.run("用一句话介绍什么是智能体")
        print(result)