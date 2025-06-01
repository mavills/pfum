import datetime
from pydantic import BaseModel
from typing import Any, List
from enum import Enum


class NodePropertyType(str, Enum):
    """Types of properties for a node."""

    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ENUM = "enum"
    FILE = "file"
    DATETIME = "datetime"
    LIST = "list"

class Property(BaseModel):
    """Model for a property of a node."""

    name: str
    default: Any
    value: Any
    description: str
    required: bool
    type: str
    enum: List[Any]

class StringProperty(Property):
    """Model for a string property of a node."""

    type: NodePropertyType = NodePropertyType.STRING
    value: str

class NumberProperty(Property):
    """Model for a number property of a node."""

    type: NodePropertyType = NodePropertyType.NUMBER
    value: float

class BooleanProperty(Property):
    """Model for a boolean property of a node."""

    type: NodePropertyType = NodePropertyType.BOOLEAN
    value: bool

class EnumProperty(Property):
    """Model for an enum property of a node."""

    type: NodePropertyType = NodePropertyType.ENUM
    value: str
    enum: List[Any]

class FileProperty(Property):
    """Model for a file property of a node."""

    type: NodePropertyType = NodePropertyType.FILE
    value: str

class DatetimeProperty(Property):
    """Model for a datetime property of a node."""

    type: NodePropertyType = NodePropertyType.DATETIME
    value: datetime.datetime

class ListProperty(Property):
    """Model for a list property of a node."""

    type: NodePropertyType = NodePropertyType.LIST
    value: List[Any]
