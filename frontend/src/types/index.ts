export enum NodeType {
  INPUT = "custom_input",
  NORMAL = "normal",
}

export interface BaseNodeData {
  type: NodeType;
}

export interface InputNodeData extends BaseNodeData {
  type: NodeType.INPUT;
  column_names: string[];
  source_file?: string; // S3 file path or local file path for the input data

  // Local file specific properties
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_local_file?: boolean;
}
