export interface Operator {
  title: string;
  icon?: string; // optional icon, from a list of allowed icons
  description: string; // markdown-allowed help description
  category: string; // category of the operator, used for grouping and filtering operations
  id: string; // unique identifier of the template
  type: string; // a generic type name that can be used later to see which template "type" was used
  groups?: string[]; // define a list of groups, ordered. If not specified, ordered alphabetically

  inputs: Input[];
  outputs: Output[];
  config: Config;
}

export interface ValidationRules {
  regex?: string; // for example, regex validation
  enum?: string[]; // or when type is "enum" (a string with fixed values), list the different accepted values
}

export interface Input {
  id: string; // making this input unique per template, will be used to fill in the steps
  type: string; // indicates the type of the input, forcing connections to be of a certain type
  name: string; // will be used to display what this input is about
  description: string; // helper text for rendering documentation in the node-editor
  validation: ValidationRules; // extra validation rules to be applied
  group?: string; // group inputs and outputs together for easier interface manipulation
  position?: number; // int used to sort inputs and outputs by; a bit like a z-index in css
  default: any; // a default value that is set when the node is created
  editable: boolean; // indicates if the edit option should be available
  required: boolean; // some inputs do not make sense to be empty

  value?: any; // TODO: type is any for now, but we can define it once we know the types
}

export interface Output {
  id: string;
  type: string;
  name: string;
  description: string; // helper text for rendering documentation in the node-editor
  group?: string; // group inputs and outputs together for easier interface manipulation
  position?: number; // similar to inputs, used to re-order
  editable?: boolean; // happens in the case of custom inputs to the system
}

export interface Config {
  variables: string[];
  steps: ConfigStep[];
}

export interface ConfigStep {
  id: string;
  type: string;
  name: string;
  description: string;
}
