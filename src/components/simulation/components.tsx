import { useAutoAnimate } from "@formkit/auto-animate/react";
import classNames from "classnames";
import { Button, Label, Tooltip } from "components/ui";
import showToast from "components/ui/core/notifications";
import Switch from "components/ui/core/Switch";
import { capitalize } from "lodash";
import { ReactNode, useEffect } from "react";
import {
  ArrayPath,
  FieldArray,
  FieldValues,
  UseFieldArrayReturn,
  useFormContext,
} from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import { BsInfoCircle } from "react-icons/bs";

export const TitleWithInfo = ({
  Title,
  infoCont,
  className,
  infoIconClassName,
}: {
  Title: React.ElementType;
  infoCont: ReactNode;
  className?: string;
  infoIconClassName?: string;
}) => {
  return (
    <div className={classNames("flex items-center space-x-1", className)}>
      <Title className="mb-0" />
      <Tooltip content={<p className="text-center">{infoCont}</p>}>
        <div className="-ml-1 self-center rounded p-2 hover:bg-gray-200">
          <BsInfoCircle className={classNames("h-3 w-3", infoIconClassName)} />
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
  const [recordsAnimationParentRef] = useAutoAnimate<HTMLUListElement>();

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
        <TitleWithInfo
          Title={() => <Label className="!m-0">{capitalize(name)}</Label>}
          infoCont={infoCont}
        />
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
          <ul className="space-y-4" ref={recordsAnimationParentRef}>
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
