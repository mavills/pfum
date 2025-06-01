from typing import Any, ClassVar
from pydantic import BaseModel, Field
from enum import Enum

from backend.lib.properties import EnumProperty, NodePropertyType, Property, StringProperty


class NodeType(str, Enum):
    """Types of nodes in a transformation flow."""

    INPUT = "input"
    OUTPUT = "output"
    CONSTANT = "constant"
    STRING_CONCAT = "string_concat"
    STRING_REPLACE = "string_replace"
    STRING_SPLIT = "string_split"
    HASH = "hash"


class Position(BaseModel):
    """Position of a node in the flow editor."""

    x: float
    y: float

class NodeProperty(BaseModel):
    """Model for a property of a node."""

    property: Property
    enable_input: bool
    enable_output: bool


class NodeMeta(type(BaseModel)):
    """Metaclass for Node that collects NodeProperty fields."""
    
    def __new__(mcs: type, name: str, bases: tuple[type, ...], namespace: dict[str, Any]):
        # This method is called when a new class using this metaclass is being created
        # Parameters:
        # - mcs: the metaclass itself (NodeMeta)
        # - name: the name of the class being created (e.g., "InputNode", "OutputNode")
        # - bases: tuple of base classes the new class inherits from
        # - namespace: dictionary containing class attributes and methods
        
        # First, create the class normally using the parent metaclass (type(BaseModel))
        # This creates the actual class object with all its standard attributes and methods
        cls = super().__new__(mcs, name, bases, namespace)
        
        # Skip processing for the base Node class itself
        # We only want to collect NodeProperty fields from subclasses of Node
        if name == 'Node':
            return cls
            
        # Initialize a dictionary to store all NodeProperty fields
        # This will map field names to their NodeProperty instances
        node_properties: dict[str, NodeProperty] = {}
        
        # We need to collect NodeProperty fields from parent classes first
        # __mro__ is the Method Resolution Order - the order Python searches for attributes in inheritance
        # We use reversed() to start from the most basic parent class and move toward more specific ones
        for base in reversed(cls.__mro__):
            # Check if this class has type annotations (defined with : syntax)
            if hasattr(base, '__annotations__'):
                # Loop through each annotated field in this class
                for field_name, field_type in base.__annotations__.items():
                    # Check if this field exists in the class dictionary and is a NodeProperty
                    if field_name in base.__dict__ and isinstance(base.__dict__[field_name], NodeProperty):
                        # Add it to our collection, or override if already present
                        node_properties[field_name] = base.__dict__[field_name]
        
        # After collecting from parent classes, collect from the current class being created
        # This ensures that if a child class overrides a NodeProperty, we use the child's version
        if hasattr(cls, '__annotations__'):
            for field_name, field_type in cls.__annotations__.items():
                # Check if this field exists in the namespace and is a NodeProperty
                if field_name in namespace and isinstance(namespace[field_name], NodeProperty):
                    node_properties[field_name] = namespace[field_name]
        
        # Store all collected NodeProperty instances in a class attribute
        # This makes them easily accessible later when creating instances
        cls.__node_properties__ = list(node_properties.values())
        
        # Return the fully configured class
        return cls

# Update the Node class to use the metaclass
class Node(BaseModel, metaclass=NodeMeta):
    """Model for a node in a transformation flow."""
    
    id: str
    type: NodeType
    position: Position
    properties: list[NodeProperty] = Field(default_factory=list)
    
    __node_properties__: ClassVar[list[NodeProperty]] = []
    
    def __init__(self, **data):
        super().__init__(**data)
        # Add class-defined properties to the instance properties list if not already present
        property_ids = {id(prop) for prop in self.properties}
        for prop in self.__class__.__node_properties__:
            if id(prop) not in property_ids:
                self.properties.append(prop)
                property_ids.add(id(prop))

class InputNode(Node):
    """Model for an input node in a transformation flow."""
    pass

class OutputNode(Node):
    """Model for an output node in a transformation flow."""
    pass

class ConstantNode(Node):
    """Model for a constant node in a transformation flow."""
    constant_type: NodeProperty
    constant: NodeProperty

class StringConcatNode(Node):
    """Model for a string concatenation node in a transformation flow."""
    input_1: NodeProperty
    input_2: NodeProperty
    output: NodeProperty

class StringReplaceNode(Node):
    """Model for a string replace node in a transformation flow."""
    input: NodeProperty
    search: NodeProperty
    replace: NodeProperty
    output: NodeProperty

class StringSplitNode(Node):
    """Model for a string split node in a transformation flow."""
    input: NodeProperty
    delimiter: NodeProperty
    output: NodeProperty

class HashNode(Node):
    """Model for a hash node in a transformation flow."""
    pass