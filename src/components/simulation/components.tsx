import { Button, Label, Tooltip } from "components/ui";
import showToast from "components/ui/core/notifications";
import Switch from "components/ui/core/Switch";
import { ReactNode, useEffect } from "react";
import {
  ArrayPath,
  FieldArray,
  FieldValues,
  UseFieldArrayReturn,
  useFormContext,
} from "react-hook-form";
import { FiInfo, FiPlus } from "react-icons/fi";

export const LabelWithInfo = ({
  label,
  infoCont,
}: {
  label: string;
  infoCont: ReactNode;
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Label className="mb-0">{label}</Label>
      <Tooltip content={<p className="text-center">{infoCont}</p>}>
        <div className="-ml-1 self-center rounded p-2 hover:bg-gray-200">
          <FiInfo className="h-3 w-3" />
        </div>
      </Tooltip>
    </div>
  );
};

export const RecordsList = <T extends FieldValues>({
  name,
  infoCont,
  hidden,
  isDisabled,
  fieldArray,
  newRecordShape,
  switchOnChecked,
  children,
}: {
  name: string;
  infoCont: ReactNode;
  hidden: boolean;
  isDisabled: boolean;
  fieldArray: UseFieldArrayReturn<T>;
  newRecordShape: FieldArray<T, ArrayPath<T>>;
  switchOnChecked: () => void;
  children: (index: number) => ReactNode;
}) => {
  const form = useFormContext();

  const { fields, append } = fieldArray;

  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    if (errors[name] && errors[name]?.message) {
      showToast(errors[name]?.message as string, "error");
    }
  }, [errors[name]]);

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <LabelWithInfo label={name.toUpperCase()} infoCont={infoCont} />
        <Tooltip content={`${hidden ? "Enable" : "Disable"} ${name}`}>
          <div className="self-center rounded-md p-2 hover:bg-gray-200">
            <Switch
              name="Hidden"
              checked={!hidden}
              onCheckedChange={() => {
                switchOnChecked();
              }}
            />
          </div>
        </Tooltip>
      </div>

      {!hidden && (
        <>
          <ul className="space-y-4">
            {fields.map((field, index) => (
              <li key={field.id}>
                <div className="flex items-center space-x-3" key={index}>
                  {children(index)}
                </div>
              </li>
            ))}
          </ul>

          <Button
            color="primary"
            disabled={isDisabled}
            className="mt-3"
            onClick={() => {
              append(newRecordShape);
            }}
          >
            <FiPlus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
