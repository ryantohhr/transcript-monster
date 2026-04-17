import logging
from collections.abc import AsyncIterator

from langchain_core.messages import AIMessageChunk, BaseMessage
from langgraph.graph import END, START, StateGraph

from app.services.ai.llm import get_llm
from app.services.ai.prompts import chat_prompt
from app.services.ai.state import AgentState

logger = logging.getLogger(__name__)


async def llm_node(state: AgentState) -> dict:
    """Invoke the LLM with the current conversation state.

    The transcript context is injected into the system prompt via the
    ``chat_prompt`` template before the call is made.
    """
    llm = get_llm(streaming=True)
    chain = chat_prompt | llm

    logger.debug("Invoking LLM node with %d messages", len(state["messages"]))

    response: BaseMessage | None = None
    async for chunk in chain.astream(
        {
            "transcript_context": state["transcript_context"],
            "messages": state["messages"],
        }
    ):
        response = chunk if response is None else response + chunk

    return {"messages": [response]}


def build_graph() -> StateGraph:
    """Construct and compile the Q&A agent graph."""
    graph = StateGraph(AgentState)
    graph.add_node("llm_node", llm_node)
    graph.add_edge(START, "llm_node")
    graph.add_edge("llm_node", END)
    return graph.compile()


agent_graph = build_graph()


async def stream_agent_response(
    messages: list[BaseMessage],
    transcript_context: str,
) -> AsyncIterator[str]:
    """Stream the agent's response token by token.

    Args:
        messages: Full conversation history (user + assistant turns).
        transcript_context: The transcript text to ground the agent.

    Yields:
        Individual text tokens as they are produced by the LLM.
    """
    initial_state: AgentState = {
        "messages": messages,
        "transcript_context": transcript_context,
    }

    async for event in agent_graph.astream_events(initial_state, version="v2"):
        if event["event"] == "on_chat_model_stream":
            chunk: AIMessageChunk = event["data"]["chunk"]
            token = chunk.content
            if isinstance(token, str) and token:
                yield token
