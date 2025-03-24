import pytest
import pandas as pd
import numpy as np
from app.api.schemas.transform import (
    Node,
    NodeType,
    Position,
    ConnectionHandle,
    InputNodeManualValues,
    OutputNodeManualValues,
    StringConcatNodeManualValues,
)
from app.core.dag import select_subtree, topological_sort, map_node_id_to_node
from app.api.routes.transform import apply_transformation


@pytest.fixture
def sample_df():
    """Create a sample DataFrame for testing."""
    return pd.DataFrame(
        {
            "name": ["John Doe", "Jane Smith"],
            "email": ["john@example.com", "jane@example.com"],
            "id": ["001", "002"],
        }
    )


class TestDAG:
    """Test DAG-related functionality."""

    def test_map_node_id_to_node(self):
        input_node = Node(
            id="input-1",
            type=NodeType.INPUT,
            position=Position(x=0, y=0),
            manual_values=InputNodeManualValues(column_names=["name", "email"]),
            inputs=[],
            outputs=[],
        )

        output_node = Node(
            id="output-1",
            type=NodeType.OUTPUT,
            position=Position(x=300, y=0),
            manual_values=OutputNodeManualValues(entity_type="courses"),
            inputs=[],
            outputs=[],
        )

        nodes = [input_node, output_node]
        node_map = map_node_id_to_node(nodes)

        assert len(node_map) == 2
        assert node_map["input-1"] == input_node
        assert node_map["output-1"] == output_node

    def test_select_subtree(self):
        # Define test nodes
        input_node = Node(
            id="input-1",
            type=NodeType.INPUT,
            position=Position(x=0, y=0),
            manual_values=InputNodeManualValues(column_names=["name", "email"]),
            inputs=[],
            outputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                )
            ],
        )

        string_concat_node = Node(
            id="concat-1",
            type=NodeType.STRING_CONCAT,
            position=Position(x=150, y=0),
            manual_values=StringConcatNodeManualValues(
                separator="-", input_1="", input_2=""
            ),
            inputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                )
            ],
            outputs=[
                ConnectionHandle(
                    id="edge-2",
                    source_node="concat-1",
                    source_handle="output",
                    target="output-1",
                    target_handle="name",
                )
            ],
        )

        output_node = Node(
            id="output-1",
            type=NodeType.OUTPUT,
            position=Position(x=300, y=0),
            manual_values=OutputNodeManualValues(entity_type="courses"),
            inputs=[
                ConnectionHandle(
                    id="edge-2",
                    source_node="concat-1",
                    source_handle="output",
                    target="output-1",
                    target_handle="name",
                )
            ],
            outputs=[],
        )

        nodes = {
            "input-1": input_node,
            "output-1": output_node,
            "concat-1": string_concat_node,
        }

        # Test selecting from output node (should include all nodes)
        subtree = select_subtree(output_node, nodes)
        assert len(subtree) == 3

        # Test selecting from input node (should only include input)
        subtree = select_subtree(input_node, nodes)
        assert len(subtree) == 1
        assert "input-1" in subtree


class TestNodeTransformations:
    """Test individual node transformations."""

    def test_input_node(self, sample_df):
        input_node = Node(
            id="input-1",
            type=NodeType.INPUT,
            position=Position(x=0, y=0),
            manual_values=InputNodeManualValues(column_names=["name", "email", "id"]),
            inputs=[],
            outputs=[],
        )

        result = apply_transformation([input_node], sample_df, input_node.id)

        expected_columns = [f"input-1-column-{i}" for i in range(3)]
        assert all(col in result.columns for col in expected_columns)
        assert len(result) == len(sample_df)

    def test_string_concat_node(self, sample_df):
        input_node = Node(
            id="input-1",
            type=NodeType.INPUT,
            position=Position(x=0, y=0),
            manual_values=InputNodeManualValues(column_names=["name", "email"]),
            inputs=[],
            outputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                ),
                ConnectionHandle(
                    id="edge-2",
                    source_node="input-1",
                    source_handle="column-1",
                    target="concat-1",
                    target_handle="input-2",
                ),
            ],
        )

        string_concat_node = Node(
            id="concat-1",
            type=NodeType.STRING_CONCAT,
            position=Position(x=150, y=0),
            manual_values=StringConcatNodeManualValues(
                separator="-", input_1="", input_2=""
            ),
            inputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                ),
                ConnectionHandle(
                    id="edge-2",
                    source_node="input-1",
                    source_handle="column-1",
                    target="concat-1",
                    target_handle="input-2",
                ),
            ],
            outputs=[],
        )

        nodes = [input_node, string_concat_node]
        result = apply_transformation(nodes, sample_df, string_concat_node.id)

        expected_column = f"{string_concat_node.id}-output"
        assert expected_column in result.columns
        assert result[expected_column].iloc[0] == "John Doe-john@example.com"

    def test_null_values(self, sample_df):
        df_with_nulls = pd.DataFrame(
            {
                "name": ["John Doe", None],
                "email": ["john@example.com", "jane@example.com"],
                "id": ["001", "002"],
            }
        )

        input_node = Node(
            id="input-1",
            type=NodeType.INPUT,
            position=Position(x=0, y=0),
            manual_values=InputNodeManualValues(column_names=["name", "email"]),
            inputs=[],
            outputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                ),
                ConnectionHandle(
                    id="edge-2",
                    source_node="input-1",
                    source_handle="column-1",
                    target="concat-1",
                    target_handle="input-2",
                ),
            ],
        )

        string_concat_node = Node(
            id="concat-1",
            type=NodeType.STRING_CONCAT,
            position=Position(x=150, y=0),
            manual_values=StringConcatNodeManualValues(
                separator="-", input_1="", input_2=""
            ),
            inputs=[
                ConnectionHandle(
                    id="edge-1",
                    source_node="input-1",
                    source_handle="column-0",
                    target="concat-1",
                    target_handle="input-1",
                ),
                ConnectionHandle(
                    id="edge-2",
                    source_node="input-1",
                    source_handle="column-1",
                    target="concat-1",
                    target_handle="input-2",
                ),
            ],
            outputs=[],
        )

        nodes = [input_node, string_concat_node]
        result = apply_transformation(nodes, df_with_nulls, string_concat_node.id)

        assert not result.isna().all().any()  # No completely null columns


def test_cyclic_graph():
    """Test that cyclic graphs are detected and raise an error."""
    input_node = Node(
        id="node_0",
        type=NodeType.INPUT,
        position=Position(x=0, y=0),
        manual_values=InputNodeManualValues(column_names=["name"]),
        inputs=[],
        outputs=[
            ConnectionHandle(
                id="edge-node_0-column-0-node_2-input-1",
                source_handle="column-0",
                target="node_2",
                target_handle="input-1",
            )
        ],
    )

    # Create a cycle by making the concat node input depend on its output
    string_concat_node = Node(
        id="node_2",
        type=NodeType.STRING_CONCAT,
        position=Position(x=150, y=0),
        manual_values=StringConcatNodeManualValues(
            separator="-", input_1="", input_2=""
        ),
        inputs=[
            ConnectionHandle(
                id="edge-node_0-column-0-node_2-input-1",
                source_node="node_0",
                source_handle="column-0",
                target_handle="input-1",
            ),
            ConnectionHandle(
                id="edge-node_2-output-node_2-input-2",
                source_node="node_2",
                source_handle="output",
                target_handle="input-2",
            ),
        ],
        outputs=[
            ConnectionHandle(
                id="edge-node_2-output-node_2-input-2",
                source_handle="output",
                target="node_2",
                target_handle="input-2",
            ),
        ],
    )

    with pytest.raises(ValueError, match="cycle"):
        nodes = [input_node, string_concat_node]
        apply_transformation(nodes, pd.DataFrame(), string_concat_node.id)
