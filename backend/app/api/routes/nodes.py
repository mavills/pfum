from fastapi import APIRouter, UploadFile, File, HTTPException, status
import json
import os
from pathlib import Path

from pydantic import BaseModel

from app.api.schemas.graphs import ExportedGraph
from app.logger import get_logger
from app.services.graph_service import GraphService
from app.services.file_service import file_service

logger = get_logger("api.nodes")
router = APIRouter()

# Path to the operators directory
OPERATORS_DIR = Path(__file__).parent.parent / "operators"


@router.get(
    "/",
    summary="Get all node operators",
    description="Returns a list of all operator objects available in the operators directory",
)
async def get_all_nodes():
    """
    Get all available node operators from the operators directory.
    """
    logger.info("Fetching all node operators")

    operators = []

    # Check if operators directory exists
    if not OPERATORS_DIR.exists():
        logger.error(f"Operators directory not found: {OPERATORS_DIR}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operators directory not found",
        )
    operator_files = os.listdir(OPERATORS_DIR)
    logger.info(f"Operators: {operator_files}")
    for operator in operator_files:
        if operator.endswith(".json"):
            operator_path = OPERATORS_DIR / operator
            operator_data = json.load(open(operator_path, "r"))
            operators.append(operator_data)

    return {"operators": operators, "count": len(operators)}


@router.post(
    "/file",
    summary="Upload and process file",
    description="Upload a file and return a JSON response based on the file contents",
)
async def upload_and_process_file(file: UploadFile = File(...)):
    """
    Upload a file and return a JSON response based on its contents.
    Supports JSON files and CSV files (returns structure information).
    """
    logger.info(f"Processing uploaded file: {file.filename}")

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file",
        )
    # Upload the file
    file_info = await file_service.upload_csv_file(file)
    operator = file_service.generate_node_template_file(file_info.file_id)
    return operator


class UpdateNodeRequest(BaseModel):
    node_id: str
    graph: ExportedGraph


@router.patch(
    "/update",
    summary="Update a node",
    description="Update a node based on a user action",
)
async def update_node(request: UpdateNodeRequest):
    """
    Update a node with a new file.
    """
    # return graph_service.process_graph(graph)
    updated_nodes = [node for node in request.graph.nodes if node.id == request.node_id]
    if not updated_nodes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found",
        )
    updated_node = updated_nodes[0]
    operator = updated_node.operator
    if operator["type"] == "join":
        print("join")
        graph_service = GraphService(request.graph)

        left_dataframe = None
        right_dataframe = None
        for edge in request.graph.edges:
            if edge.target_node_id == request.node_id:
                if edge.target_handle_id == "left-dataframe":
                    left_dataframe = edge.source_node_id
                elif edge.target_handle_id == "right-dataframe":
                    right_dataframe = edge.source_node_id

        operator["outputs"] = []
        if left_dataframe is not None:
            graph_service.select_subtree(left_dataframe)
            left_dataframe_operators = graph_service.topological_sort()
            print(left_dataframe_operators)
            for l_o in left_dataframe_operators[::-1]:
                if l_o.operator["type"] in ["join", "csv_input", "manual-input"]:
                    operator["outputs"] += l_o.operator["outputs"]
                    print(operator["outputs"])
                    break
        if right_dataframe is not None:
            graph_service.select_subtree(right_dataframe)
            right_dataframe_operators = graph_service.topological_sort()
            print(right_dataframe_operators)
            for r_o in right_dataframe_operators[::-1]:
                if r_o.operator["type"] in ["join", "csv_input", "manual-input"]:
                    operator["outputs"] += r_o.operator["outputs"]
                    print(operator["outputs"])
                    break

    return {"operator": operator}
