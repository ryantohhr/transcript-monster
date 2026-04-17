from typing import Annotated

from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class AgentState(TypedDict):
    """State carried through the LangGraph execution graph.

    Attributes:
        messages: Accumulated conversation messages. The ``add_messages``
            reducer appends new messages rather than replacing the list,
            which is the standard LangGraph pattern for chat agents.
        transcript_context: The full transcript text injected as context
            into the system prompt. Immutable across a session.
    """

    messages: Annotated[list[AnyMessage], add_messages]
    transcript_context: str