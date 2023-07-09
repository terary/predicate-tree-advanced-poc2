/**
 * Probably not producation quality
 *  - probably some field types are missing properties
 *  - field value datatypes are known to have issues from the source
 *         eg: things like option array can be a list of options [...], empty list ([]), null, or empty string
 *       this has been a long-standing issue that likely manifiests into to "can not read ... from 'undefined'" errors
 *
 * This field/property list is meant to be "best effort" and exhausted, but is likely imperfect
 *
 */

type TFsFieldType =
  | "address"
  | "checkbox"
  | "creditcard"
  | "datetime"
  | "email"
  | "embed"
  | "file"
  | "matrix"
  | "section"
  | "select"
  | "signature"
  | "text"
  | "textarea"
  | "name"
  | "number"
  | "phone"
  | "product"
  | "radio"
  | "rating"
  | "richtext";

type TFsFieldLogicCheck = {
  field: string; // fieldId
  condition: "equals" | "greaterThan"; // not sure greaterThan is valid. Need to find all valid
  option: "Show"; // values of the target field (not the same as TFsFieldLogic.action)
};
type TFsFieldLogic = {
  action: "show";
  conditional: "all" | "any";
  checks: null | TFsFieldLogicCheck[];
};

type TFsGenericFieldType = {
  id: string;
  label: string;
  hide_label: boolean;
  description: string;
  name: string;
  type: TFsFieldType;
  options?:
    | null
    | string
    | {
        label: string;
        value: string;
      }[];
  required: boolean;
  uniq: boolean;
  hidden: boolean;
  readonly: boolean;
  colspan: number;
  sort: number; //  something like field-on-form order
  logic: TFsFieldLogic; // ?
  calculation: null | object; // ?  not sure of the shape
  workflow_access: "write"; //  what other possibilities
  default: string | object; // matrix use options array
};

type TFsFieldAddress = TFsGenericFieldType & {
  text_size: number;
  visible_subfields: string[]; // example ["address", ..., "zip"]
  show_country: boolean; // exampe: 0 | 1
  format: "US"; // probably some others
  hide_address: boolean; // exampe: 0 | 1
  hide_address2: boolean; // exampe: 0 | 1
  hide_city: boolean; // exampe: 0 | 1
  hide_state: boolean; // exampe: 0 | 1
  hide_zip: boolean; // exampe: 0 | 1
};

type TFsFieldCheckbox = TFsGenericFieldType & {
  option_layout: "vertical"; // probably others
  option_other: boolean; // example 0 | 1;
  randomize_options: boolean; // example 0 | 1;
  option_store: "value"; // probably others
  option_show_values: boolean; // example 0 | 1;
  use_images: boolean; // example 0 | 1;
  image_dimensions: "customDimensions"; // probably others
  image_height: number;
  image_width: number;
  lock_image_ratio: boolean;
  lock_image_ratio_option: "fitProportionally"; // probably others
  image_label_alignment: "bottom"; // probably others
  option_checkall: boolean; // example 0 | 1;
  hide_option_button: boolean; // example 0 | 1;
};

type TFsFieldCreditCard = TFsGenericFieldType & {
  text_size: number;
  accept_visa: boolean; // example "0" | "1"
  accept_mastercard: boolean; // example "0" | "1"
  accept_amex: boolean; // example "0" | "1"
  accept_discover: boolean; // example "0" | "1"
  accept_dinersclub: boolean; // example "0" | "1"
  accept_jcb: boolean; // example "0" | "1"
  version: number;
};

type TFsFieldDateTime = TFsGenericFieldType & {
  date_format: string; // example:  "M d, Y",
  max_date: string;
  time_format: string; // example:  "h:i A",
  year_minus: number;
  year_plus: number;
  field_one_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  field_two_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  calculation_units: string; // not sure what this is supposed to be
  calculation_operator: string; // not sure what this is supposed to be
  calculation_type: string; // not sure what this is supposed to be
};
type TFsFieldEmail = TFsGenericFieldType & {
  text_size: number;
  placeholder: string;
  confirm: boolean; // example: 0 | 1
};
type TFsFieldEmbed = TFsGenericFieldType & { section_text: string };
type TFsFieldFile = TFsGenericFieldType & {
  text_size: number;
  file_types: string; // example: "jpg,jpeg,gif,png,bmp..."
};
type TFsFieldMatrix = TFsGenericFieldType & {
  row_choices: string; //  Example: "Row 1\nRow 2\nRow 3"
  column_choices: string; //example: "Column 1\nColumn 2\nColumn 3"
  one_per_row: boolean; // "0" | "1"
  one_per_column: boolean; // "0" | "1"
  randomize_rows: boolean; // "0" | "1"
};
type TFsFieldName = TFsGenericFieldType & {
  show_prefix: boolean; //example: 0 |1
  show_middle: boolean; //example: 0 |1
  show_initial: boolean; //example: 0 |1
  show_suffix: boolean; //example: 0 |1
  middle_initial_optional: boolean; //example: 0 |1
  middle_name_optional: boolean; //example: 0 |1
  prefix_optional: boolean; //example: 0 |1
  suffix_optional: boolean; //example: 0 |1

  text_size: number;
};
type TFsFieldNumber = TFsGenericFieldType & {
  text_size: number;
  slider: boolean; // example: "0" | "1"
  decimals: number; // example "0"
  min_value: number; // example "",
  max_value: number; // example "",
  calculation_category: string; // what is this
  currency: string; // maybe currency symbol?
  placeholder: string;
  calculation_allow_negatives: boolean; // example: 0 | 1
  field_one_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  field_two_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  calculation_units: string; // not sure what this is supposed to be
  calculation_operator: string; // not sure what this is supposed to be
  calculation_type: string; // not sure what this is supposed to be
};
type TFsFieldPhone = TFsGenericFieldType & {
  text_size: number;
  placeholder: string;
  phone_format: string;
};
type TFsFieldProduct = TFsGenericFieldType & {
  charge_type: "fixed_amount"; //probably has other options
  image: string;
  inventory: ""; // probaby has wonky time, string -> empty, number non empty?
  inventory_mode: "unlimited";
  unit_price: number | string; // string representing a number, or empty?
  min_quantity: number;
  max_quantity: number;
  soldout_action: "message"; // probably other actions
  is_soldout: boolean;
  display: "default"; // probably others
  currency: string; // maybe currency symbol?
};
type TFsFieldRating = TFsGenericFieldType & {
  add_na: boolean;
  allow_half_ratings: boolean;
  count: number;
  icon: "star";
}; // icon probable has other values
type TFsFieldRichText = TFsGenericFieldType & {
  section_text: string;
  text_editor: "wysiwyg"; // probably other options
};
type TFFieldSelect = TFsGenericFieldType & {
  // drop down list
  select_size: number;
};
type TFsFieldSection = TFsGenericFieldType & {
  num_columns: number;
  label_position: "default";
  section_heading: string;
  section_break: number;
  section_text: string;
  text_editor: "wysiwyg"; // probably other options
}; // label_position probably has other values, section_break not sure it's purpose
type TFsFieldTextArea = TFsGenericFieldType & {
  // what should the properties by
  placeholder: string;
  maxlength: number;
  minlength: number;
  rows: number;
  cols: number;
};
type TFsFieldText = TFsGenericFieldType & {
  // short answer (maybe another?)
  placeholder: string;
  maxlength: number;
  minlength: number;
  text_size: number;
  hide_input_characters: boolean; //example 0 | 1
  remove_data_from_emails: boolean; //example 0 | 1
  require_confirmation: boolean; //example 0 | 1
  confirmationText: string;
  restrict_data_access: boolean; //example 0 | 1
  calculation_allow_negatives: boolean; // example: 0 | 1
  field_one_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  field_two_calculation: number; // not sure what this is supposed to be? fieldId or some constant or both
  calculation_units: string; // not sure what this is supposed to be
  calculation_operator: string; // not sure what this is supposed to be
  calculation_type: string; // not sure what this is supposed to be
};

export {
  TFsFieldAddress,
  TFsFieldCheckbox,
  TFsFieldCreditCard,
  TFsFieldDateTime,
  TFsFieldEmail,
  TFsFieldEmbed,
  TFsFieldFile,
  TFsFieldMatrix,
  TFsFieldName,
  TFsFieldNumber,
  TFsFieldPhone,
  TFsFieldProduct,
  TFsFieldRating,
  TFsFieldRichText,
  TFFieldSelect,
  TFsFieldSection,
  TFsFieldTextArea,
  TFsFieldText,
  TFsGenericFieldType,
};
