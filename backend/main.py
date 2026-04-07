from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE ----------------
database = []

# ---------------- AI LOGIC ----------------
def ai_process(text):
    text_lower = text.lower()

    summary = f"Interaction: {text}"

    if "good" in text_lower or "interested" in text_lower:
        sentiment = "positive"
    elif "bad" in text_lower or "issue" in text_lower:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    if "follow" in text_lower:
        follow_up = "Follow-up in 2 weeks"
    else:
        follow_up = "No follow-up needed"

    return {
        "summary": summary,
        "sentiment": sentiment,
        "follow_up": follow_up
    }

# ---------------- TOOLS ----------------
def log_tool(state):
    database.append(state["input"])
    return {"tool": "log", "msg": "Saved"}

def edit_tool(state):
    return {"tool": "edit", "msg": "Edited"}

def followup_tool(state):
    return {"tool": "followup", "msg": "Follow-up suggested"}

def search_tool(state):
    return {"tool": "search", "data": database}

def insight_tool(state):
    return {"tool": "insight", "msg": "Doctor shows interest"}

# ---------------- LANGGRAPH ----------------
workflow = StateGraph(dict)

workflow.add_node("log", log_tool)
workflow.add_node("edit", edit_tool)
workflow.add_node("followup", followup_tool)
workflow.add_node("search", search_tool)
workflow.add_node("insight", insight_tool)

workflow.set_entry_point("log")

graph = workflow.compile()

# ---------------- API ----------------
class ChatInput(BaseModel):
    message: str

@app.get("/")
def home():
    return {"msg": "Backend Running"}

@app.post("/chat")
def chat(input: ChatInput):

    text = input.message.lower()

    if "edit" in text:
        action = "edit"
    elif "history" in text:
        action = "search"
    elif "follow" in text:
        action = "followup"
    elif "log" in text:
        action = "log"
    else:
        action = "insight"

    ai_output = ai_process(input.message)

    tool_output = graph.invoke({
        "input": input.message,
        "action": action
    })

    return {
        "ai_output": ai_output,
        "tool_output": tool_output
    }