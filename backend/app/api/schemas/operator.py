from typing import Any, Dict, List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ValidationRules(BaseModel):
    """Validation rules for inputs."""
    regex: Optional[str] = None
    enum: Optional[List[str]] = None


class Input(BaseModel):
    """Input definition for an operator."""
    id: str
    type: str
    name: str
    description: str
    validation: ValidationRules = Field(default_factory=ValidationRules)
    group: Optional[str] = None
    position: Optional[int] = None
    default: Any = None
    editable: bool = True
    required: bool = False
    value: Any = None


class Output(BaseModel):
    """Output definition for an operator."""
    id: str
    type: str
    name: str
    description: str
    group: Optional[str] = None
    position: Optional[int] = None
    editable: Optional[bool] = None


class ConfigStep(BaseModel):
    """Configuration step for an operator."""
    id: str
    type: str
    name: str
    description: str


class Config(BaseModel):
    """Configuration for an operator."""
    variables: List[str] = Field(default_factory=list)
    steps: List[ConfigStep] = Field(default_factory=list)


class Operator(BaseModel):
    """Main operator definition matching frontend interface."""
    title: str
    icon: Optional[str] = None
    description: str
    category: str
    id: str
    type: str
    groups: Optional[List[str]] = None
    inputs: List[Input]
    outputs: List[Output]
    config: Config 